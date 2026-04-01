"use client";

import { useState } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { parseEventLogs, type Hash } from "viem";

import { baseSimpleGovernAbi } from "@/lib/abi/baseSimpleGovernAbi";
import { APP_NAME, BASE_APP_ID, CONTRACT_ADDRESS, DATA_SUFFIX, MIN_STAKE_WEI } from "@/lib/contracts";
import { addStoredActivity } from "@/utils/activity";
import { trackTransaction } from "@/utils/track";

type PendingAction = "idle" | "propose" | "vote" | "conclude" | "withdraw";
type TxResult = { txHash: Hash };

export function useTrackedGovern() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [pendingAction, setPendingAction] = useState<PendingAction>("idle");

  const execute = async (
    action: PendingAction,
    parameters: {
      address: typeof CONTRACT_ADDRESS;
      abi: typeof baseSimpleGovernAbi;
      functionName: string;
      args?: readonly unknown[];
      value?: bigint;
      dataSuffix?: `0x${string}`;
    },
    activity: {
      type: "Proposed" | "Voted" | "Concluded" | "Withdrawn";
      title: string;
      description: string;
      proposalId?: number;
    },
  ): Promise<TxResult> => {
    setPendingAction(action);

    try {
      const txHash = await writeContractAsync(parameters as never);

      if (address) {
        addStoredActivity({
          type: activity.type,
          title: activity.title,
          description: activity.description,
          proposalId: activity.proposalId,
          txHash,
        });
        void trackTransaction(BASE_APP_ID, APP_NAME, address, txHash);
      }

      if (publicClient) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
        try {
          parseEventLogs({
            abi: baseSimpleGovernAbi,
            logs: receipt.logs,
          });
        } catch {
          // Parsing is best-effort only.
        }
      }

      return { txHash };
    } finally {
      setPendingAction("idle");
    }
  };

  return {
    pendingAction,
    proposeTracked: async ({
      description,
      durationSeconds,
      snapshotId,
    }: {
      description: string;
      durationSeconds: bigint;
      snapshotId: bigint;
    }) =>
      execute(
        "propose",
        {
          address: CONTRACT_ADDRESS,
          abi: baseSimpleGovernAbi,
          functionName: "propose",
          args: [description, durationSeconds, snapshotId],
          value: MIN_STAKE_WEI,
          dataSuffix: DATA_SUFFIX,
        },
        {
          type: "Proposed",
          title: "Proposal submitted",
          description: `Created a proposal with ${durationSeconds.toString()} seconds duration and snapshot ${snapshotId.toString()}.`,
        },
      ),
    voteTracked: async ({ id, support }: { id: bigint; support: boolean }) =>
      execute(
        "vote",
        {
          address: CONTRACT_ADDRESS,
          abi: baseSimpleGovernAbi,
          functionName: "vote",
          args: [id, support],
          dataSuffix: DATA_SUFFIX,
        },
        {
          type: "Voted",
          title: `Vote ${support ? "for" : "against"} submitted`,
          description: `Submitted an on-chain ${support ? "for" : "against"} vote for proposal ${id.toString()}.`,
          proposalId: Number(id),
        },
      ),
    concludeTracked: async ({
      id,
      totalSupplyEstimate,
    }: {
      id: bigint;
      totalSupplyEstimate: bigint;
    }) =>
      execute(
        "conclude",
        {
          address: CONTRACT_ADDRESS,
          abi: baseSimpleGovernAbi,
          functionName: "conclude",
          args: [id, totalSupplyEstimate],
          dataSuffix: DATA_SUFFIX,
        },
        {
          type: "Concluded",
          title: "Proposal conclusion submitted",
          description: `Submitted conclusion for proposal ${id.toString()} using external totalSupplyEstimate ${totalSupplyEstimate.toString()}.`,
          proposalId: Number(id),
        },
      ),
    withdrawStakeTracked: async ({ id }: { id: bigint }) =>
      execute(
        "withdraw",
        {
          address: CONTRACT_ADDRESS,
          abi: baseSimpleGovernAbi,
          functionName: "withdrawStake",
          args: [id],
          dataSuffix: DATA_SUFFIX,
        },
        {
          type: "Withdrawn",
          title: "Stake withdrawal submitted",
          description: `Submitted stake withdrawal for proposal ${id.toString()}.`,
          proposalId: Number(id),
        },
      ),
  };
}

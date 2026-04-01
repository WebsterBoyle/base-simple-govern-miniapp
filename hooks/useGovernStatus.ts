"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import type { Address } from "viem";
import { zeroAddress } from "viem";

import { baseSimpleGovernAbi } from "@/lib/abi/baseSimpleGovernAbi";
import { governanceTokenAbi } from "@/lib/abi/governanceTokenAbi";
import {
  CONTRACT_ADDRESS,
  ENV_GOVERNANCE_TOKEN_ADDRESS,
  formatTokenAmount,
  getProposalStatus,
  type ProposalStatus,
} from "@/lib/contracts";

type ProposalRaw = readonly [
  Address,
  string,
  bigint,
  bigint,
  bigint,
  bigint,
  boolean,
  bigint,
  boolean,
  bigint,
];

export type ProposalView = {
  id: number;
  proposer: Address;
  description: string;
  start: bigint;
  end: bigint;
  forVotes: bigint;
  againstVotes: bigint;
  executed: boolean;
  stakeETH: bigint;
  stakeWithdrawn: boolean;
  snapshotId: bigint;
  status: ProposalStatus;
  statusLabel: string;
  hasVoted: boolean;
  executionPassed?: boolean;
  forVotesDisplay: string;
  againstVotesDisplay: string;
  participationDisplay: string;
};

export function useGovernStatus(targetId?: number) {
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const [loading, setLoading] = useState(true);
  const [proposalCount, setProposalCount] = useState(0);
  const [proposals, setProposals] = useState<ProposalView[]>([]);
  const [governanceTokenAddress, setGovernanceTokenAddress] = useState<Address | undefined>(
    ENV_GOVERNANCE_TOKEN_ADDRESS === zeroAddress ? undefined : ENV_GOVERNANCE_TOKEN_ADDRESS,
  );
  const [votingPower, setVotingPower] = useState("0");
  const [effectiveVotingPower, setEffectiveVotingPower] = useState("0");

  const refresh = useCallback(async () => {
    if (!publicClient) return;
    setLoading(true);

    try {
      const [countResult, tokenResult] = await Promise.all([
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: baseSimpleGovernAbi,
          functionName: "proposalCount",
        }) as Promise<bigint>,
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: baseSimpleGovernAbi,
          functionName: "governanceToken",
        }) as Promise<Address>,
      ]);

      const count = Number(countResult);
      setProposalCount(count);
      setGovernanceTokenAddress(tokenResult);

      const recentIds = new Set<number>();
      for (let cursor = count; cursor >= Math.max(1, count - 11); cursor -= 1) {
        recentIds.add(cursor);
      }
      if (targetId && targetId > 0 && targetId <= count) recentIds.add(targetId);

      const orderedIds = Array.from(recentIds).sort((a, b) => b - a);
      const proposalResults = orderedIds.length
        ? await publicClient.multicall({
            contracts: orderedIds.map((id) => ({
              address: CONTRACT_ADDRESS,
              abi: baseSimpleGovernAbi,
              functionName: "proposals",
              args: [BigInt(id)],
            })),
          })
        : [];

      const hasVotedResults =
        address && orderedIds.length
          ? await publicClient.multicall({
              contracts: orderedIds.map((id) => ({
                address: CONTRACT_ADDRESS,
                abi: baseSimpleGovernAbi,
                functionName: "hasVoted",
                args: [BigInt(id), address],
              })),
            })
          : [];

      const executedEntries = await Promise.all(
        orderedIds.map(async (id, index) => {
          const result = proposalResults[index]?.result as ProposalRaw | undefined;
          if (!result?.[6]) return [id, undefined] as const;

          try {
            const events = await publicClient.getContractEvents({
              address: CONTRACT_ADDRESS,
              abi: baseSimpleGovernAbi,
              eventName: "ProposalExecuted",
              args: { id: BigInt(id) },
              fromBlock: 0n,
            });
            return [id, events.at(-1)?.args?.passed] as const;
          } catch {
            return [id, undefined] as const;
          }
        }),
      );

      const executionMap = new Map<number, boolean | undefined>(executedEntries);
      const nextProposals = orderedIds
        .map((id, index) => {
          const result = proposalResults[index]?.result as ProposalRaw | undefined;
          if (!result) return undefined;
          const hasVoted = address ? Boolean(hasVotedResults[index]?.result) : false;
          return mapProposal(id, result, hasVoted, executionMap.get(id));
        })
        .filter(Boolean) as ProposalView[];

      setProposals(nextProposals);

      if (address && tokenResult && tokenResult !== zeroAddress) {
        const currentPower = await readVotingPower(publicClient, tokenResult, address);
        setVotingPower(formatTokenAmount(currentPower));

        const targetProposal = nextProposals.find((item) => item.id === targetId);
        if (targetProposal) {
          try {
            const snapshotPower =
              targetProposal.snapshotId > 0n
                ? ((await publicClient.readContract({
                    address: tokenResult,
                    abi: governanceTokenAbi,
                    functionName: "balanceOfAt",
                    args: [address, targetProposal.snapshotId],
                  })) as bigint)
                : currentPower;
            setEffectiveVotingPower(formatTokenAmount(snapshotPower));
          } catch {
            setEffectiveVotingPower(formatTokenAmount(currentPower));
          }
        } else {
          setEffectiveVotingPower(formatTokenAmount(currentPower));
        }
      } else {
        setVotingPower("0");
        setEffectiveVotingPower("0");
      }
    } finally {
      setLoading(false);
    }
  }, [address, publicClient, targetId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const activeProposals = useMemo(
    () => proposals.filter((proposal) => proposal.status === "active"),
    [proposals],
  );

  const endsSoon = useMemo(
    () => [...activeProposals].sort((a, b) => Number(a.end - b.end)),
    [activeProposals],
  );

  return {
    loading,
    proposalCount,
    proposals,
    activeProposals,
    endsSoon,
    proposal: proposals.find((item) => item.id === targetId),
    governanceTokenAddress,
    governanceTokenConfigured: Boolean(governanceTokenAddress && governanceTokenAddress !== zeroAddress),
    votingPower,
    effectiveVotingPower,
    refresh,
  };
}

async function readVotingPower(publicClient: NonNullable<ReturnType<typeof usePublicClient>>, token: Address, user: Address) {
  try {
    return (await publicClient.readContract({
      address: token,
      abi: governanceTokenAbi,
      functionName: "balanceOf",
      args: [user],
    })) as bigint;
  } catch {
    return 0n;
  }
}

function mapProposal(
  id: number,
  proposal: ProposalRaw,
  hasVoted: boolean,
  executionPassed?: boolean,
): ProposalView {
  const [proposer, description, start, end, forVotes, againstVotes, executed, stakeETH, stakeWithdrawn, snapshotId] =
    proposal;
  const status = getProposalStatus({ start, end, executed });
  const participation = forVotes + againstVotes;

  return {
    id,
    proposer,
    description,
    start,
    end,
    forVotes,
    againstVotes,
    executed,
    stakeETH,
    stakeWithdrawn,
    snapshotId,
    status,
    statusLabel:
      status === "active"
        ? "Active"
        : status === "ended"
          ? "Ready to conclude"
          : executionPassed === true
            ? "Passed"
            : executionPassed === false
              ? "Rejected"
              : "Executed",
    hasVoted,
    executionPassed,
    forVotesDisplay: formatTokenAmount(forVotes),
    againstVotesDisplay: formatTokenAmount(againstVotes),
    participationDisplay: formatTokenAmount(participation),
  };
}

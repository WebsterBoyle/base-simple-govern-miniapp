"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAccount } from "wagmi";

import { BottomNav } from "@/components/BottomNav";
import { ProposalDetailCard } from "@/components/ProposalDetailCard";
import { StatusToast } from "@/components/StatusToast";
import { VotePanel } from "@/components/VotePanel";
import { WalletButton } from "@/components/WalletButton";
import { useGovernStatus } from "@/hooks/useGovernStatus";
import { useTrackedGovern } from "@/hooks/useTrackedGovern";

function useQueryProposalId() {
  if (typeof window === "undefined") return undefined;
  const raw = new URLSearchParams(window.location.search).get("id");
  if (!raw) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

export default function ProposalPage() {
  const { address, isConnected } = useAccount();
  const queryId = useQueryProposalId();
  const { proposal, effectiveVotingPower, loading, refresh } = useGovernStatus(queryId);
  const { voteTracked, concludeTracked, withdrawStakeTracked, pendingAction } = useTrackedGovern();

  const [totalSupplyEstimate, setTotalSupplyEstimate] = useState("");
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const stakeVisible = useMemo(() => {
    if (!proposal || !address) return false;
    return proposal.proposer.toLowerCase() === address.toLowerCase() && !proposal.stakeWithdrawn;
  }, [address, proposal]);

  const handleVote = async (support: boolean) => {
    if (!proposal) return;

    try {
      const result = await voteTracked({ id: BigInt(proposal.id), support });
      setToast({
        kind: "success",
        message: `${support ? "For" : "Against"} vote sent. Tx: ${result.txHash.slice(0, 10)}...`,
      });
      await refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Vote failed.";
      setToast({ kind: "error", message });
    }
  };

  const handleConclude = async () => {
    if (!proposal) return;
    const parsed = Number(totalSupplyEstimate);

    if (!Number.isFinite(parsed) || parsed < 0) {
      setToast({ kind: "error", message: "Enter an external total supply estimate first." });
      return;
    }

    try {
      const result = await concludeTracked({
        id: BigInt(proposal.id),
        totalSupplyEstimate: BigInt(Math.floor(parsed)),
      });
      setToast({
        kind: "success",
        message: `Conclusion sent. Tx: ${result.txHash.slice(0, 10)}...`,
      });
      await refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Conclusion failed.";
      setToast({ kind: "error", message });
    }
  };

  const handleWithdraw = async () => {
    if (!proposal) return;

    try {
      const result = await withdrawStakeTracked({ id: BigInt(proposal.id) });
      setToast({
        kind: "success",
        message: `Withdraw request sent. Tx: ${result.txHash.slice(0, 10)}...`,
      });
      await refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Withdraw failed.";
      setToast({ kind: "error", message });
    }
  };

  return (
    <>
      <main className="app-shell">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-full bg-white px-4 text-sm font-medium text-governance-ink shadow-panel"
            >
              Back
            </Link>
            <WalletButton />
          </div>

          <section className="panel-surface rounded-panel p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-governance-blueSoft">
              Proposal Decision Page
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-governance-ink">
              {proposal ? `Proposal #${proposal.id}` : "Select a proposal"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-governance-muted">
              Vote with current token balance or snapshot-compatible balance when available. Conclusion finalizes the proposal outcome on-chain, but it does not automatically execute sensitive off-chain actions.
            </p>
          </section>

          {loading && (
            <section className="panel-surface rounded-panel p-4 text-sm text-governance-muted">
              Loading proposal state from Base...
            </section>
          )}

          {!loading && !proposal && (
            <section className="panel-surface rounded-panel p-4 text-sm text-governance-muted">
              No proposal ID was found. Open this page with a query like <span className="font-semibold">/proposal?id=1</span>.
            </section>
          )}

          {proposal && (
            <>
              <ProposalDetailCard proposal={proposal} votingPower={effectiveVotingPower} />
              <VotePanel
                proposal={proposal}
                connected={isConnected}
                effectiveVotingPower={effectiveVotingPower}
                totalSupplyEstimate={totalSupplyEstimate}
                onTotalSupplyEstimateChange={setTotalSupplyEstimate}
                onVoteFor={() => handleVote(true)}
                onVoteAgainst={() => handleVote(false)}
                onConclude={handleConclude}
                onWithdraw={handleWithdraw}
                withdrawVisible={stakeVisible}
                pendingAction={pendingAction}
              />
            </>
          )}
        </div>
      </main>

      <BottomNav />
      <StatusToast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}

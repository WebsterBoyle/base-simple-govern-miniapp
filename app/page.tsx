"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";

import { BottomNav } from "@/components/BottomNav";
import { GovernanceHero } from "@/components/GovernanceHero";
import { ProposalCard } from "@/components/ProposalCard";
import { StatusToast } from "@/components/StatusToast";
import { VotingPowerPanel } from "@/components/VotingPowerPanel";
import { WalletButton } from "@/components/WalletButton";
import { useGovernStatus } from "@/hooks/useGovernStatus";
import { useTrackedGovern } from "@/hooks/useTrackedGovern";
import { formatTimestamp, MIN_STAKE_ETH } from "@/lib/contracts";

export default function HomePage() {
  const { isConnected } = useAccount();
  const {
    proposals,
    activeProposals,
    endsSoon,
    votingPower,
    governanceTokenAddress,
    governanceTokenConfigured,
    loading,
    refresh,
    proposalCount,
  } = useGovernStatus();
  const { proposeTracked, pendingAction } = useTrackedGovern();

  const [formOpen, setFormOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [durationSeconds, setDurationSeconds] = useState("86400");
  const [snapshotId, setSnapshotId] = useState("0");
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const heroEndsSoon = useMemo(() => {
    const next = endsSoon[0];
    return next ? `Proposal #${next.id} ends ${formatTimestamp(next.end)}` : "No proposal is close to expiry right now";
  }, [endsSoon]);

  const handleCreate = async () => {
    const duration = Number(durationSeconds);
    const snapshot = Number(snapshotId);

    if (!description.trim()) {
      setToast({ kind: "error", message: "Add a proposal description before submitting." });
      return;
    }

    if (!Number.isFinite(duration) || duration < 3600 || duration > 30 * 24 * 60 * 60) {
      setToast({ kind: "error", message: "Duration must stay between 1 hour and 30 days." });
      return;
    }

    if (!Number.isFinite(snapshot) || snapshot < 0) {
      setToast({ kind: "error", message: "Snapshot ID must be zero or a positive integer." });
      return;
    }

    try {
      const result = await proposeTracked({
        description: description.trim(),
        durationSeconds: BigInt(Math.floor(duration)),
        snapshotId: BigInt(Math.floor(snapshot)),
      });

      setToast({
        kind: "success",
        message: `Proposal submitted. Tx: ${result.txHash.slice(0, 10)}...`,
      });
      setDescription("");
      setSnapshotId("0");
      setDurationSeconds("86400");
      setFormOpen(false);
      await refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Proposal submission failed.";
      setToast({ kind: "error", message });
    }
  };

  return (
    <>
      <main className="app-shell">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-governance-blueSoft">
                Governance / Voting Mini App
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-governance-ink">BaseSimpleGovern</h1>
            </div>
            <WalletButton />
          </div>

          <GovernanceHero
            activeCount={activeProposals.length}
            totalCount={proposalCount}
            endsSoonLabel={heroEndsSoon}
            onCreateClick={() => setFormOpen((current) => !current)}
            createOpen={formOpen}
          />

          <div className="grid grid-cols-2 gap-3">
            <VotingPowerPanel
              value={votingPower}
              tokenAddress={governanceTokenAddress}
              tokenConfigured={governanceTokenConfigured}
            />

            <section className="panel-surface rounded-panel p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-governance-blueSoft">
                Ends Soon
              </p>
              <div className="mt-3 space-y-2">
                {endsSoon.slice(0, 2).map((proposal) => (
                  <div key={proposal.id} className="rounded-2xl bg-governance-bg p-3">
                    <p className="text-sm font-semibold text-governance-ink">Proposal #{proposal.id}</p>
                    <p className="mt-1 text-xs text-governance-muted">{formatTimestamp(proposal.end)}</p>
                  </div>
                ))}
                {!endsSoon.length && (
                  <p className="rounded-2xl bg-governance-bg p-3 text-sm text-governance-muted">
                    No active proposal is nearing its end yet.
                  </p>
                )}
              </div>
            </section>
          </div>

          {formOpen && (
            <section className="panel-surface rounded-panel p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-governance-blueSoft">
                    Create Proposal
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-governance-ink">Stake-backed proposal entry</h2>
                </div>
                <div className="rounded-full bg-governance-bg px-3 py-2 text-xs font-medium text-governance-muted">
                  Stake {MIN_STAKE_ETH} ETH
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-governance-ink">Description</span>
                  <textarea
                    className="min-h-28 w-full rounded-3xl border border-[#d7ddf4] bg-white px-4 py-3 text-sm outline-none transition focus:border-governance-blue"
                    placeholder="Describe the proposal decision in plain language."
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-governance-ink">Duration Seconds</span>
                    <input
                      className="h-12 w-full rounded-2xl border border-[#d7ddf4] bg-white px-4 text-sm outline-none focus:border-governance-blue"
                      inputMode="numeric"
                      value={durationSeconds}
                      onChange={(event) => setDurationSeconds(event.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-governance-ink">Snapshot ID</span>
                    <input
                      className="h-12 w-full rounded-2xl border border-[#d7ddf4] bg-white px-4 text-sm outline-none focus:border-governance-blue"
                      inputMode="numeric"
                      value={snapshotId}
                      onChange={(event) => setSnapshotId(event.target.value)}
                    />
                  </label>
                </div>

                <div className="rounded-3xl bg-governance-bg p-4 text-sm text-governance-muted">
                  Current contract supports proposal creation, token-weighted voting, and conclusion. Proposal execution here means finalizing the result on-chain, not automatically executing sensitive actions.
                </div>

                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={!isConnected || pendingAction === "propose"}
                  className="min-h-11 w-full rounded-3xl bg-governance-blue px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4059dd] disabled:cursor-not-allowed disabled:bg-[#b8c2f8]"
                >
                  {pendingAction === "propose" ? "Submitting proposal..." : "Create Proposal"}
                </button>
              </div>
            </section>
          )}

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-governance-blueSoft">
                  Active Proposals
                </p>
                <h2 className="mt-1 text-lg font-semibold text-governance-ink">Agenda board</h2>
              </div>
              <span className="rounded-full bg-white/75 px-3 py-2 text-xs font-medium text-governance-muted shadow-panel">
                {activeProposals.length} active
              </span>
            </div>

            {loading && (
              <div className="panel-surface rounded-panel p-4 text-sm text-governance-muted">
                Reading on-chain governance status...
              </div>
            )}

            {!loading && proposals.length === 0 && (
              <div className="panel-surface rounded-panel p-4 text-sm text-governance-muted">
                No proposals are available yet. Connect a wallet to seed the first agenda item.
              </div>
            )}

            <div className="space-y-3">
              {(activeProposals.length ? activeProposals : proposals).map((proposal) => (
                <ProposalCard key={proposal.id} proposal={proposal} />
              ))}
            </div>
          </section>
        </div>
      </main>

      <BottomNav />
      <StatusToast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}

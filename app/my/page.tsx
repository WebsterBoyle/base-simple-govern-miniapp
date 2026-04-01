"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";

import { BottomNav } from "@/components/BottomNav";
import { ProposalCard } from "@/components/ProposalCard";
import { VotingPowerPanel } from "@/components/VotingPowerPanel";
import { WalletButton } from "@/components/WalletButton";
import { useGovernStatus } from "@/hooks/useGovernStatus";

export default function MyPage() {
  const { address, isConnected } = useAccount();
  const { proposals, votingPower, governanceTokenAddress, governanceTokenConfigured } = useGovernStatus();
  const [tab, setTab] = useState<"proposals" | "votes">("proposals");

  const myProposals = useMemo(() => {
    if (!address) return [];
    return proposals.filter((proposal) => proposal.proposer.toLowerCase() === address.toLowerCase());
  }, [address, proposals]);

  const myVotes = useMemo(() => {
    if (!address) return [];
    return proposals.filter((proposal) => proposal.hasVoted);
  }, [address, proposals]);

  const pendingStake = useMemo(() => {
    return myProposals.filter((proposal) => !proposal.stakeWithdrawn && proposal.stakeETH > 0n);
  }, [myProposals]);

  return (
    <>
      <main className="app-shell">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-governance-blueSoft">
                My Governance
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-governance-ink">Participation panel</h1>
            </div>
            <WalletButton />
          </div>

          <section className="grid grid-cols-2 gap-3">
            <VotingPowerPanel
              value={votingPower}
              tokenAddress={governanceTokenAddress}
              tokenConfigured={governanceTokenConfigured}
            />
            <div className="panel-surface rounded-panel p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-governance-blueSoft">
                Stake Status
              </p>
              <div className="mt-3 space-y-2">
                <div className="rounded-2xl bg-governance-bg p-3">
                  <p className="text-sm font-semibold text-governance-ink">{pendingStake.length}</p>
                  <p className="mt-1 text-xs text-governance-muted">Recent proposals with stake still visible on-chain.</p>
                </div>
                <div className="rounded-2xl bg-governance-bg p-3">
                  <p className="text-sm font-semibold text-governance-ink">{myVotes.length}</p>
                  <p className="mt-1 text-xs text-governance-muted">Recent loaded proposals where this wallet has voted.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="panel-surface rounded-panel p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-governance-blueSoft">
              My governance summary
            </p>
            <p className="mt-3 text-sm leading-6 text-governance-muted">
              This personal view is intentionally honest: it shows your recent on-chain proposals plus the recent loaded proposal set where your wallet has already voted. It does not claim a full chain-wide delegate or indexer view.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex rounded-full bg-white/75 p-1 shadow-panel">
              <button
                type="button"
                onClick={() => setTab("proposals")}
                className={`min-h-11 flex-1 rounded-full text-sm font-medium ${
                  tab === "proposals" ? "bg-governance-blue text-white" : "text-governance-muted"
                }`}
              >
                My Proposals
              </button>
              <button
                type="button"
                onClick={() => setTab("votes")}
                className={`min-h-11 flex-1 rounded-full text-sm font-medium ${
                  tab === "votes" ? "bg-governance-blue text-white" : "text-governance-muted"
                }`}
              >
                My Votes
              </button>
            </div>

            {!isConnected && (
              <div className="panel-surface rounded-panel p-4 text-sm text-governance-muted">
                Connect a wallet to load your governance participation summary.
              </div>
            )}

            {isConnected && tab === "proposals" && (
              <div className="space-y-3">
                {myProposals.length ? (
                  myProposals.map((proposal) => <ProposalCard key={proposal.id} proposal={proposal} />)
                ) : (
                  <div className="panel-surface rounded-panel p-4 text-sm text-governance-muted">
                    No recent proposals from this wallet were found in the loaded governance window.
                  </div>
                )}
              </div>
            )}

            {isConnected && tab === "votes" && (
              <div className="space-y-3">
                {myVotes.length ? (
                  myVotes.map((proposal) => <ProposalCard key={proposal.id} proposal={proposal} />)
                ) : (
                  <div className="panel-surface rounded-panel p-4 text-sm text-governance-muted">
                    No recent voted proposal was found in the current on-chain read window.
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      <BottomNav />
    </>
  );
}

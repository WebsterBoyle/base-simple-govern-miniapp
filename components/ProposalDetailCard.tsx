import type { ProposalView } from "@/hooks/useGovernStatus";
import { formatEther, formatTimestamp, getProposalStatusTone } from "@/lib/contracts";

type ProposalDetailCardProps = {
  proposal: ProposalView;
  votingPower: string;
};

export function ProposalDetailCard({ proposal, votingPower }: ProposalDetailCardProps) {
  return (
    <section className="panel-surface rounded-panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-governance-blueSoft">
            Proposal header
          </p>
          <h2 className="mt-1 text-xl font-semibold text-governance-ink">Proposal #{proposal.id}</h2>
        </div>
        <span className={`rounded-full px-3 py-2 text-xs font-semibold ${getProposalStatusTone(proposal.status)}`}>
          {proposal.statusLabel}
        </span>
      </div>

      <div className="mt-4 rounded-[28px] bg-governance-bg p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-governance-blueSoft">Description</p>
        <p className="mt-2 text-sm leading-6 text-governance-ink">{proposal.description}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-governance-bg p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-governance-muted">Start</p>
          <p className="mt-1 text-sm font-semibold text-governance-ink">{formatTimestamp(proposal.start)}</p>
        </div>
        <div className="rounded-3xl bg-governance-bg p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-governance-muted">End</p>
          <p className="mt-1 text-sm font-semibold text-governance-ink">{formatTimestamp(proposal.end)}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-white p-3 shadow-panel">
          <p className="text-xs uppercase tracking-[0.16em] text-governance-muted">For votes</p>
          <p className="mt-1 text-base font-semibold text-governance-ink">{proposal.forVotesDisplay}</p>
        </div>
        <div className="rounded-3xl bg-white p-3 shadow-panel">
          <p className="text-xs uppercase tracking-[0.16em] text-governance-muted">Against votes</p>
          <p className="mt-1 text-base font-semibold text-governance-ink">{proposal.againstVotesDisplay}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-governance-muted">
        <div className="rounded-3xl bg-governance-bg p-3">
          <p>
            Executed: <span className="font-semibold text-governance-ink">{proposal.executed ? "Yes" : "No"}</span>
          </p>
          <p className="mt-2">
            Stake withdrawn:{" "}
            <span className="font-semibold text-governance-ink">{proposal.stakeWithdrawn ? "Yes" : "No"}</span>
          </p>
        </div>
        <div className="rounded-3xl bg-governance-bg p-3">
          <p>
            Has voted: <span className="font-semibold text-governance-ink">{proposal.hasVoted ? "Yes" : "No"}</span>
          </p>
          <p className="mt-2">
            Your power: <span className="font-semibold text-governance-ink">{votingPower}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-3xl bg-white p-4 shadow-panel">
        <p className="text-xs uppercase tracking-[0.16em] text-governance-muted">Stake locked on-chain</p>
        <p className="mt-1 text-base font-semibold text-governance-ink">{formatEther(proposal.stakeETH)} ETH</p>
      </div>
    </section>
  );
}

import type { ProposalView } from "@/hooks/useGovernStatus";

type VotePanelProps = {
  proposal: ProposalView;
  connected: boolean;
  effectiveVotingPower: string;
  totalSupplyEstimate: string;
  onTotalSupplyEstimateChange: (value: string) => void;
  onVoteFor: () => void;
  onVoteAgainst: () => void;
  onConclude: () => void;
  onWithdraw: () => void;
  withdrawVisible: boolean;
  pendingAction: "idle" | "propose" | "vote" | "conclude" | "withdraw";
};

export function VotePanel({
  proposal,
  connected,
  effectiveVotingPower,
  totalSupplyEstimate,
  onTotalSupplyEstimateChange,
  onVoteFor,
  onVoteAgainst,
  onConclude,
  onWithdraw,
  withdrawVisible,
  pendingAction,
}: VotePanelProps) {
  const canVote = connected && proposal.status === "active" && effectiveVotingPower !== "0";
  const canConclude = connected && proposal.status !== "active" && !proposal.executed;

  return (
    <section className="space-y-4">
      <div className="panel-surface rounded-panel p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-governance-blueSoft">Vote panel</p>
        <p className="mt-3 text-sm leading-6 text-governance-muted">
          Voting power is based on token balance, or snapshot-compatible balance when the token supports it. Snapshot behavior depends on token support.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onVoteFor}
            disabled={!canVote || pendingAction === "vote" || proposal.hasVoted}
            className="min-h-11 rounded-3xl bg-governance-accent px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#9dd7d2]"
          >
            {pendingAction === "vote" ? "Sending..." : "Vote For"}
          </button>
          <button
            type="button"
            onClick={onVoteAgainst}
            disabled={!canVote || pendingAction === "vote" || proposal.hasVoted}
            className="min-h-11 rounded-3xl bg-governance-danger px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#f0afb6]"
          >
            {pendingAction === "vote" ? "Sending..." : "Vote Against"}
          </button>
        </div>
      </div>

      <div className="panel-surface rounded-panel p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-governance-blueSoft">Conclude</p>
        <p className="mt-3 text-sm leading-6 text-governance-muted">
          This value is supplied externally. The contract does not automatically fetch a trusted total supply estimate for conclusion.
        </p>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-medium text-governance-ink">totalSupplyEstimate</span>
          <input
            className="h-12 w-full rounded-2xl border border-[#d7ddf4] bg-white px-4 text-sm outline-none focus:border-governance-blue"
            inputMode="numeric"
            value={totalSupplyEstimate}
            onChange={(event) => onTotalSupplyEstimateChange(event.target.value)}
            placeholder="Enter external total supply estimate"
          />
        </label>

        <button
          type="button"
          onClick={onConclude}
          disabled={!canConclude || pendingAction === "conclude"}
          className="mt-4 min-h-11 w-full rounded-3xl bg-governance-blue px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#b8c2f8]"
        >
          {pendingAction === "conclude" ? "Submitting conclusion..." : "Conclude Proposal"}
        </button>
      </div>

      {withdrawVisible && (
        <div className="panel-surface rounded-panel p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-governance-blueSoft">Withdraw stake</p>
          <p className="mt-3 text-sm leading-6 text-governance-muted">
            Stake refund may succeed during conclude or require manual withdrawal later.
          </p>
          <button
            type="button"
            onClick={onWithdraw}
            disabled={pendingAction === "withdraw"}
            className="mt-4 min-h-11 w-full rounded-3xl bg-white px-5 py-3 text-sm font-semibold text-governance-ink shadow-panel"
          >
            {pendingAction === "withdraw" ? "Submitting withdraw..." : "Withdraw Stake"}
          </button>
        </div>
      )}
    </section>
  );
}

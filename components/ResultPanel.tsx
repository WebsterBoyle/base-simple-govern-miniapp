import type { ProposalView } from "@/hooks/useGovernStatus";

type ResultPanelProps = {
  proposal: ProposalView;
};

export function ResultPanel({ proposal }: ResultPanelProps) {
  const outcomeLabel = proposal.executed
    ? proposal.executionPassed === true
      ? "Passed"
      : proposal.executionPassed === false
        ? "Rejected"
        : "Concluded"
    : "Pending";

  const outcomeTone =
    outcomeLabel === "Passed"
      ? "bg-[#daf5e7] text-governance-success"
      : outcomeLabel === "Rejected"
        ? "bg-[#fde3e7] text-governance-danger"
        : "bg-[#e7ebff] text-governance-blue";

  return (
    <section className="panel-surface rounded-panel p-4">
      <div className="rounded-[28px] bg-[linear-gradient(180deg,#FFFFFF_0%,#EEF2FF_100%)] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-governance-blueSoft">Result hero</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-governance-ink">Proposal #{proposal.id}</h2>
            <p className="mt-2 max-w-[260px] text-sm leading-6 text-governance-muted">{proposal.description}</p>
          </div>
          <span className={`rounded-full px-4 py-3 text-sm font-semibold ${outcomeTone}`}>{outcomeLabel}</span>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-3xl bg-white p-4 shadow-panel">
            <p className="text-xs uppercase tracking-[0.16em] text-governance-muted">For</p>
            <p className="mt-1 text-lg font-semibold text-governance-ink">{proposal.forVotesDisplay}</p>
          </div>
          <div className="rounded-3xl bg-white p-4 shadow-panel">
            <p className="text-xs uppercase tracking-[0.16em] text-governance-muted">Against</p>
            <p className="mt-1 text-lg font-semibold text-governance-ink">{proposal.againstVotesDisplay}</p>
          </div>
          <div className="rounded-3xl bg-white p-4 shadow-panel">
            <p className="text-xs uppercase tracking-[0.16em] text-governance-muted">Participation</p>
            <p className="mt-1 text-lg font-semibold text-governance-ink">{proposal.participationDisplay}</p>
          </div>
        </div>

        <div className="mt-5 rounded-3xl bg-white p-4 shadow-panel">
          <p className="text-sm font-semibold text-governance-ink">
            Stake returned: <span className="text-governance-muted">{proposal.stakeWithdrawn ? "Yes" : "Not yet"}</span>
          </p>
          <p className="mt-2 text-sm leading-6 text-governance-muted">
            Current contract finalizes proposal outcome on-chain. Sensitive actions should still be handled off-chain or by multisig, and more advanced governance execution can be added in a future upgrade.
          </p>
        </div>
      </div>
    </section>
  );
}

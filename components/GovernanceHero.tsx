type GovernanceHeroProps = {
  activeCount: number;
  totalCount: number;
  endsSoonLabel: string;
  createOpen: boolean;
  onCreateClick: () => void;
};

export function GovernanceHero({
  activeCount,
  totalCount,
  endsSoonLabel,
  createOpen,
  onCreateClick,
}: GovernanceHeroProps) {
  return (
    <section className="panel-surface overflow-hidden rounded-panel p-5">
      <div className="rounded-[28px] bg-[linear-gradient(135deg,#4A67FF_0%,#6F7CFF_62%,#A8B4FF_100%)] p-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/80">Governance Agenda</p>
            <h2 className="mt-2 text-2xl font-semibold leading-tight">
              Track proposals, vote with token power, and conclude outcomes.
            </h2>
          </div>
          <div className="rounded-3xl bg-white/15 px-4 py-3 text-right backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-white/70">Active</p>
            <p className="mt-1 text-2xl font-semibold">{activeCount}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-white/12 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-white/70">Total proposals</p>
            <p className="mt-2 text-lg font-semibold">{totalCount}</p>
          </div>
          <div className="rounded-3xl bg-white/12 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-white/70">Ends soon</p>
            <p className="mt-2 text-sm leading-5 text-white/90">{endsSoonLabel}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCreateClick}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-governance-blue"
        >
          {createOpen ? "Hide Proposal Form" : "Create Proposal"}
        </button>
      </div>
    </section>
  );
}

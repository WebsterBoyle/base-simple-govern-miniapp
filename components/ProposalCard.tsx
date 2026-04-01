import Link from "next/link";

import type { ProposalView } from "@/hooks/useGovernStatus";
import { formatTimestamp, getProposalStatusTone } from "@/lib/contracts";

type ProposalCardProps = {
  proposal: ProposalView;
};

export function ProposalCard({ proposal }: ProposalCardProps) {
  const tone = getProposalStatusTone(proposal.status);

  return (
    <Link href={`/proposal?id=${proposal.id}`} className="block">
      <article className="panel-surface rounded-panel p-4 transition hover:-translate-y-[1px]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-governance-blueSoft">
              Proposal #{proposal.id}
            </p>
            <h3 className="mt-2 text-base font-semibold leading-6 text-governance-ink">
              {proposal.description || "Untitled governance proposal"}
            </h3>
          </div>
          <span className={`rounded-full px-3 py-2 text-xs font-semibold ${tone}`}>{proposal.statusLabel}</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-governance-bg p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-governance-muted">For</p>
            <p className="mt-1 text-sm font-semibold text-governance-ink">{proposal.forVotesDisplay}</p>
          </div>
          <div className="rounded-3xl bg-governance-bg p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-governance-muted">Against</p>
            <p className="mt-1 text-sm font-semibold text-governance-ink">{proposal.againstVotesDisplay}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 text-xs text-governance-muted">
          <span>Ends {formatTimestamp(proposal.end)}</span>
          <span>{proposal.hasVoted ? "You voted" : "Open detail"}</span>
        </div>
      </article>
    </Link>
  );
}

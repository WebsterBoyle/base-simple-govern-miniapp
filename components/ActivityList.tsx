import Link from "next/link";

import { formatLocalTime } from "@/lib/contracts";
import type { GovernanceActivity, GovernanceActivityType } from "@/utils/activity";

type ActivityListProps = {
  items: GovernanceActivity[];
  filter: GovernanceActivityType | "All";
};

export function ActivityList({ items, filter }: ActivityListProps) {
  const filtered = filter === "All" ? items : items.filter((item) => item.type === filter);

  if (!filtered.length) {
    return (
      <section className="panel-surface rounded-panel p-4 text-sm text-governance-muted">
        No matching recent governance action was recorded in this browser yet.
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {filtered.map((item) => (
        <article key={item.id} className="panel-surface rounded-panel p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="rounded-full bg-governance-bg px-3 py-2 text-xs font-semibold text-governance-blue">
                {item.type}
              </span>
              <p className="mt-3 text-sm font-semibold text-governance-ink">{item.title}</p>
              <p className="mt-2 text-xs text-governance-muted">{formatLocalTime(item.timestamp)}</p>
            </div>
            {item.proposalId ? (
              <Link
                href={`/proposal?id=${item.proposalId}`}
                className="inline-flex min-h-11 items-center rounded-full bg-white px-4 text-xs font-semibold text-governance-ink shadow-panel"
              >
                Proposal #{item.proposalId}
              </Link>
            ) : null}
          </div>
          <p className="mt-3 text-sm leading-6 text-governance-muted">{item.description}</p>
          <p className="mt-3 break-all text-xs text-governance-blueSoft">{item.txHash}</p>
        </article>
      ))}
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";

import { ActivityList } from "@/components/ActivityList";
import { BottomNav } from "@/components/BottomNav";
import { WalletButton } from "@/components/WalletButton";
import { getStoredActivities, type GovernanceActivity, type GovernanceActivityType } from "@/utils/activity";

export default function ActivityPage() {
  const [filter, setFilter] = useState<GovernanceActivityType | "All">("All");
  const [items, setItems] = useState<GovernanceActivity[]>([]);

  useEffect(() => {
    const load = () => setItems(getStoredActivities());
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  return (
    <>
      <main className="app-shell">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-governance-blueSoft">
                Activity
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-governance-ink">Recent governance actions</h1>
            </div>
            <WalletButton />
          </div>

          <section className="panel-surface rounded-panel p-4">
            <p className="text-sm leading-6 text-governance-muted">
              This page intentionally shows recent local and session-level governance activity summaries. It does not pretend to be a complete chain-wide proposal indexer.
            </p>
          </section>

          <div className="grid grid-cols-5 gap-2">
            {(["All", "Proposed", "Voted", "Concluded", "Withdrawn"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`min-h-11 rounded-2xl px-2 text-xs font-semibold ${
                  filter === item ? "bg-governance-blue text-white" : "bg-white text-governance-muted shadow-panel"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <ActivityList items={items} filter={filter} />
        </div>
      </main>

      <BottomNav />
    </>
  );
}

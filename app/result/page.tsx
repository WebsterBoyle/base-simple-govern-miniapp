"use client";

import Link from "next/link";

import { BottomNav } from "@/components/BottomNav";
import { ResultPanel } from "@/components/ResultPanel";
import { WalletButton } from "@/components/WalletButton";
import { useGovernStatus } from "@/hooks/useGovernStatus";

function useQueryProposalId() {
  if (typeof window === "undefined") return undefined;
  const raw = new URLSearchParams(window.location.search).get("id");
  if (!raw) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

export default function ResultPage() {
  const queryId = useQueryProposalId();
  const { proposal, loading } = useGovernStatus(queryId);

  return (
    <>
      <main className="app-shell">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-governance-blueSoft">
                Result Board
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-governance-ink">Outcome announcement</h1>
            </div>
            <WalletButton />
          </div>

          {loading && (
            <section className="panel-surface rounded-panel p-4 text-sm text-governance-muted">
              Loading proposal result...
            </section>
          )}

          {!loading && !proposal && (
            <section className="panel-surface rounded-panel p-4 text-sm text-governance-muted">
              Open this page with a proposal ID such as <span className="font-semibold">/result?id=1</span>.
            </section>
          )}

          {proposal && <ResultPanel proposal={proposal} />}

          {proposal && (
            <div className="grid grid-cols-2 gap-3">
              <Link
                href={`/proposal?id=${proposal.id}`}
                className="inline-flex min-h-11 items-center justify-center rounded-3xl bg-governance-blue px-5 py-3 text-sm font-semibold text-white"
              >
                View Proposal
              </Link>
              <Link
                href="/my"
                className="inline-flex min-h-11 items-center justify-center rounded-3xl bg-white px-5 py-3 text-sm font-semibold text-governance-ink shadow-panel"
              >
                Open My Panel
              </Link>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </>
  );
}

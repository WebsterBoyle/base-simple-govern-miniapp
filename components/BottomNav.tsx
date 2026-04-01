"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Board" },
  { href: "/proposal", label: "Proposal" },
  { href: "/result", label: "Result" },
  { href: "/activity", label: "Activity" },
  { href: "/my", label: "My" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4">
      <div className="mx-auto flex max-w-[480px] items-center justify-between rounded-[28px] border border-white/70 bg-white/90 p-2 shadow-panel backdrop-blur">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex min-h-11 flex-1 items-center justify-center rounded-[22px] px-3 text-xs font-semibold ${
                active ? "bg-governance-blue text-white" : "text-governance-muted"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

"use client";

import { useEffect } from "react";

type StatusToastProps = {
  toast: { kind: "success" | "error"; message: string } | null;
  onClose: () => void;
};

export function StatusToast({ toast, onClose }: StatusToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(onClose, 4200);
    return () => window.clearTimeout(timer);
  }, [onClose, toast]);

  if (!toast) return null;

  return (
    <div className="fixed left-1/2 top-4 z-50 w-[calc(100%-32px)] max-w-[448px] -translate-x-1/2">
      <div
        className={`rounded-[24px] px-4 py-3 text-sm font-medium shadow-panel ${
          toast.kind === "success"
            ? "bg-[#daf5e7] text-governance-success"
            : "bg-[#fde3e7] text-governance-danger"
        }`}
      >
        {toast.message}
      </div>
    </div>
  );
}

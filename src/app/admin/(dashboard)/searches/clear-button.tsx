"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { clearSearchLogs } from "@/app/admin/actions/inquiries";
import { toastResult } from "@/components/admin/toaster";

export function ClearSearchesButton({ term }: { term?: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className={
        term
          ? "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-semibold text-red-700 hover:bg-red-50"
          : "text-paper-ink hover:border-ink/40 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--admin-border-strong)] bg-white px-4 text-[13px] font-semibold !text-red-700 transition hover:!border-red-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      }
      onClick={() => {
        const msg = term
          ? `Remove all searches for “${term}”?`
          : "Clear the whole search history? This cannot be undone.";
        if (!window.confirm(msg)) return;
        startTransition(async () => toastResult(await clearSearchLogs(term)));
      }}
    >
      <Trash2 className="size-3.5" /> {term ? "Remove" : "Clear history"}
    </button>
  );
}

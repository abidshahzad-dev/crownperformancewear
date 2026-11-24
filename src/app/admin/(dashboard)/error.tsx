"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { primaryButton, secondaryButton } from "@/components/admin/ui";

export default function DashboardError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const digest =
    error && typeof error === "object" && "digest" in error && typeof error.digest === "string" ? error.digest : null;

  return (
    <div className="mx-auto max-w-lg py-24 text-center">
      <span className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-red-50 text-red-600">
        <AlertTriangle className="size-7" />
      </span>
      <h1 className="text-paper-ink text-[22px] font-bold tracking-tight">Something went wrong</h1>
      <p className="text-paper-muted mt-2 text-[14px] leading-relaxed">
        This page could not load. Try again, and if it keeps happening check your Supabase connection.
      </p>
      {digest ? <p className="text-paper-muted mt-2 font-mono text-[11px]">Reference: {digest}</p> : null}
      <div className="mt-7 flex justify-center gap-2">
        <button type="button" onClick={retry} className={primaryButton}>
          <RotateCcw className="size-4" /> Try again
        </button>
        <Link href="/admin" className={secondaryButton}>
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

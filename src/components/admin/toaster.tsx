"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Toast = { id: number; message: string; ok: boolean };

const EVENT = "cpw-admin-toast";

/** Shows a short confirmation in the corner. Call from any client component. */
export function toast(message: string, ok = true) {
  window.dispatchEvent(new CustomEvent<Omit<Toast, "id">>(EVENT, { detail: { message, ok } }));
}

export function toastResult(result: { ok: boolean; message: string }) {
  toast(result.message, result.ok);
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let counter = 0;
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<Omit<Toast, "id">>).detail;
      const id = ++counter;
      setToasts((prev) => [...prev.slice(-3), { id, ...detail }]);
      window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), detail.ok ? 3200 : 6500);
    };
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);

  return (
    <div
      className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-[min(380px,calc(100vw-32px))] flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 text-[13px] font-semibold shadow-lg",
            t.ok ? "text-paper-ink border-emerald-200 bg-white" : "border-red-200 bg-red-50 text-red-800",
          )}
          role={t.ok ? "status" : "alert"}
        >
          {t.ok ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          ) : (
            <XCircle className="mt-0.5 size-4 shrink-0 text-red-600" />
          )}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

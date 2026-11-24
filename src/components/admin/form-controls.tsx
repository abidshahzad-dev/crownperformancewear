"use client";

import { AlertCircle, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FormField({
  label,
  help,
  error,
  children,
  className,
  htmlFor,
  count,
}: {
  label: string;
  help?: string;
  error?: string;
  children: ReactNode;
  className?: string;
  htmlFor?: string;
  /** Character counter shown next to the label, e.g. for SEO fields. */
  count?: { value: number; max: number };
}) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-paper-ink block text-[12px] font-bold">
          {label}
        </label>
        {count ? (
          <span
            className={cn(
              "text-[11px] font-semibold tabular-nums",
              count.value > count.max ? "text-amber-700" : "text-paper-muted",
            )}
          >
            {count.value}/{count.max}
          </span>
        ) : null}
      </div>
      {children}
      {help && !error ? <p className="text-paper-muted mt-1.5 text-[12px] leading-relaxed">{help}</p> : null}
      {error ? (
        <p className="mt-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-red-700" role="alert">
          <AlertCircle className="size-3.5 shrink-0" /> {error}
        </p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "w-full rounded-lg border border-black/[0.14] bg-white px-3 py-2 text-[14px] text-paper-ink shadow-[0_1px_1px_rgba(7,19,27,0.03)] outline-none transition placeholder:text-paper-muted/60 hover:border-black/25 focus:border-ink focus:ring-[3px] focus:ring-signal/50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70";

export function Toggle({
  checked,
  onChange,
  label,
  srLabel,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  /** Accessible name when no visible label is shown. */
  srLabel?: string;
  disabled?: boolean;
}) {
  return (
    <label className={cn("inline-flex items-center gap-2.5", disabled ? "opacity-50" : "cursor-pointer")}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label ?? srLabel}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors duration-200",
          checked ? "bg-[#5d9c00] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]" : "bg-slate-300",
        )}
      >
        <span
          className={cn(
            "absolute top-[3px] size-4 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)] transition-transform duration-200",
            checked ? "translate-x-[19px]" : "translate-x-[3px]",
          )}
        />
      </button>
      {label ? <span className="text-paper-ink text-[13px] font-semibold">{label}</span> : null}
    </label>
  );
}

/** Tag-style editor for string arrays: type and press Enter or comma. */
export function StringListInput({
  value,
  onChange,
  placeholder = "Type and press Enter",
  id,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  id?: string;
}) {
  const [draft, setDraft] = useState("");

  const commit = (raw: string) => {
    const parts = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!parts.length) return;
    const next = [...value];
    for (const p of parts) if (!next.includes(p)) next.push(p);
    onChange(next);
    setDraft("");
  };

  return (
    <div className="focus-within:border-ink focus-within:ring-signal/50 flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-lg border border-black/[0.14] bg-white px-2 py-1.5 transition focus-within:ring-[3px] hover:border-black/25">
      {value.map((item, i) => (
        <span
          key={`${item}-${i}`}
          className="text-paper-ink inline-flex items-center gap-1 rounded-md bg-[#eef3e4] py-0.5 pr-1 pl-2 text-[12px] font-semibold"
        >
          {item}
          <button
            type="button"
            aria-label={`Remove ${item}`}
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
            className="text-paper-muted hover:text-paper-ink rounded p-0.5 hover:bg-black/10"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => {
          if (e.target.value.endsWith(",")) commit(e.target.value);
          else setDraft(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit(draft);
          } else if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => commit(draft)}
        placeholder={value.length ? "" : placeholder}
        className="text-paper-ink placeholder:text-paper-muted/60 min-w-[140px] flex-1 bg-transparent px-1 py-1 text-[14px] outline-none"
      />
    </div>
  );
}

/** Small "x unsaved changes" pill. */
export function DirtyIndicator({ dirty }: { dirty: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[12px] font-semibold transition-opacity",
        dirty ? "text-amber-700 opacity-100" : "text-paper-muted opacity-0",
      )}
      aria-live="polite"
    >
      <span className="size-1.5 rounded-full bg-amber-500" aria-hidden />
      Unsaved changes
    </span>
  );
}

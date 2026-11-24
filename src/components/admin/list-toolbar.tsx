import { Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { inputClass } from "./form-controls";
import { secondaryButton } from "./ui";

/** GET search/filter form for list pages. Works without JavaScript. */
export function ListToolbar({
  action,
  q,
  filters,
  trash,
  count,
  noun = "items",
}: {
  action: string;
  q?: string;
  filters?: Array<{ name: string; value?: string; label: string; options: Array<{ value: string; label: string }> }>;
  trash?: boolean;
  count?: number;
  noun?: string;
}) {
  const hasFilters = Boolean(q || filters?.some((f) => f.value));
  return (
    <form
      action={action}
      className="flex flex-wrap items-center gap-2 border-b border-black/[0.06] bg-[#fcfcfa] p-3"
      role="search"
    >
      {trash ? <input type="hidden" name="trash" value="1" /> : null}
      <div className="relative min-w-[200px] flex-1">
        <Search className="text-paper-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <input name="q" defaultValue={q} placeholder="Search…" className={`${inputClass} pl-9`} aria-label="Search" />
      </div>
      {filters?.map((f) => (
        <div key={f.name} className="relative">
          <SlidersHorizontal className="text-paper-muted pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
          <select
            name={f.name}
            defaultValue={f.value ?? ""}
            className={`${inputClass} w-auto pl-8`}
            aria-label={f.label}
          >
            <option value="">{f.label}</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      ))}
      <button type="submit" className={secondaryButton}>
        Apply
      </button>
      {hasFilters ? (
        <Link
          href={trash ? `${action}?trash=1` : action}
          className="text-paper-muted hover:text-paper-ink inline-flex items-center gap-1 px-2 text-[12px] font-semibold"
        >
          <X className="size-3.5" /> Clear
        </Link>
      ) : null}
      {count != null ? (
        <span className="text-paper-muted ml-auto pl-2 text-[12px] font-semibold whitespace-nowrap">
          {count} {noun}
        </span>
      ) : null}
    </form>
  );
}

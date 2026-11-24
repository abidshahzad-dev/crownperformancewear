import { ChevronLeft, ChevronRight, ChevronRight as Sep, Inbox, Plus, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

/**
 * Sticky page bar: breadcrumb, title and primary actions. The description renders below the bar so
 * the bar keeps a fixed height (list headers stick right under it).
 */
export function PageHeader({
  title,
  description,
  back,
  actions,
  breadcrumbs,
}: {
  title: string;
  description?: ReactNode;
  back?: { href: string; label: string };
  actions?: ReactNode;
  breadcrumbs?: Crumb[];
}) {
  const crumbs: Crumb[] =
    breadcrumbs ??
    (title === "Dashboard" && !back
      ? [{ label: "Dashboard" }]
      : [
          { label: "Dashboard", href: "/admin" },
          ...(back ? [{ label: back.label, href: back.href }] : []),
          { label: title },
        ]);

  return (
    <>
      <div className="sticky top-14 z-20 -mx-4 mb-1 border-b border-[var(--admin-border)] bg-[var(--admin-bg)]/90 px-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-10 lg:px-10">
        <div className="flex min-h-[76px] flex-col justify-center gap-3 py-3 sm:flex-row sm:items-center sm:justify-between lg:h-[88px] lg:py-0">
          <div className="min-w-0">
            <nav aria-label="Breadcrumb" className="mb-1">
              <ol className="text-paper-muted flex min-w-0 items-center gap-1 text-[12px] font-medium">
                {crumbs.length > 1 ? (
                  crumbs.map((c, i) => (
                    <li key={`${c.label}-${i}`} className="flex min-w-0 items-center gap-1">
                      {i > 0 ? <Sep className="size-3 shrink-0 opacity-50" aria-hidden /> : null}
                      {c.href && i < crumbs.length - 1 ? (
                        <Link href={c.href} className="hover:text-paper-ink truncate transition-colors">
                          {c.label}
                        </Link>
                      ) : (
                        <span className={cn("truncate", i === crumbs.length - 1 && "text-paper-ink/70")}>
                          {c.label}
                        </span>
                      )}
                    </li>
                  ))
                ) : (
                  <li>Crown Performance Wear</li>
                )}
              </ol>
            </nav>
            <h1 className="text-paper-ink flex min-w-0 items-center gap-2 text-[22px] font-bold tracking-[-0.03em] sm:text-[24px]">
              {back ? (
                <Link
                  href={back.href}
                  aria-label={`Back to ${back.label}`}
                  className="text-paper-muted hover:text-paper-ink -ml-1 grid size-7 shrink-0 place-items-center rounded-md transition-colors hover:bg-black/5"
                >
                  <ChevronLeft className="size-5" />
                </Link>
              ) : null}
              <span className="truncate">{title}</span>
            </h1>
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      </div>
      {description ? (
        <div className="text-paper-muted mb-6 max-w-3xl pt-3 text-[14px] leading-relaxed">{description}</div>
      ) : (
        <div className="mb-6" />
      )}
    </>
  );
}

export const primaryButton =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-ink px-4 text-[13px] font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_1px_2px_rgba(7,19,27,0.2)] transition hover:bg-ink-3 disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButton =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--admin-border-strong)] bg-white px-4 text-[13px] font-semibold text-paper-ink transition hover:border-ink/40 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60";

export const dangerButton =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-[13px] font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60";

export function NewButton({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className={primaryButton}>
      <Plus className="text-signal size-4" /> {label}
    </Link>
  );
}

export function Card({
  children,
  className,
  title,
  description,
  actions,
  bodyClassName,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-[var(--admin-border)] bg-white shadow-[0_1px_2px_rgba(7,19,27,0.04),0_8px_24px_-16px_rgba(7,19,27,0.12)]",
        className,
      )}
    >
      {title ? (
        <header className="flex items-start justify-between gap-4 border-b border-black/[0.06] px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-paper-ink text-[15px] font-bold">{title}</h2>
            {description ? <p className="text-paper-muted mt-0.5 text-[13px]">{description}</p> : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </header>
      ) : null}
      <div className={cn(title ? "p-5" : "", bodyClassName)}>{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  href,
  hint,
  highlight = false,
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  href?: string;
  hint?: ReactNode;
  highlight?: boolean;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className={cn("text-[12px] font-semibold", highlight ? "text-white/70" : "text-paper-muted")}>
          {label}
        </span>
        <span
          className={cn(
            "grid size-8 place-items-center rounded-lg",
            highlight ? "bg-signal text-ink" : "bg-[#f1f4ec] text-[#4c6b12]",
          )}
        >
          <Icon className="size-4" strokeWidth={2} />
        </span>
      </div>
      <p className={cn("mt-3 text-[30px] leading-none font-bold tracking-[-0.04em]", highlight && "text-white")}>
        {value}
      </p>
      {hint ? <p className={cn("mt-2 text-[12px]", highlight ? "text-signal" : "text-paper-muted")}>{hint}</p> : null}
    </>
  );
  const cls = cn(
    "group block rounded-2xl border p-4 transition-all",
    highlight
      ? "border-ink bg-ink shadow-[0_12px_30px_-18px_rgba(7,19,27,0.8)] hover:-translate-y-0.5"
      : "border-[var(--admin-border)] bg-white hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-[0_12px_30px_-20px_rgba(7,19,27,0.35)]",
  );
  return href ? (
    <Link href={href} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

const BADGE_TONES = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  gray: "bg-slate-100 text-slate-600 ring-slate-500/20",
  lime: "bg-[#efffcc] text-[#3b5b00] ring-[#7fb800]/30",
  amber: "bg-amber-50 text-amber-800 ring-amber-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/20",
} as const;

const DOT_TONES = {
  green: "bg-emerald-500",
  gray: "bg-slate-400",
  lime: "bg-[#7fb800]",
  amber: "bg-amber-500",
  red: "bg-red-500",
  blue: "bg-sky-500",
} as const;

export type BadgeTone = keyof typeof BADGE_TONES;

export function Badge({
  children,
  tone = "gray",
  dot = true,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ring-1 ring-inset",
        BADGE_TONES[tone],
      )}
    >
      {dot ? <span className={cn("size-1.5 rounded-full", DOT_TONES[tone])} aria-hidden /> : null}
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  text,
  action,
  icon: Icon = Inbox,
}: {
  title: string;
  text?: string;
  action?: ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="relative mx-auto mb-5 size-16">
        <span className="absolute inset-0 rotate-6 rounded-2xl bg-[#eef6dc]" aria-hidden />
        <span className="relative grid size-16 place-items-center rounded-2xl border border-[var(--admin-border)] bg-white shadow-sm">
          <Icon className="size-7 text-[#4c6b12]" strokeWidth={1.6} />
        </span>
      </div>
      <p className="text-paper-ink text-[16px] font-bold">{title}</p>
      {text ? <p className="text-paper-muted mx-auto mt-1.5 max-w-md text-[13px] leading-relaxed">{text}</p> : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

/**
 * Table wrapper. Scrolls horizontally on small screens; on large screens the header row sticks below
 * the page bar (the parent card must use `overflow-clip`, not `overflow-hidden`).
 */
export function Table({ children, minWidth = 640 }: { children: ReactNode; minWidth?: number }) {
  return (
    <div className="admin-scroll-light overflow-x-auto lg:overflow-visible">
      <table
        style={{ minWidth }}
        className="w-full text-left text-[13px] [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-[#f7fbec] [&_tbody_tr:nth-child(even)]:bg-[#fbfbf9] [&_tbody_tr:nth-child(even):hover]:bg-[#f7fbec]"
      >
        {children}
      </table>
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "text-paper-muted z-10 border-b border-black/[0.07] bg-[#f8f8f5] px-4 py-2.5 text-[11px] font-bold tracking-[0.08em] whitespace-nowrap uppercase lg:sticky lg:top-[88px]",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <td className={cn("text-paper-ink border-b border-black/[0.05] px-4 py-3 align-middle", className)}>{children}</td>
  );
}

export function Thumb({
  src,
  alt = "",
  size = "md",
}: {
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dims = size === "sm" ? "size-9" : size === "lg" ? "size-14" : "size-11";
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element -- admin thumbnails come from arbitrary hosts
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={cn(dims, "admin-checker shrink-0 rounded-lg object-cover ring-1 ring-black/10")}
    />
  ) : (
    <span
      className={cn(
        dims,
        "text-paper-muted grid shrink-0 place-items-center rounded-lg border border-dashed border-black/15 bg-slate-50 text-[9px] font-semibold uppercase",
      )}
    >
      None
    </span>
  );
}

/** Segmented "All / Trash" switch for list pages. */
export function TrashTabs({
  base,
  trash,
  counts,
}: {
  base: string;
  trash: boolean;
  counts?: { active?: number; trash?: number };
}) {
  return (
    <Segmented
      items={[
        { href: base, label: "All", count: counts?.active, active: !trash },
        { href: `${base}?trash=1`, label: "Trash", count: counts?.trash, active: trash },
      ]}
    />
  );
}

export function Segmented({
  items,
}: {
  items: Array<{ href: string; label: string; count?: number; active: boolean }>;
}) {
  return (
    <div className="admin-scroll-light inline-flex max-w-full gap-1 overflow-x-auto rounded-xl border border-[var(--admin-border)] bg-white p-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold whitespace-nowrap transition-colors",
            item.active ? "bg-ink text-white" : "text-paper-muted hover:text-paper-ink hover:bg-black/[0.04]",
          )}
        >
          {item.label}
          {item.count != null ? (
            <span
              className={cn(
                "rounded-full px-1.5 text-[11px] tabular-nums",
                item.active ? "bg-signal text-ink" : "bg-black/[0.06]",
              )}
            >
              {item.count}
            </span>
          ) : null}
        </Link>
      ))}
    </div>
  );
}

export function SetupNotice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-amber-300/80 bg-amber-50 p-5 text-[13px] leading-relaxed text-amber-900">
      <p className="font-bold">{title}</p>
      <div className="mt-1.5 space-y-2">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export const PAGE_SIZE = 25;

export function paginate<T>(items: T[], rawPage: unknown, size = PAGE_SIZE) {
  const pages = Math.max(1, Math.ceil(items.length / size));
  const parsed = typeof rawPage === "string" ? Number.parseInt(rawPage, 10) : 1;
  const page = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), pages) : 1;
  const start = (page - 1) * size;
  return {
    rows: items.slice(start, start + size),
    page,
    pages,
    total: items.length,
    start,
    end: Math.min(start + size, items.length),
  };
}

/** Footer with result range and previous/next links that keep the current query string. */
export function Pagination({
  base,
  params,
  page,
  pages,
  total,
  start,
  end,
  noun = "results",
}: {
  base: string;
  params: Record<string, string | string[] | undefined>;
  page: number;
  pages: number;
  total: number;
  start: number;
  end: number;
  noun?: string;
}) {
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (typeof v === "string" && v && k !== "page") sp.set(k, v);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${base}?${qs}` : base;
  };
  const link = (enabled: boolean) =>
    cn(
      "inline-flex min-h-9 items-center gap-1 rounded-lg border px-3 text-[12px] font-semibold transition",
      enabled
        ? "border-[var(--admin-border-strong)] bg-white text-paper-ink hover:border-ink/40"
        : "pointer-events-none border-transparent text-paper-muted/50",
    );
  return (
    <div className="text-paper-muted flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] px-4 py-3 text-[12px]">
      <p>
        {total === 0 ? (
          `No ${noun}`
        ) : (
          <>
            Showing <span className="text-paper-ink font-semibold">{start + 1}</span>–
            <span className="text-paper-ink font-semibold">{end}</span> of{" "}
            <span className="text-paper-ink font-semibold">{total}</span> {noun}
          </>
        )}
      </p>
      {pages > 1 ? (
        <div className="flex items-center gap-2">
          <Link href={href(page - 1)} className={link(page > 1)} aria-disabled={page <= 1}>
            <ChevronLeft className="size-3.5" /> Previous
          </Link>
          <span className="tabular-nums">
            {page} / {pages}
          </span>
          <Link href={href(page + 1)} className={link(page < pages)} aria-disabled={page >= pages}>
            Next <ChevronRight className="size-3.5" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeletons
// ---------------------------------------------------------------------------

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("admin-skeleton rounded-md", className)} aria-hidden />;
}

export function PageSkeleton({ variant = "list" }: { variant?: "list" | "form" | "dashboard" }) {
  return (
    <div aria-busy aria-label="Loading">
      <div className="-mx-4 mb-7 border-b border-[var(--admin-border)] px-4 py-5 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="mt-3 h-7 w-64" />
      </div>
      {variant === "dashboard" ? (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[118px] rounded-2xl" />
            ))}
          </div>
          <div className="mt-6 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </>
      ) : variant === "form" ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            <Skeleton className="h-72 rounded-2xl" />
            <Skeleton className="h-52 rounded-2xl" />
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : (
        <div className="overflow-clip rounded-2xl border border-[var(--admin-border)] bg-white">
          <div className="border-b border-black/[0.06] p-3">
            <Skeleton className="h-10 w-full max-w-md rounded-lg" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 border-b border-black/[0.05] px-4 py-3 last:border-0">
              <Skeleton className="size-11 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-1/3" />
                <Skeleton className="h-3 w-1/5" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

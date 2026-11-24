import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Check,
  FileText,
  Folder,
  HelpCircle,
  ImageIcon,
  Inbox,
  LayoutTemplate,
  Newspaper,
  Plus,
  Search,
  Settings,
  Shirt,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, EmptyState, PageHeader, StatCard, Table, Td, Th } from "@/components/admin/ui";
import { DEFAULT_SETTINGS } from "@/lib/cms/defaults";
import {
  catalogueHealth,
  countByIds,
  dashboardCounts,
  getSettingsData,
  inquiryActivity,
  listInquiries,
  searchStats,
  searchTotals,
  zeroResultSearches,
} from "@/lib/data/admin";
import { DEMO_CATEGORIES, DEMO_POSTS, DEMO_PRODUCTS, DEMO_SERVICES } from "@/lib/demo/catalog";
import { isS3Configured } from "@/lib/s3";
import { cn, formatDateTime } from "@/lib/utils";
import { statusLabel, statusTone } from "./inquiries/status";

export const metadata: Metadata = { title: "Dashboard" };

function trendText(thisWeek: number, lastWeek: number): string {
  if (!thisWeek && !lastWeek) return "No inquiries in the last 2 weeks";
  if (!lastWeek) return `${thisWeek} this week`;
  const change = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  return `${thisWeek} this week · ${change >= 0 ? "+" : ""}${change}% vs last week`;
}

const QUICK_ACTIONS: Array<{ href: string; label: string; text: string; icon: LucideIcon }> = [
  { href: "/admin/products/new", label: "Add product", text: "New wholesale style", icon: Plus },
  { href: "/admin/categories/new", label: "Add category", text: "New product family", icon: Folder },
  { href: "/admin/pages/system/home", label: "Edit home page", text: "Hero, sections, images", icon: LayoutTemplate },
  { href: "/admin/settings", label: "Site settings", text: "Brand, contact, menus", icon: Settings },
];

export default async function DashboardPage() {
  const [counts, inquiries, topSearches, zeroSearches, activity, health, settings, dummyProducts, dummyOther, totals] =
    await Promise.all([
      dashboardCounts(),
      listInquiries(),
      searchStats(6),
      zeroResultSearches(6),
      inquiryActivity(),
      catalogueHealth(),
      getSettingsData(),
      countByIds(
        "products",
        DEMO_PRODUCTS.map((p) => p.id),
      ),
      Promise.all([
        countByIds(
          "categories",
          DEMO_CATEGORIES.map((c) => c.id),
        ),
        countByIds(
          "services",
          DEMO_SERVICES.map((s) => s.id),
        ),
        countByIds(
          "posts",
          DEMO_POSTS.map((p) => p.id),
        ),
      ]).then((n) => n.reduce((a, b) => a + b, 0)),
      searchTotals(),
    ]);

  const str = (key: string) => (typeof settings[key] === "string" ? (settings[key] as string) : "");
  const checklist = [
    {
      done: Boolean(str("logo_url")),
      title: "Upload your logo",
      text: "Replace the crown mark in the header and footer.",
      href: "/admin/settings",
    },
    {
      done:
        Boolean(str("email")) &&
        str("email") !== DEFAULT_SETTINGS.email &&
        str("phone") !== DEFAULT_SETTINGS.phone &&
        str("whatsapp") !== DEFAULT_SETTINGS.whatsapp,
      title: "Set your real contact details",
      text: "Sales email, phone and WhatsApp are still placeholders.",
      href: "/admin/settings",
    },
    {
      done: isS3Configured(),
      title: "Connect image uploads",
      text: "Add storage keys so you can upload product photos.",
      href: "/admin/media",
    },
    {
      done: dummyProducts === 0,
      title: "Replace the dummy products",
      text: `${dummyProducts} sample product${dummyProducts === 1 ? "" : "s"} still live in the catalogue.`,
      href: "/admin/products",
    },
    {
      done: dummyOther === 0,
      title: "Replace sample categories, services and articles",
      text: `${dummyOther} sample item${dummyOther === 1 ? "" : "s"} left from the starter content.`,
      href: "/admin/categories",
    },
  ];
  const doneCount = checklist.filter((c) => c.done).length;
  const maxSearches = Math.max(1, ...topSearches.map((s) => s.searches));
  const newOnes = inquiries.filter((q) => q.status === "new").slice(0, 3);

  return (
    <div className="admin-fade-up">
      <PageHeader
        title="Dashboard"
        description="An overview of your catalogue, content and incoming wholesale leads."
        actions={
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="hover:border-ink/40 inline-flex min-h-10 items-center gap-2 rounded-lg border border-[var(--admin-border-strong)] bg-white px-4 text-[13px] font-semibold"
          >
            View website <ArrowUpRight className="size-4" />
          </a>
        }
      />

      {counts.newInquiries > 0 ? (
        <Link
          href="/admin/inquiries?status=new"
          className="group bg-ink mb-6 flex flex-col gap-4 overflow-hidden rounded-2xl p-5 text-white transition hover:shadow-[0_18px_40px_-24px_rgba(7,19,27,0.9)] sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-4">
            <span className="bg-signal text-ink relative grid size-12 shrink-0 place-items-center rounded-xl">
              <Inbox className="size-6" />
              <span className="bg-signal absolute -top-1 -right-1 size-3 animate-ping rounded-full opacity-70" />
            </span>
            <div>
              <p className="text-[17px] font-bold">
                {counts.newInquiries} new {counts.newInquiries === 1 ? "inquiry" : "inquiries"} waiting
              </p>
              <p className="text-[13px] text-white/60">
                {newOnes.map((q) => q.company || q.name || q.email).join(" · ")}
              </p>
            </div>
          </div>
          <span className="text-signal inline-flex items-center gap-2 text-[13px] font-bold">
            Review now <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Inquiries"
          value={counts.inquiries}
          icon={Inbox}
          href="/admin/inquiries"
          hint={trendText(activity.thisWeek, activity.lastWeek)}
          highlight={counts.newInquiries > 0}
        />
        <StatCard
          label="Products"
          value={counts.products}
          icon={Shirt}
          href="/admin/products"
          hint={
            health.hidden || health.withoutImages
              ? [
                  health.hidden ? `${health.hidden} hidden` : "",
                  health.withoutImages ? `${health.withoutImages} without photos` : "",
                ]
                  .filter(Boolean)
                  .join(" · ")
              : "All published with photos"
          }
        />
        <StatCard
          label="Categories"
          value={counts.categories}
          icon={Folder}
          href="/admin/categories"
          hint="Product families"
        />
        <StatCard
          label="Site searches"
          value={totals.total}
          icon={Search}
          href="/admin/searches"
          hint={`${totals.last30} in the last 30 days${zeroSearches.length ? ` · ${zeroSearches.length} with no results` : ""}`}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Services", value: counts.services, href: "/admin/services", icon: Briefcase },
          { label: "Insights", value: counts.posts, href: "/admin/insights", icon: Newspaper },
          { label: "FAQs", value: counts.faqs, href: "/admin/faqs", icon: HelpCircle },
          { label: "Custom pages", value: counts.pages, href: "/admin/pages", icon: FileText },
          { label: "Media files", value: counts.media, href: "/admin/media", icon: ImageIcon },
        ].map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group hover:border-ink/25 flex items-center gap-3 rounded-xl border border-[var(--admin-border)] bg-white px-4 py-3 transition"
          >
            <s.icon className="text-paper-muted group-hover:text-paper-ink size-4 transition-colors" />
            <span className="text-paper-muted flex-1 text-[12px] font-semibold">{s.label}</span>
            <span className="text-[15px] font-bold tabular-nums">{s.value}</span>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <Card
            title="Recent inquiries"
            description={`${counts.inquiries} total · ${counts.newInquiries} new`}
            actions={
              <Link
                href="/admin/inquiries"
                className="text-paper-ink inline-flex items-center gap-1 text-[12px] font-semibold hover:underline"
              >
                View all <ArrowRight className="size-3.5" />
              </Link>
            }
            className="overflow-clip"
            bodyClassName="p-0"
          >
            {inquiries.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No inquiries yet"
                text="Quote, catalogue and contact requests from the website appear here."
              />
            ) : (
              <Table minWidth={560}>
                <thead>
                  <tr>
                    <Th className="lg:static">From</Th>
                    <Th className="lg:static">Type</Th>
                    <Th className="lg:static">Status</Th>
                    <Th className="lg:static">Received</Th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.slice(0, 7).map((q) => (
                    <tr key={q.id} className={cn(q.status === "new" && "!bg-[#f8ffe9]")}>
                      <Td>
                        <Link href={`/admin/inquiries/${q.id}`} className="font-semibold hover:underline">
                          {q.name || q.email}
                        </Link>
                        <p className="text-paper-muted text-[12px]">{q.company || q.email}</p>
                      </Td>
                      <Td className="capitalize">{q.type}</Td>
                      <Td>
                        <Badge tone={statusTone(q.status)}>{statusLabel(q.status)}</Badge>
                      </Td>
                      <Td className="text-paper-muted whitespace-nowrap">{formatDateTime(q.created_at)}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>

          <Card title="Quick actions">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {QUICK_ACTIONS.map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="group hover:border-ink/30 rounded-xl border border-[var(--admin-border)] p-4 transition hover:bg-[#fbfdf5]"
                >
                  <span className="group-hover:bg-signal group-hover:text-ink mb-3 grid size-9 place-items-center rounded-lg bg-[#f1f4ec] text-[#4c6b12] transition-colors">
                    <a.icon className="size-4" />
                  </span>
                  <p className="text-[13px] font-bold">{a.label}</p>
                  <p className="text-paper-muted text-[12px]">{a.text}</p>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card
            title="Getting started"
            description={`${doneCount} of ${checklist.length} done`}
            actions={<Sparkles className="size-4 text-[#7fb800]" />}
          >
            <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
              <div
                className="bg-signal h-full rounded-full transition-all"
                style={{ width: `${(doneCount / checklist.length) * 100}%` }}
              />
            </div>
            <ul className="space-y-1">
              {checklist.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className="group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-black/[0.03]"
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border",
                        item.done ? "bg-signal text-ink border-[#7fb800]" : "border-black/20 bg-white",
                      )}
                    >
                      {item.done ? <Check className="size-3" strokeWidth={3} /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn("block text-[13px] font-semibold", item.done && "text-paper-muted line-through")}
                      >
                        {item.title}
                      </span>
                      {!item.done ? <span className="text-paper-muted block text-[12px]">{item.text}</span> : null}
                    </span>
                    {!item.done ? (
                      <ArrowRight className="text-paper-muted mt-0.5 size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card
            title="Top searches"
            description="What visitors look for on the site"
            actions={
              <Link
                href="/admin/searches"
                className="text-paper-ink inline-flex items-center gap-1 text-[12px] font-semibold hover:underline"
              >
                Details <ArrowRight className="size-3.5" />
              </Link>
            }
          >
            {topSearches.length === 0 ? (
              <p className="text-paper-muted text-[13px]">No searches recorded yet.</p>
            ) : (
              <ul className="space-y-3">
                {topSearches.map((s) => (
                  <li key={s.term}>
                    <div className="mb-1 flex items-center justify-between gap-3 text-[13px]">
                      <span className="truncate font-semibold">{s.term}</span>
                      <span className="text-paper-muted shrink-0 tabular-nums">{s.searches}×</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.05]">
                      <div
                        className={cn("h-full rounded-full", s.avg_results === 0 ? "bg-amber-400" : "bg-[#9bd61c]")}
                        style={{ width: `${Math.max(6, (s.searches / maxSearches) * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Searches with no results" description="Add products or tags for these terms">
            {zeroSearches.length === 0 ? (
              <p className="text-paper-muted text-[13px]">Nothing here. Every search found something.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {zeroSearches.map((s) => (
                  <Badge key={s.term} tone="amber">
                    {s.term} · {s.zero_result_searches}
                  </Badge>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

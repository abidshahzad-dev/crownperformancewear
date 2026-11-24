import { CalendarDays, Hash, Search, SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Badge,
  Card,
  EmptyState,
  PageHeader,
  Pagination,
  StatCard,
  Table,
  Td,
  Th,
  paginate,
} from "@/components/admin/ui";
import { searchStats, searchTotals, zeroResultSearches } from "@/lib/data/admin";
import { formatDateTime } from "@/lib/utils";
import { ClearSearchesButton } from "./clear-button";

export const metadata: Metadata = { title: "Searches" };

export default async function SearchesPage(props: PageProps<"/admin/searches">) {
  const params = await props.searchParams;
  const [stats, zero, totals] = await Promise.all([searchStats(500), zeroResultSearches(30), searchTotals()]);
  const { rows, ...pageInfo } = paginate(stats, params.page);
  const max = Math.max(1, ...stats.map((s) => s.searches));

  return (
    <div className="admin-fade-up">
      <PageHeader
        title="Searches"
        description="What buyers type into the site search. Use zero-result terms to add products, tags or popular searches."
        actions={stats.length ? <ClearSearchesButton /> : null}
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total searches" value={totals.total} icon={Search} hint="Since tracking started" />
        <StatCard label="Last 30 days" value={totals.last30} icon={CalendarDays} hint="Recent activity" />
        <StatCard label="Unique terms" value={stats.length} icon={Hash} hint="Distinct phrases" />
        <StatCard
          label="No-result terms"
          value={zero.length}
          icon={SearchX}
          hint={zero.length ? "Opportunities to add products" : "Every search found something"}
        />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card title="All search terms" className="overflow-clip" bodyClassName="p-0">
          {stats.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No searches yet"
              text="Searches made on the website are logged here automatically."
            />
          ) : (
            <>
              <Table minWidth={620}>
                <thead>
                  <tr>
                    <Th className="lg:static">Term</Th>
                    <Th className="lg:static">Searches</Th>
                    <Th className="lg:static">Avg. results</Th>
                    <Th className="lg:static">Last searched</Th>
                    <Th className="text-right lg:static">
                      <span className="sr-only">Actions</span>
                    </Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => (
                    <tr key={s.term}>
                      <Td>
                        <Link
                          href={`/search?q=${encodeURIComponent(s.term)}`}
                          target="_blank"
                          className="font-semibold hover:underline"
                        >
                          {s.term}
                        </Link>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <span className="w-8 tabular-nums">{s.searches}</span>
                          <span className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-black/[0.06] sm:block">
                            <span
                              className="block h-full rounded-full bg-[#9bd61c]"
                              style={{ width: `${Math.max(6, (s.searches / max) * 100)}%` }}
                            />
                          </span>
                        </div>
                      </Td>
                      <Td>{s.avg_results === 0 ? <Badge tone="amber">0</Badge> : s.avg_results}</Td>
                      <Td className="text-paper-muted whitespace-nowrap">{formatDateTime(s.last_searched_at)}</Td>
                      <Td className="text-right">
                        <ClearSearchesButton term={s.term} />
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Pagination base="/admin/searches" params={params} noun="terms" {...pageInfo} />
            </>
          )}
        </Card>
        <Card title="No-result searches" description="Buyers found nothing for these terms.">
          {zero.length === 0 ? (
            <p className="text-paper-muted text-[13px]">None so far.</p>
          ) : (
            <ul className="divide-y divide-black/[0.06]">
              {zero.map((s) => (
                <li key={s.term} className="flex items-center justify-between gap-3 py-2.5 text-[13px]">
                  <span className="truncate font-semibold">{s.term}</span>
                  <Badge tone="amber">{s.zero_result_searches}×</Badge>
                </li>
              ))}
            </ul>
          )}
          <p className="text-paper-muted mt-4 rounded-xl bg-[#fbfbf9] p-3 text-[12px] leading-relaxed">
            Tip: add matching words as product tags, or list helpful terms under{" "}
            <Link href="/admin/settings" className="text-paper-ink font-semibold underline">
              Settings → Popular searches
            </Link>
            .
          </p>
        </Card>
      </div>
    </div>
  );
}

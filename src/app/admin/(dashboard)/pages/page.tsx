import { ExternalLink, LayoutTemplate, FileText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EntityList } from "@/components/admin/entity-list";
import { Badge, Card, NewButton, PageHeader, TrashTabs } from "@/components/admin/ui";
import { PAGE_SCHEMAS } from "@/lib/cms/schema";
import { listCustomPages, listSystemPages } from "@/lib/data/admin";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Pages" };

export default async function PagesPage(props: PageProps<"/admin/pages">) {
  const params = await props.searchParams;
  const trash = params.trash === "1";
  const [custom, saved] = await Promise.all([listCustomPages({ trash }), listSystemPages()]);

  return (
    <div className="admin-fade-up">
      <PageHeader
        title="Pages"
        description="Edit the content of every built-in page section by section, or create your own pages."
        actions={<NewButton href="/admin/pages/new" label="New custom page" />}
      />

      <Card title="Site pages" description="Built-in page layouts. Every heading, text, image and button is editable.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PAGE_SCHEMAS.map((schema) => {
            const row = saved.find((p) => p.slug === schema.slug);
            return (
              <div
                key={schema.slug}
                className="group hover:border-ink/25 relative flex flex-col rounded-xl border border-[var(--admin-border)] bg-[#fcfcfa] p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_14px_30px_-22px_rgba(7,19,27,0.6)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="group-hover:bg-signal group-hover:text-ink grid size-9 place-items-center rounded-lg bg-[#f1f4ec] text-[#4c6b12] transition-colors">
                    <LayoutTemplate className="size-4" />
                  </span>
                  {row ? <Badge tone="green">Live</Badge> : <Badge>Default content</Badge>}
                </div>
                <p className="mt-3 text-[15px] font-bold">
                  <Link href={`/admin/pages/system/${schema.slug}`} className="after:absolute after:inset-0">
                    {schema.title}
                  </Link>
                </p>
                <p className="text-paper-muted text-[12px]">
                  <span className="font-mono">{schema.path}</span> · {schema.sections.length} sections
                </p>
                {row ? (
                  <p className="text-paper-muted mt-1 text-[11px]">Updated {formatDateTime(row.updated_at)}</p>
                ) : null}
                <div className="relative z-10 mt-4 flex items-center justify-between gap-3 border-t border-black/[0.06] pt-3">
                  <span className="pointer-events-none text-[12px] font-semibold">Edit content →</span>
                  <a
                    href={schema.path}
                    target="_blank"
                    rel="noreferrer"
                    className="text-paper-muted hover:text-paper-ink inline-flex items-center gap-1 text-[12px] font-semibold"
                    aria-label={`View ${schema.title} on the site`}
                  >
                    View <ExternalLink className="size-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="mt-8 mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[18px] font-bold">Custom pages</h2>
        <TrashTabs base="/admin/pages" trash={trash} />
      </div>
      <EntityList
        emptyIcon={FileText}
        emptyText="Create pages such as policies, terms or landing pages."
        entity="pages"
        base="/admin/pages"
        trash={trash}
        newLabel="New custom page"
        extraHeaders={["URL"]}
        flagHeaders={["Published"]}
        rows={custom.map((p) => ({
          id: p.id,
          title: p.title,
          subtitle: p.seo_description ?? undefined,
          extra: [`/${p.slug}`],
          flags: [{ field: "is_published", value: p.is_published }],
        }))}
      />
    </div>
  );
}

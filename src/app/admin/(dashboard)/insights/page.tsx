import { Newspaper } from "lucide-react";
import type { Metadata } from "next";
import { EntityList } from "@/components/admin/entity-list";
import { Badge, NewButton, PageHeader, TrashTabs } from "@/components/admin/ui";
import { listPosts } from "@/lib/data/admin";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Insights" };

export default async function InsightsPage(props: PageProps<"/admin/insights">) {
  const params = await props.searchParams;
  const trash = params.trash === "1";
  const posts = await listPosts({ trash });
  const now = new Date().toISOString();
  return (
    <div className="admin-fade-up">
      <PageHeader
        title="Insights"
        description="Buyer guides and articles shown on /insights and the home page."
        actions={<NewButton href="/admin/insights/new" label="Write article" />}
      />
      <div className="mb-3">
        <TrashTabs base="/admin/insights" trash={trash} />
      </div>
      <EntityList
        emptyIcon={Newspaper}
        emptyText="Articles help buyers plan orders and build trust."
        entity="posts"
        base="/admin/insights"
        trash={trash}
        showImage
        newLabel="Write article"
        extraHeaders={["Date", "Status"]}
        flagHeaders={["Published"]}
        rows={posts.map((p) => ({
          id: p.id,
          title: p.title,
          subtitle: p.tag ?? undefined,
          image: p.cover_url,
          extra: [
            formatDate(p.published_at),
            !p.is_published ? (
              <Badge key="s">Draft</Badge>
            ) : p.published_at > now ? (
              <Badge key="s" tone="blue">
                Scheduled
              </Badge>
            ) : (
              <Badge key="s" tone="green">
                Live
              </Badge>
            ),
          ],
          flags: [{ field: "is_published", value: p.is_published }],
        }))}
      />
    </div>
  );
}

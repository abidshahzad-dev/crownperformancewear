import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntityForm } from "@/components/admin/entity-form";
import { PageHeader } from "@/components/admin/ui";
import { getPostById } from "@/lib/data/admin";
import { postGroups, postInitial } from "../post-form-config";

export const metadata: Metadata = { title: "Edit article" };

export default async function EditPostPage(props: PageProps<"/admin/insights/[id]">) {
  const { id } = await props.params;
  const post = await getPostById(id);
  if (!post) notFound();
  return (
    <div className="admin-fade-up">
      <PageHeader title={post.title} back={{ href: "/admin/insights", label: "Insights" }} />
      <EntityForm
        key={post.updated_at}
        entity="posts"
        id={post.id}
        initial={postInitial(post)}
        main={postGroups.main}
        side={postGroups.side}
        basePath="/admin/insights"
        publicPath="/insights/{slug}"
      />
    </div>
  );
}

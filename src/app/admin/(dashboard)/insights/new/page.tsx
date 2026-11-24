import type { Metadata } from "next";
import { EntityForm } from "@/components/admin/entity-form";
import { PageHeader } from "@/components/admin/ui";
import { postGroups, postInitial } from "../post-form-config";

export const metadata: Metadata = { title: "New article" };

export default function NewPostPage() {
  return (
    <div className="admin-fade-up">
      <PageHeader title="New article" back={{ href: "/admin/insights", label: "Insights" }} />
      <EntityForm
        entity="posts"
        id={null}
        initial={postInitial(null)}
        main={postGroups.main}
        side={postGroups.side}
        basePath="/admin/insights"
      />
    </div>
  );
}

import type { Metadata } from "next";
import { EntityForm } from "@/components/admin/entity-form";
import { PageHeader } from "@/components/admin/ui";
import { customPageGroups, customPageInitial } from "../page-form-config";

export const metadata: Metadata = { title: "New page" };

export default function NewCustomPage() {
  return (
    <div className="admin-fade-up">
      <PageHeader
        title="New custom page"
        description="Custom pages are written in Markdown and published at /<slug>, for example policies or landing pages."
        back={{ href: "/admin/pages", label: "Pages" }}
      />
      <EntityForm
        entity="pages"
        id={null}
        initial={customPageInitial(null)}
        main={customPageGroups.main}
        side={customPageGroups.side}
        basePath="/admin/pages"
      />
    </div>
  );
}

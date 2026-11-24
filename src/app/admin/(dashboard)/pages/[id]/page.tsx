import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { EntityForm } from "@/components/admin/entity-form";
import { PageHeader } from "@/components/admin/ui";
import { getPageById } from "@/lib/data/admin";
import { customPageGroups, customPageInitial } from "../page-form-config";

export const metadata: Metadata = { title: "Edit page" };

export default async function EditCustomPage(props: PageProps<"/admin/pages/[id]">) {
  const { id } = await props.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const page = await getPageById(id);
  if (!page) notFound();
  if (page.kind === "system") redirect(`/admin/pages/system/${page.slug}`);
  return (
    <div className="admin-fade-up">
      <PageHeader title={page.title} description={`/${page.slug}`} back={{ href: "/admin/pages", label: "Pages" }} />
      <EntityForm
        key={page.updated_at}
        entity="pages"
        id={page.id}
        initial={customPageInitial(page)}
        main={customPageGroups.main}
        side={customPageGroups.side}
        basePath="/admin/pages"
        publicPath="/{slug}"
      />
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SystemPageEditor } from "@/components/admin/content-editors";
import type { Values } from "@/components/admin/schema-form";
import { PageHeader } from "@/components/admin/ui";
import { withPageDefaults } from "@/lib/cms/defaults";
import { getPageSchema } from "@/lib/cms/schema";
import { getSystemPage } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Edit page content" };

export default async function SystemPageEditorPage(props: PageProps<"/admin/pages/system/[slug]">) {
  const { slug } = await props.params;
  const schema = getPageSchema(slug);
  if (!schema) notFound();
  const saved = await getSystemPage(slug);
  const merged = withPageDefaults(slug, saved?.sections ?? null);
  // Sections without defaults still need an object to edit.
  const initial: Record<string, Values> = {};
  for (const section of schema.sections) initial[section.key] = (merged[section.key] ?? {}) as Values;

  return (
    <div className="admin-fade-up">
      <PageHeader
        title={`${schema.title} page`}
        description={`Edit each section of ${schema.path}. Use a new line in titles to control line breaks. Changes go live as soon as you save.`}
        back={{ href: "/admin/pages", label: "Pages" }}
      />
      <SystemPageEditor
        key={saved?.updated_at ?? "default"}
        slug={schema.slug}
        path={schema.path}
        sections={schema.sections}
        initial={initial}
        seo={{ seo_title: saved?.seo_title ?? "", seo_description: saved?.seo_description ?? "" }}
      />
    </div>
  );
}

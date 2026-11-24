import type { FieldGroup } from "@/components/admin/entity-form";
import type { Page } from "@/lib/types";

export const customPageGroups: { main: FieldGroup[]; side: FieldGroup[] } = {
  main: [
    {
      title: "Page",
      columns: 2,
      fields: [
        { type: "text", name: "title", label: "Title" },
        { type: "text", name: "slug", label: "URL slug", slugFrom: "title", help: "The page is served at /<slug>." },
        { type: "markdown", name: "body", label: "Content (Markdown)", rows: 22 },
      ],
    },
  ],
  side: [
    { title: "Publishing", fields: [{ type: "toggle", name: "is_published", label: "Published" }] },
    {
      title: "SEO",
      fields: [
        { type: "text", name: "seo_title", label: "SEO title" },
        { type: "textarea", name: "seo_description", label: "SEO description", rows: 3 },
      ],
    },
  ],
};

export function customPageInitial(page: Page | null): Record<string, unknown> {
  if (page) {
    return {
      title: page.title,
      slug: page.slug,
      body: page.body ?? "",
      is_published: page.is_published,
      seo_title: page.seo_title ?? "",
      seo_description: page.seo_description ?? "",
    };
  }
  return { title: "", slug: "", body: "", is_published: true, seo_title: "", seo_description: "" };
}

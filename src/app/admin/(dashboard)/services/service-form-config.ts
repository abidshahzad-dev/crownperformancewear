import type { FieldGroup } from "@/components/admin/entity-form";
import type { Service } from "@/lib/types";

export const serviceGroups: { main: FieldGroup[]; side: FieldGroup[] } = {
  main: [
    {
      title: "Service",
      columns: 2,
      fields: [
        { type: "text", name: "title", label: "Title" },
        { type: "text", name: "slug", label: "URL slug", slugFrom: "title", help: "Used in /services/<slug>." },
        { type: "text", name: "eyebrow", label: "Eyebrow", placeholder: "From 50 pieces" },
        { type: "strings", name: "features", label: "Key features" },
        { type: "textarea", name: "excerpt", label: "Short summary", rows: 3 },
        { type: "markdown", name: "body", label: "Page content (Markdown)", rows: 14 },
      ],
    },
  ],
  side: [
    {
      title: "Publishing",
      fields: [
        { type: "toggle", name: "is_active", label: "Published" },
        { type: "number", name: "sort_order", label: "Sort order", min: 0 },
        { type: "image", name: "image_url", label: "Image" },
      ],
    },
    {
      title: "SEO",
      fields: [
        { type: "text", name: "seo_title", label: "SEO title" },
        { type: "textarea", name: "seo_description", label: "SEO description", rows: 3 },
      ],
    },
  ],
};

export function serviceInitial(service: Service | null): Record<string, unknown> {
  if (service) return { ...service };
  return {
    title: "",
    slug: "",
    eyebrow: "",
    excerpt: "",
    body: "",
    image_url: "",
    features: [],
    sort_order: 0,
    is_active: true,
    seo_title: "",
    seo_description: "",
  };
}

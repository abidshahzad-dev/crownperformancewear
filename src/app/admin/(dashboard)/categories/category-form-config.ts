import type { FieldGroup } from "@/components/admin/entity-form";
import type { Category } from "@/lib/types";

export function categoryGroups(categories: Category[], selfId?: string): { main: FieldGroup[]; side: FieldGroup[] } {
  return {
    main: [
      {
        title: "Category",
        columns: 2,
        fields: [
          { type: "text", name: "name", label: "Name" },
          { type: "text", name: "slug", label: "URL slug", slugFrom: "name", help: "Used in /collections/<slug>." },
          { type: "text", name: "tagline", label: "Tagline", placeholder: "Technical tees · long sleeves" },
          {
            type: "select",
            name: "parent_id",
            label: "Parent category",
            emptyLabel: "None (top level)",
            options: categories.filter((c) => c.id !== selfId).map((c) => ({ value: c.id, label: c.name })),
          },
          { type: "textarea", name: "description", label: "Description", rows: 4 },
          { type: "image", name: "image_url", label: "Category image" },
        ],
      },
    ],
    side: [
      {
        title: "Visibility",
        fields: [
          { type: "toggle", name: "is_active", label: "Published" },
          { type: "toggle", name: "is_featured", label: "Show on home page" },
          { type: "number", name: "sort_order", label: "Sort order", min: 0 },
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
}

export function categoryInitial(category: Category | null): Record<string, unknown> {
  if (category) return { ...category };
  return {
    name: "",
    slug: "",
    tagline: "",
    parent_id: "",
    description: "",
    image_url: "",
    is_active: true,
    is_featured: true,
    sort_order: 0,
    seo_title: "",
    seo_description: "",
  };
}

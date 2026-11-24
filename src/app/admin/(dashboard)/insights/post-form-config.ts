import type { FieldGroup } from "@/components/admin/entity-form";
import type { Post } from "@/lib/types";

export const postGroups: { main: FieldGroup[]; side: FieldGroup[] } = {
  main: [
    {
      title: "Article",
      columns: 2,
      fields: [
        { type: "text", name: "title", label: "Title" },
        { type: "text", name: "slug", label: "URL slug", slugFrom: "title", help: "Used in /insights/<slug>." },
        { type: "text", name: "tag", label: "Tag line", placeholder: "Buyer checklist · Supplier evaluation" },
        { type: "text", name: "author", label: "Author" },
        { type: "textarea", name: "excerpt", label: "Excerpt", rows: 3 },
        { type: "markdown", name: "body", label: "Body (Markdown)", rows: 18 },
      ],
    },
  ],
  side: [
    {
      title: "Publishing",
      fields: [
        { type: "toggle", name: "is_published", label: "Published" },
        {
          type: "datetime",
          name: "published_at",
          label: "Publish date",
          help: "Leave empty to publish now. Future dates stay hidden until then.",
        },
        { type: "image", name: "cover_url", label: "Cover image" },
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

export function postInitial(post: Post | null): Record<string, unknown> {
  if (post) return { ...post };
  return {
    title: "",
    slug: "",
    tag: "",
    author: "Crown Performance Wear",
    excerpt: "",
    body: "",
    cover_url: "",
    // Empty means "now"; the server fills it in on save.
    published_at: "",
    is_published: true,
    seo_title: "",
    seo_description: "",
  };
}

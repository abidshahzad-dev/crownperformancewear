import type { FieldGroup } from "@/components/admin/entity-form";
import type { Category, Product } from "@/lib/types";

export function productGroups(categories: Category[]): { main: FieldGroup[]; side: FieldGroup[] } {
  return {
    main: [
      {
        title: "Basics",
        columns: 2,
        fields: [
          { type: "text", name: "name", label: "Product name", required: true },
          { type: "text", name: "sku", label: "SKU / style code", placeholder: "CPW-T101" },
          { type: "text", name: "slug", label: "URL slug", slugFrom: "name", help: "Used in /products/<slug>." },
          {
            type: "select",
            name: "category_id",
            label: "Category",
            emptyLabel: "No category",
            options: categories.map((c) => ({ value: c.id, label: c.name })),
          },
          { type: "textarea", name: "short_description", label: "Short description", rows: 2 },
          { type: "markdown", name: "description", label: "Full description (Markdown)", rows: 12 },
        ],
      },
      {
        title: "Images",
        description: "The first image is used on cards and as the main photo.",
        fields: [{ type: "images", name: "images", label: "Product images" }],
      },
      {
        title: "Wholesale pricing",
        columns: 2,
        fields: [
          { type: "number", name: "moq", label: "Minimum order quantity", min: 1 },
          { type: "text", name: "currency", label: "Currency", placeholder: "USD" },
          {
            type: "number",
            name: "price_from",
            label: "“From” price (lowest unit price)",
            step: 0.01,
            min: 0,
            help: "Shown on product cards. Leave empty for “On request”.",
          },
          { type: "tiers", name: "price_tiers", label: "Quantity price breaks" },
        ],
      },
      {
        title: "Specifications",
        columns: 2,
        fields: [
          { type: "text", name: "fabric", label: "Fabric" },
          { type: "text", name: "gsm", label: "Fabric weight", placeholder: "180 GSM" },
          { type: "text", name: "fit", label: "Fit" },
          { type: "text", name: "sample_time", label: "Sample time", placeholder: "5–7 days" },
          { type: "text", name: "lead_time", label: "Production lead time" },
          { type: "strings", name: "sizes", label: "Sizes", placeholder: "S, M, L…" },
          { type: "strings", name: "colors", label: "Colours" },
          { type: "strings", name: "customization", label: "Customisation options" },
          { type: "specs", name: "specs", label: "Specification table" },
        ],
      },
    ],
    side: [
      {
        title: "Visibility",
        fields: [
          { type: "toggle", name: "is_active", label: "Published", help: "Hidden products are not shown on the site." },
          { type: "toggle", name: "is_featured", label: "Best seller / featured" },
          { type: "toggle", name: "is_new", label: "Mark as new" },
          { type: "number", name: "sort_order", label: "Sort order", min: 0, help: "Lower numbers appear first." },
        ],
      },
      {
        title: "Search tags",
        fields: [{ type: "strings", name: "tags", label: "Tags", help: "Extra words buyers might search for." }],
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

export function productInitial(product: Product | null): Record<string, unknown> {
  if (product) return { ...product };
  return {
    name: "",
    sku: "",
    slug: "",
    category_id: "",
    short_description: "",
    description: "",
    fabric: "",
    gsm: "",
    fit: "",
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: [],
    customization: ["Screen print", "Embroidery", "Woven labels"],
    tags: [],
    moq: 50,
    price_from: null,
    currency: "USD",
    price_tiers: [
      { min_qty: 50, max_qty: 199, price: 0 },
      { min_qty: 200, max_qty: null, price: 0 },
    ],
    specs: [],
    images: [],
    sample_time: "5–7 days",
    lead_time: "",
    is_active: true,
    is_featured: false,
    is_new: true,
    sort_order: 0,
    seo_title: "",
    seo_description: "",
  };
}

import { z } from "zod";

/**
 * Admin-editable entities: table, validation schema and the cache tags to expire after a write.
 * Server actions validate every payload against these schemas before it reaches the database.
 */

const blankToNull = (v: unknown) => {
  if (v === undefined || v === null) return null;
  if (typeof v === "string") return v.trim() === "" ? null : v.trim();
  return v;
};

const optText = (max = 300) => z.preprocess(blankToNull, z.string().max(max).nullable());
const reqText = (max = 200, label = "This field") =>
  z.string().trim().min(1, `${label} is required.`).max(max, `${label} is too long.`);
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Slug is required.")
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only.");
const optUrl = z.preprocess(
  blankToNull,
  z
    .string()
    .max(2000)
    .refine((v) => /^https?:\/\//.test(v), "Enter a full http(s) URL.")
    .nullable(),
);
const strList = z.array(z.string().trim().min(1).max(80)).max(60).default([]);
const int = (min = 0) => z.coerce.number().int().min(min);
const optUuid = z.preprocess(blankToNull, z.uuid().nullable());
const isoDate = z.preprocess((v) => {
  if (typeof v !== "string" || !v) return new Date().toISOString();
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toISOString();
}, z.iso.datetime({ offset: true }));

const seo = {
  seo_title: optText(120),
  seo_description: optText(320),
};

export const productSchema = z.object({
  category_id: optUuid,
  sku: reqText(64, "SKU"),
  name: reqText(200, "Name"),
  slug,
  short_description: optText(500),
  description: optText(20000),
  fabric: optText(200),
  gsm: optText(60),
  fit: optText(60),
  sizes: strList,
  colors: strList,
  customization: strList,
  tags: strList,
  moq: int(1),
  price_from: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    z.coerce.number().min(0).nullable(),
  ),
  currency: z.string().trim().toUpperCase().length(3, "Use a 3-letter currency code."),
  price_tiers: z
    .array(
      z.object({
        min_qty: int(1),
        max_qty: z.preprocess((v) => (v === "" || v === null || v === undefined ? null : v), z.coerce.number().int().min(1).nullable()),
        price: z.coerce.number().min(0),
      }),
    )
    .max(20)
    .default([]),
  specs: z
    .array(z.object({ label: z.string().trim().min(1).max(80), value: z.string().trim().min(1).max(400) }))
    .max(40)
    .default([]),
  images: z
    .array(
      z.object({
        url: z
          .string()
          .max(2000)
          .refine((v) => /^https?:\/\//.test(v), "Image URLs must start with http(s)."),
        alt: z.string().trim().max(200).optional().default(""),
      }),
    )
    .max(30)
    .default([]),
  sample_time: optText(120),
  lead_time: optText(200),
  is_featured: z.boolean().default(false),
  is_new: z.boolean().default(false),
  is_active: z.boolean().default(true),
  sort_order: int(0).default(0),
  ...seo,
});

export const categorySchema = z.object({
  name: reqText(120, "Name"),
  slug,
  parent_id: optUuid,
  tagline: optText(160),
  description: optText(2000),
  image_url: optUrl,
  sort_order: int(0).default(0),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(true),
  ...seo,
});

export const serviceSchema = z.object({
  title: reqText(160, "Title"),
  slug,
  eyebrow: optText(120),
  excerpt: optText(600),
  body: optText(30000),
  image_url: optUrl,
  features: strList,
  sort_order: int(0).default(0),
  is_active: z.boolean().default(true),
  ...seo,
});

export const postSchema = z.object({
  title: reqText(220, "Title"),
  slug,
  tag: optText(120),
  excerpt: optText(600),
  body: optText(60000),
  cover_url: optUrl,
  author: optText(120),
  published_at: isoDate,
  is_published: z.boolean().default(true),
  ...seo,
});

export const faqSchema = z.object({
  question: reqText(300, "Question"),
  answer: reqText(4000, "Answer"),
  group_name: z.string().trim().max(80).default("General").transform((v) => v || "General"),
  sort_order: int(0).default(0),
  is_active: z.boolean().default(true),
  show_on_home: z.boolean().default(false),
});

/** Slugs that belong to built-in routes and cannot be used by custom pages. */
export const RESERVED_SLUGS = [
  "admin",
  "api",
  "products",
  "collections",
  "services",
  "about",
  "contact",
  "faq",
  "insights",
  "quote",
  "search",
  "home",
  "sitemap.xml",
  "robots.txt",
];

export const customPageSchema = z.object({
  title: reqText(200, "Title"),
  slug: slug.refine((s) => !RESERVED_SLUGS.includes(s), "This slug is used by a built-in page."),
  body: optText(100000),
  is_published: z.boolean().default(true),
  ...seo,
});

export type EntityName = "products" | "categories" | "services" | "posts" | "faqs" | "pages";

type EntityConfig = {
  table: string;
  schema: z.ZodType<Record<string, unknown>>;
  tags: string[];
  /** Prefix for a per-row tag, e.g. "product:" + slug. */
  slugTag?: string;
  softDelete: boolean;
  adminPath: string;
};

export const ENTITIES: Record<EntityName, EntityConfig> = {
  products: {
    table: "products",
    schema: productSchema,
    tags: ["products"],
    slugTag: "product:",
    softDelete: true,
    adminPath: "/admin/products",
  },
  categories: {
    table: "categories",
    schema: categorySchema,
    tags: ["categories", "products"],
    softDelete: true,
    adminPath: "/admin/categories",
  },
  services: { table: "services", schema: serviceSchema, tags: ["services"], softDelete: true, adminPath: "/admin/services" },
  posts: { table: "posts", schema: postSchema, tags: ["posts"], softDelete: true, adminPath: "/admin/insights" },
  faqs: { table: "faqs", schema: faqSchema, tags: ["faqs"], softDelete: false, adminPath: "/admin/faqs" },
  pages: {
    table: "pages",
    schema: customPageSchema,
    tags: ["pages"],
    slugTag: "page:",
    softDelete: true,
    adminPath: "/admin/pages",
  },
};

/** Boolean columns that list views may toggle inline. */
export const TOGGLE_FIELDS: Record<EntityName, string[]> = {
  products: ["is_active", "is_featured", "is_new"],
  categories: ["is_active", "is_featured"],
  services: ["is_active"],
  posts: ["is_published"],
  faqs: ["is_active", "show_on_home"],
  pages: ["is_published"],
};

import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { DEFAULT_SETTINGS, withPageDefaults } from "@/lib/cms/defaults";
import {
  DEMO_CATEGORIES,
  DEMO_CUSTOM_PAGES,
  DEMO_FAQS,
  DEMO_POSTS,
  DEMO_PRODUCTS,
  DEMO_SERVICES,
} from "@/lib/demo/catalog";
import { isSupabaseConfigured } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/public";
import type { Category, Faq, Page, Post, Product, ProductWithCategory, Service, SiteSettings } from "@/lib/types";

/**
 * Public, cached data access. Every function is a `"use cache"` scope tagged by content type; the
 * admin dashboard expires those tags after each save, so visitors see changes immediately.
 * Without Supabase configured, the bundled demo content is served instead.
 */

export const TAGS = {
  settings: "settings",
  pages: "pages",
  categories: "categories",
  products: "products",
  services: "services",
  posts: "posts",
  faqs: "faqs",
} as const;

/** Strip characters that have meaning in PostgREST filter strings. */
export function sanitizeSearch(q: string): string {
  return q
    .replace(/[,()%*\\:"']/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

function withCategory(products: Product[], categories: Category[]): ProductWithCategory[] {
  return products.map((p) => {
    const c = categories.find((cat) => cat.id === p.category_id);
    return { ...p, category: c ? { id: c.id, name: c.name, slug: c.slug } : null };
  });
}

function demoMatch(p: Product, q: string): boolean {
  const hay = [p.name, p.sku, p.short_description, p.fabric, ...p.tags, ...p.colors].join(" ").toLowerCase();
  return q
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .every((word) => hay.includes(word));
}

// ---------------------------------------------------------------------------
// Settings and pages
// ---------------------------------------------------------------------------

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.settings);
  if (!isSupabaseConfigured()) return DEFAULT_SETTINGS;
  const { data } = await createPublicClient().from("site_settings").select("data").eq("id", 1).maybeSingle();
  const saved = (data?.data ?? {}) as Partial<SiteSettings>;
  return { ...DEFAULT_SETTINGS, ...saved };
}

export async function getPageSections(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.pages, `page:${slug}`);
  if (!isSupabaseConfigured()) return withPageDefaults(slug, null);
  const { data } = await createPublicClient().from("pages").select("sections").eq("slug", slug).maybeSingle();
  return withPageDefaults(slug, (data?.sections ?? null) as Record<string, unknown> | null);
}

export async function getPageMeta(slug: string): Promise<Pick<Page, "title" | "seo_title" | "seo_description"> | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.pages, `page:${slug}`);
  if (!isSupabaseConfigured()) {
    const page = DEMO_CUSTOM_PAGES.find((p) => p.slug === slug);
    return page ? { title: page.title, seo_title: page.seo_title, seo_description: page.seo_description } : null;
  }
  const { data } = await createPublicClient()
    .from("pages")
    .select("title, seo_title, seo_description")
    .eq("slug", slug)
    .maybeSingle();
  return (data as Pick<Page, "title" | "seo_title" | "seo_description"> | null) ?? null;
}

export async function getCustomPage(slug: string): Promise<Page | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.pages, `page:${slug}`);
  if (!isSupabaseConfigured()) return DEMO_CUSTOM_PAGES.find((p) => p.slug === slug) ?? null;
  const { data } = await createPublicClient()
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .eq("kind", "custom")
    .maybeSingle();
  return (data as Page | null) ?? null;
}

export async function getCustomPageSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.pages);
  if (!isSupabaseConfigured()) return DEMO_CUSTOM_PAGES.map((p) => p.slug);
  const { data } = await createPublicClient().from("pages").select("slug").eq("kind", "custom");
  return ((data ?? []) as Array<{ slug: string }>).map((p) => p.slug);
}

// ---------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.categories);
  if (!isSupabaseConfigured()) return DEMO_CATEGORIES;
  const { data } = await createPublicClient()
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  return (data ?? []) as Category[];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) ?? null;
}

export type ProductQuery = {
  category?: string;
  q?: string;
  featured?: boolean;
  limit?: number;
  sort?: "featured" | "newest" | "price-asc" | "price-desc" | "name";
};

export async function getProducts(query: ProductQuery = {}): Promise<ProductWithCategory[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.products, TAGS.categories);
  const categories = await getCategories();
  const category = query.category ? categories.find((c) => c.slug === query.category) : undefined;
  if (query.category && !category) return [];
  const q = query.q ? sanitizeSearch(query.q) : "";

  let products: Product[];
  if (!isSupabaseConfigured()) {
    products = DEMO_PRODUCTS.filter(
      (p) =>
        (!category || p.category_id === category.id) && (!query.featured || p.is_featured) && (!q || demoMatch(p, q)),
    );
  } else {
    let request = createPublicClient().from("products").select("*");
    if (category) request = request.eq("category_id", category.id);
    if (query.featured) request = request.eq("is_featured", true);
    if (q) {
      const like = `%${q}%`;
      request = request.or(`name.ilike.${like},sku.ilike.${like},short_description.ilike.${like},fabric.ilike.${like}`);
    }
    const { data } = await request.order("sort_order", { ascending: true }).limit(500);
    products = (data ?? []) as Product[];
  }

  const sorted = [...products];
  switch (query.sort) {
    case "newest":
      sorted.sort((a, b) => b.created_at.localeCompare(a.created_at) || Number(b.is_new) - Number(a.is_new));
      break;
    case "price-asc":
      sorted.sort((a, b) => (a.price_from ?? Infinity) - (b.price_from ?? Infinity));
      break;
    case "price-desc":
      sorted.sort((a, b) => (b.price_from ?? 0) - (a.price_from ?? 0));
      break;
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "featured":
      sorted.sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.sort_order - b.sort_order);
      break;
    default:
      break;
  }

  const limited = query.limit ? sorted.slice(0, query.limit) : sorted;
  return withCategory(limited, categories);
}

export async function getProductBySlug(slug: string): Promise<ProductWithCategory | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.products, `product:${slug}`);
  const categories = await getCategories();
  let product: Product | null;
  if (!isSupabaseConfigured()) {
    product = DEMO_PRODUCTS.find((p) => p.slug === slug) ?? null;
  } else {
    const { data } = await createPublicClient().from("products").select("*").eq("slug", slug).maybeSingle();
    product = (data as Product | null) ?? null;
  }
  return product ? withCategory([product], categories)[0] : null;
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<ProductWithCategory[]> {
  const all = await getProducts({ sort: "featured" });
  const sameCategory = all.filter((p) => p.id !== product.id && p.category_id === product.category_id);
  const others = all.filter((p) => p.id !== product.id && p.category_id !== product.category_id);
  return [...sameCategory, ...others].slice(0, limit);
}

export async function getProductCounts(): Promise<Record<string, number>> {
  const products = await getProducts();
  const counts: Record<string, number> = {};
  for (const p of products) if (p.category_id) counts[p.category_id] = (counts[p.category_id] ?? 0) + 1;
  return counts;
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

export async function getServices(): Promise<Service[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.services);
  if (!isSupabaseConfigured()) return DEMO_SERVICES;
  const { data } = await createPublicClient().from("services").select("*").order("sort_order", { ascending: true });
  return (data ?? []) as Service[];
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const services = await getServices();
  return services.find((s) => s.slug === slug) ?? null;
}

export async function getPosts(limit?: number): Promise<Post[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.posts);
  let posts: Post[];
  if (!isSupabaseConfigured()) {
    posts = [...DEMO_POSTS].sort((a, b) => b.published_at.localeCompare(a.published_at));
  } else {
    const { data } = await createPublicClient()
      .from("posts")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(200);
    posts = (data ?? []) as Post[];
  }
  return limit ? posts.slice(0, limit) : posts;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = await getPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function getFaqs(options: { homeOnly?: boolean } = {}): Promise<Faq[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.faqs);
  let faqs: Faq[];
  if (!isSupabaseConfigured()) {
    faqs = DEMO_FAQS;
  } else {
    const { data } = await createPublicClient().from("faqs").select("*").order("sort_order", { ascending: true });
    faqs = (data ?? []) as Faq[];
  }
  return options.homeOnly ? faqs.filter((f) => f.show_on_home) : faqs;
}

// ---------------------------------------------------------------------------
// Site search
// ---------------------------------------------------------------------------

export type SearchResults = {
  products: ProductWithCategory[];
  categories: Category[];
  services: Service[];
  posts: Post[];
  total: number;
};

export async function searchSite(rawQuery: string): Promise<SearchResults> {
  const q = sanitizeSearch(rawQuery).toLowerCase();
  if (!q) return { products: [], categories: [], services: [], posts: [], total: 0 };
  const words = q.split(" ").filter(Boolean);
  const matches = (...fields: Array<string | null | undefined>) => {
    const hay = fields.filter(Boolean).join(" ").toLowerCase();
    return words.every((w) => hay.includes(w));
  };

  const [products, categories, services, posts] = await Promise.all([
    getProducts({ q }),
    getCategories(),
    getServices(),
    getPosts(),
  ]);

  const result = {
    products,
    categories: categories.filter((c) => matches(c.name, c.tagline, c.description)),
    services: services.filter((s) => matches(s.title, s.excerpt, s.eyebrow, ...s.features)),
    posts: posts.filter((p) => matches(p.title, p.excerpt, p.tag)),
  };
  return {
    ...result,
    total: result.products.length + result.categories.length + result.services.length + result.posts.length,
  };
}

import "server-only";
import { requireAdmin } from "@/lib/auth";
import type {
  Category,
  Faq,
  Inquiry,
  InquiryStatus,
  Media,
  Page,
  Post,
  Product,
  Profile,
  SearchTermStat,
  Service,
} from "@/lib/types";

/**
 * Uncached admin reads. Every call goes through the signed-in admin's session, so the database's
 * row level security applies (admins see drafts and trashed rows; nobody else can read them).
 */

export type ListOptions = { trash?: boolean; q?: string };

function escapeLike(q: string): string {
  return q
    .replace(/[,()%*\\:"']/g, " ")
    .trim()
    .slice(0, 80);
}

export async function listProducts(options: ListOptions & { category?: string } = {}) {
  const { supabase } = await requireAdmin();
  let query = supabase.from("products").select("*");
  query = options.trash ? query.not("deleted_at", "is", null) : query.is("deleted_at", null);
  if (options.category) query = query.eq("category_id", options.category);
  const q = options.q ? escapeLike(options.q) : "";
  if (q) query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%,slug.ilike.%${q}%`);
  const { data, error } = await query
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  return (data ?? []) as Product[];
}

export async function getProductById(id: string) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  return (data as Product | null) ?? null;
}

export async function listCategories(options: ListOptions = {}) {
  const { supabase } = await requireAdmin();
  let query = supabase.from("categories").select("*");
  query = options.trash ? query.not("deleted_at", "is", null) : query.is("deleted_at", null);
  const { data, error } = await query.order("sort_order", { ascending: true }).order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as Category[];
}

export async function getCategoryById(id: string) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("categories").select("*").eq("id", id).maybeSingle();
  return (data as Category | null) ?? null;
}

export async function countProductsByCategory(): Promise<Record<string, number>> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("products").select("category_id").is("deleted_at", null);
  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as Array<{ category_id: string | null }>) {
    if (row.category_id) counts[row.category_id] = (counts[row.category_id] ?? 0) + 1;
  }
  return counts;
}

export async function listServices(options: ListOptions = {}) {
  const { supabase } = await requireAdmin();
  let query = supabase.from("services").select("*");
  query = options.trash ? query.not("deleted_at", "is", null) : query.is("deleted_at", null);
  const { data, error } = await query.order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Service[];
}

export async function getServiceById(id: string) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("services").select("*").eq("id", id).maybeSingle();
  return (data as Service | null) ?? null;
}

export async function listPosts(options: ListOptions = {}) {
  const { supabase } = await requireAdmin();
  let query = supabase.from("posts").select("*");
  query = options.trash ? query.not("deleted_at", "is", null) : query.is("deleted_at", null);
  const { data, error } = await query.order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Post[];
}

export async function getPostById(id: string) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  return (data as Post | null) ?? null;
}

export async function listFaqs() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("faqs").select("*").order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Faq[];
}

export async function getFaqById(id: string) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("faqs").select("*").eq("id", id).maybeSingle();
  return (data as Faq | null) ?? null;
}

export async function listCustomPages(options: ListOptions = {}) {
  const { supabase } = await requireAdmin();
  let query = supabase.from("pages").select("*").eq("kind", "custom");
  query = options.trash ? query.not("deleted_at", "is", null) : query.is("deleted_at", null);
  const { data, error } = await query.order("title");
  if (error) throw new Error(error.message);
  return (data ?? []) as Page[];
}

export async function listSystemPages() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("pages").select("slug, updated_at").eq("kind", "system");
  return (data ?? []) as Array<Pick<Page, "slug" | "updated_at">>;
}

export async function getPageById(id: string) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("pages").select("*").eq("id", id).maybeSingle();
  return (data as Page | null) ?? null;
}

export async function getSystemPage(slug: string) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("pages").select("*").eq("slug", slug).eq("kind", "system").maybeSingle();
  return (data as Page | null) ?? null;
}

export async function getSettingsData(): Promise<Record<string, unknown>> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("site_settings").select("data").eq("id", 1).maybeSingle();
  return ((data as { data: Record<string, unknown> } | null)?.data ?? {}) as Record<string, unknown>;
}

export async function listInquiries(status?: InquiryStatus) {
  const { supabase } = await requireAdmin();
  let query = supabase.from("inquiries").select("*");
  if (status) query = query.eq("status", status);
  const { data, error } = await query.order("created_at", { ascending: false }).limit(500);
  if (error) throw new Error(error.message);
  return (data ?? []) as Inquiry[];
}

export async function getInquiryById(id: string) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("inquiries").select("*").eq("id", id).maybeSingle();
  return (data as Inquiry | null) ?? null;
}

export async function inquiryStatusCounts(): Promise<Record<string, number>> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("inquiries").select("status");
  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as Array<{ status: string }>) counts[row.status] = (counts[row.status] ?? 0) + 1;
  return counts;
}

export async function searchStats(limit = 100) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("search_term_stats")
    .select("*")
    .order("searches", { ascending: false })
    .limit(limit);
  return (data ?? []) as SearchTermStat[];
}

export async function zeroResultSearches(limit = 50) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("search_term_stats")
    .select("*")
    .gt("zero_result_searches", 0)
    .order("zero_result_searches", { ascending: false })
    .limit(limit);
  return (data ?? []) as SearchTermStat[];
}

export async function searchTotals() {
  const { supabase } = await requireAdmin();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const [{ count: total }, { count: last30 }] = await Promise.all([
    supabase.from("search_queries").select("id", { count: "exact", head: true }),
    supabase.from("search_queries").select("id", { count: "exact", head: true }).gte("created_at", since),
  ]);
  return { total: total ?? 0, last30: last30 ?? 0 };
}

export async function listMedia() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("media").select("*").order("created_at", { ascending: false }).limit(500);
  if (error) throw new Error(error.message);
  return (data ?? []) as Media[];
}

export async function listProfiles() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("role")
    .order("created_at");
  if (error) throw new Error(error.message);
  return (data ?? []) as Profile[];
}

/** Inquiries received in the last 7 days and the 7 days before that, for the dashboard trend. */
export async function inquiryActivity() {
  const { supabase } = await requireAdmin();
  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const weekAgo = new Date(now - 7 * day).toISOString();
  const twoWeeksAgo = new Date(now - 14 * day).toISOString();
  const [{ count: thisWeek }, { count: lastWeek }] = await Promise.all([
    supabase.from("inquiries").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabase
      .from("inquiries")
      .select("id", { count: "exact", head: true })
      .gte("created_at", twoWeeksAgo)
      .lt("created_at", weekAgo),
  ]);
  return { thisWeek: thisWeek ?? 0, lastWeek: lastWeek ?? 0 };
}

/** Catalogue health numbers: hidden products and products without a photo. */
export async function catalogueHealth() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("products").select("id, is_active, images").is("deleted_at", null);
  const rows = (data ?? []) as Array<Pick<Product, "id" | "is_active" | "images">>;
  return {
    hidden: rows.filter((r) => !r.is_active).length,
    withoutImages: rows.filter((r) => !Array.isArray(r.images) || r.images.length === 0).length,
  };
}

/** Rows whose ids are in `ids` (used to detect leftover dummy content). */
export async function countByIds(table: "products" | "categories" | "services" | "posts", ids: string[]) {
  if (!ids.length) return 0;
  const { supabase } = await requireAdmin();
  const { count } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .in("id", ids)
    .is("deleted_at", null);
  return count ?? 0;
}

export async function dashboardCounts() {
  const { supabase } = await requireAdmin();
  const count = async (table: string, softDeleted = true, extra?: { column: string; value: string | boolean }) => {
    let query = supabase.from(table).select("id", { count: "exact", head: true });
    if (softDeleted) query = query.is("deleted_at", null);
    if (extra) query = query.eq(extra.column, extra.value);
    const { count: n } = await query;
    return n ?? 0;
  };
  const [products, categories, services, posts, faqs, pages, newInquiries, inquiries, media] = await Promise.all([
    count("products"),
    count("categories"),
    count("services"),
    count("posts"),
    count("faqs", false),
    count("pages", true, { column: "kind", value: "custom" }),
    count("inquiries", false, { column: "status", value: "new" }),
    count("inquiries", false),
    count("media", false),
  ]);
  return { products, categories, services, posts, faqs, pages, newInquiries, inquiries, media };
}

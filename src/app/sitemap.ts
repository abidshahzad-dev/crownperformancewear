import type { MetadataRoute } from "next";
import { getCategories, getCustomPageSlugs, getPosts, getProducts, getServices } from "@/lib/data/public";
import { siteUrl } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [products, categories, services, posts, pages] = await Promise.all([
    getProducts(),
    getCategories(),
    getServices(),
    getPosts(),
    getCustomPageSlugs(),
  ]);
  const staticPaths = ["", "/products", "/collections", "/services", "/about", "/contact", "/faq", "/insights", "/quote"];
  return [
    ...staticPaths.map((p) => ({ url: `${base}${p}` })),
    ...categories.map((c) => ({ url: `${base}/collections/${c.slug}`, lastModified: c.updated_at })),
    ...products.map((p) => ({ url: `${base}/products/${p.slug}`, lastModified: p.updated_at })),
    ...services.map((s) => ({ url: `${base}/services/${s.slug}`, lastModified: s.updated_at })),
    ...posts.map((p) => ({ url: `${base}/insights/${p.slug}`, lastModified: p.updated_at })),
    ...pages.map((slug) => ({ url: `${base}/${slug}` })),
  ];
}

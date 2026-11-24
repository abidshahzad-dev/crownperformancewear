import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CatalogueFilters } from "@/components/site/catalogue-filters";
import { PageHero } from "@/components/site/page-hero";
import { parseProductQuery, ProductGrid, ProductGridSkeleton } from "@/components/site/product-grid";
import { getCategories, getCategoryBySlug } from "@/lib/data/public";
import { cn } from "@/lib/utils";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Collection not found" };
  return {
    title: category.seo_title || `Wholesale ${category.name}`,
    description: category.seo_description || category.description || undefined,
  };
}

async function CollectionHero({ params }: { params: PageProps<"/collections/[slug]">["params"] }) {
  const { slug } = await params;
  const [category, categories] = await Promise.all([getCategoryBySlug(slug), getCategories()]);
  if (!category) notFound();
  return (
    <>
      <PageHero
        compact
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Collections", href: "/collections" },
          { label: category.name },
        ]}
        section={{
          eyebrow: category.tagline ?? "Collection",
          title: category.name,
          text: category.description,
          image: category.image_url,
        }}
      />
      <nav aria-label="Collections" className="bg-ink-2 border-b border-white/10">
        <ul className="shell no-scrollbar flex gap-6 overflow-x-auto">
          {categories.map((c) => (
            <li key={c.id} className="shrink-0">
              <Link
                href={`/collections/${c.slug}`}
                className={cn(
                  "block border-b-2 py-4 text-[13px] font-semibold transition-colors",
                  c.slug === slug ? "border-signal text-white" : "text-muted border-transparent hover:text-white",
                )}
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

async function CollectionResults({
  params,
  searchParams,
}: {
  params: PageProps<"/collections/[slug]">["params"];
  searchParams: PageProps<"/collections/[slug]">["searchParams"];
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  return <ProductGrid query={parseProductQuery(sp, slug)} resetHref={`/collections/${slug}#catalogue`} />;
}

export default function CollectionPage({ params, searchParams }: PageProps<"/collections/[slug]">) {
  return (
    <>
      <Suspense fallback={<div className="bg-night min-h-[420px]" />}>
        <CollectionHero params={params} />
      </Suspense>
      <section id="catalogue" className="bg-ink-2 scroll-mt-24 py-14 pb-28">
        <div className="shell">
          <Suspense fallback={<div className="h-[98px] rounded-md border border-white/10" />}>
            <CatalogueFilters categories={[]} showCategory={false} />
          </Suspense>
          <div className="mt-10">
            <Suspense fallback={<ProductGridSkeleton />}>
              <CollectionResults params={params} searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}

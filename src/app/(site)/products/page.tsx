import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CatalogueFilters } from "@/components/site/catalogue-filters";
import { PageHero } from "@/components/site/page-hero";
import { parseProductQuery, ProductGrid, ProductGridSkeleton } from "@/components/site/product-grid";
import { DisplayTitle } from "@/components/site/section-heading";
import { getCategories, getPageSections } from "@/lib/data/public";
import { asLink, asList, str } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Wholesale Activewear Catalogue",
  description:
    "Browse wholesale performance tops, polos, shorts, hoodies, leggings and team kits. Tiered bulk pricing from 50 pieces.",
};

async function Results({ searchParams }: { searchParams: PageProps<"/products">["searchParams"] }) {
  const sp = await searchParams;
  return <ProductGrid query={parseProductQuery(sp)} resetHref="/products#catalogue" />;
}

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const [page, categories] = await Promise.all([getPageSections("products"), getCategories()]);
  const stats = asList<{ label?: string; value?: string }>(page.stats.items);
  const routes = asList<{ title?: string; text?: string; link?: unknown }>(page.routes.items);

  return (
    <>
      <PageHero section={page.hero} crumbs={[{ label: "Home", href: "/" }, { label: "Products" }]}>
        <Link href="#catalogue" className="btn btn-signal mt-9">
          Browse the catalogue <ArrowRight className="size-4" />
        </Link>
      </PageHero>

      <section className="bg-ink-2">
        <div className="shell">
          <dl data-reveal="stagger" className="grid grid-cols-1 border-b border-white/10 sm:grid-cols-3">
            {stats.map((s, i) => (
              <div
                key={`${s.label}-${i}`}
                className="border-white/10 py-6 sm:px-6 sm:first:pl-0 sm:[&:not(:first-child)]:border-l"
              >
                <dt className="text-muted text-[10px] font-extrabold tracking-[0.12em] uppercase">{s.label}</dt>
                <dd className="mt-2 text-[20px] font-bold text-white">{s.value}</dd>
              </div>
            ))}
          </dl>

          <div className="py-20 md:py-24">
            <DisplayTitle title={page.routes.title} className="display-md max-w-[760px] text-white" />
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {routes.map((r, i) => {
                const link = asLink(r.link);
                return (
                  <div key={`${r.title}-${i}`} className="bg-paper-soft text-paper-ink rounded-md p-6">
                    <p className="text-[17px] font-bold">{r.title}</p>
                    <p className="text-paper-muted mt-2.5 text-[14px] leading-[1.6]">{r.text}</p>
                    {link ? (
                      <Link href={link.href} className="mt-5 inline-flex items-center gap-2 text-[13px] font-bold">
                        {link.label} <ArrowRight className="size-3.5" />
                      </Link>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="catalogue" className="bg-ink-2 scroll-mt-24 pb-28">
        <div className="shell">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow text-signal mb-5">{str(page.grid.eyebrow)}</p>
              <DisplayTitle title={page.grid.title} className="display-lg text-white" />
            </div>
            <p className="text-muted max-w-[360px] text-[13px] leading-[1.6]">{str(page.grid.text)}</p>
          </div>
          <div className="mt-10">
            <Suspense fallback={<div className="h-[98px] rounded-md border border-white/10" />}>
              <CatalogueFilters categories={categories.map((c) => ({ value: c.slug, label: c.name }))} />
            </Suspense>
          </div>
          <div className="mt-10">
            <Suspense fallback={<ProductGridSkeleton />}>
              <Results searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}

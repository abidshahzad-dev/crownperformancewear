import type { Metadata } from "next";
import { Suspense } from "react";
import { QuoteBuilder } from "@/components/site/quote-builder";
import { Breadcrumbs } from "@/components/site/page-hero";
import { DisplayTitle } from "@/components/site/section-heading";
import { getPageSections, getProductBySlug, getSettings } from "@/lib/data/public";
import { asLink, str } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Request a Wholesale Quote",
  description: "Send your shortlist of styles and quantities for a written wholesale quotation.",
  robots: { index: false },
};

async function Builder({ searchParams }: { searchParams: PageProps<"/quote">["searchParams"] }) {
  const sp = await searchParams;
  const addSlug = typeof sp.add === "string" ? sp.add : null;
  const [page, settings, product] = await Promise.all([
    getPageSections("quote"),
    getSettings(),
    addSlug ? getProductBySlug(addSlug) : Promise.resolve(null),
  ]);
  return (
    <QuoteBuilder
      categories={settings.inquiry_categories}
      pendingAdd={
        product
          ? {
              product_id: product.id,
              sku: product.sku,
              name: product.name,
              slug: product.slug,
              image: product.images[0]?.url,
              moq: product.moq,
            }
          : null
      }
      empty={{
        eyebrow: str(page.empty.eyebrow),
        title: str(page.empty.title),
        text: str(page.empty.text),
        link: asLink(page.empty.link),
      }}
    />
  );
}

export default async function QuotePage({ searchParams }: PageProps<"/quote">) {
  const page = await getPageSections("quote");
  return (
    <div className="bg-ink-2 pt-[120px] pb-24 xl:pt-[150px]">
      <div className="shell">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Request a quote" }]} />
        <p className="eyebrow text-signal mt-10">{str(page.hero.eyebrow)}</p>
        <DisplayTitle as="h1" title={page.hero.title} className="display-lg mt-5 text-white" />
        <p className="text-muted-2 mt-5 max-w-[620px] text-[15px] leading-[1.6]">{str(page.hero.text)}</p>
        <div className="mt-12">
          <Suspense fallback={<div className="h-60 animate-pulse rounded-md bg-white/5" />}>
            <Builder searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

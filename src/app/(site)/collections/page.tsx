import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { getCategories, getPageSections, getProductCounts } from "@/lib/data/public";

export const metadata: Metadata = {
  title: "Collections",
  description: "Shop wholesale activewear by collection: tops, polos, shorts, fleece, leggings and team kits.",
};

export default async function CollectionsPage() {
  const [page, categories, counts] = await Promise.all([
    getPageSections("collections"),
    getCategories(),
    getProductCounts(),
  ]);
  return (
    <>
      <PageHero compact crumbs={[{ label: "Home", href: "/" }, { label: "Collections" }]} section={page.hero} />
      <section className="bg-paper py-20 md:py-24">
        <div data-reveal="stagger" className="shell grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => (
            <Link
              key={c.id}
              href={`/collections/${c.slug}`}
              className="group bg-ink relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[22px] p-7"
            >
              {c.image_url ? (
                <Image
                  src={c.image_url}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="relative">
                <p className="text-signal text-[11px] font-bold">
                  {String(i + 1).padStart(2, "0")} · {counts[c.id] ?? 0} styles
                </p>
                <h2 className="mt-3 text-[36px] leading-[0.95] font-bold tracking-[-0.05em] text-white">{c.name}</h2>
                <p className="mt-3 text-[13px] text-white/80">{c.tagline}</p>
              </div>
              <ArrowUpRight className="absolute top-6 right-6 size-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

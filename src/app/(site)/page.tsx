import { CollectionsExplorer } from "@/components/home/collections-explorer";
import {
  BuyerResources,
  CatalogueBanner,
  FinalInquiry,
  FirstOrder,
  HomeFaq,
  HomeInsights,
  HomeServices,
} from "@/components/home/home-bottom";
import { HomeHero, ProofBand } from "@/components/home/home-hero";
import {
  GalleryMosaic,
  OrderEssentials,
  ProcessIntro,
  ProcessStages,
  StatementBanner,
  TrustCards,
} from "@/components/home/home-middle";
import { DisplayTitle } from "@/components/site/section-heading";
import { getCategories, getFaqs, getPageSections, getPosts, getServices, getSettings } from "@/lib/data/public";
import { asLink, str } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
  const [page, categories, services, faqs, posts, settings] = await Promise.all([
    getPageSections("home"),
    getCategories(),
    getServices(),
    getFaqs({ homeOnly: true }),
    getPosts(6),
    getSettings(),
  ]);

  const collections = page.collections;
  const collectionsLink = asLink(collections.link);
  const featured = categories.filter((c) => c.is_featured);

  return (
    <>
      <HomeHero s={page.hero} />
      <ProofBand s={page.proof} />

      <section id="products" className="bg-paper text-paper-ink py-24 md:py-28">
        <div className="shell">
          <CollectionsExplorer
            intro={
              <div>
                <p className="eyebrow text-paper-eyebrow mb-5">{str(collections.eyebrow)}</p>
                <DisplayTitle title={collections.title} className="display-lg text-[#10171a]" />
                <p className="text-paper-muted mt-6 max-w-[440px] text-[14px] leading-[1.6]">{str(collections.text)}</p>
                {collectionsLink ? (
                  <Link
                    href={collectionsLink.href}
                    className="mt-7 inline-flex items-center gap-2.5 text-[13px] font-bold"
                  >
                    {collectionsLink.label} <ArrowRight className="size-4" />
                  </Link>
                ) : null}
              </div>
            }
            items={featured.map((c) => ({
              slug: c.slug,
              name: c.name,
              tagline: c.tagline ?? "",
              image: c.image_url ?? "",
            }))}
          />
        </div>
      </section>

      <StatementBanner s={page.statement} />
      <GalleryMosaic s={page.gallery} />
      <TrustCards s={page.trust} />
      <OrderEssentials s={page.essentials} />
      <ProcessIntro s={page.process} />
      <ProcessStages s={page.stages} />
      <HomeServices s={page.services} services={services} />
      <FirstOrder s={page.firstOrder} />
      <BuyerResources s={page.resources} />
      <div className="bg-paper pt-24 md:pt-[115px]" />
      <CatalogueBanner s={page.catalogue} whatsapp={settings.whatsapp} />
      <HomeFaq s={page.faq} faqs={faqs} />
      <HomeInsights s={page.insights} posts={posts} />
      <FinalInquiry s={page.inquiry} categories={settings.inquiry_categories} />
    </>
  );
}

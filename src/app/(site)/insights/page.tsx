import type { Metadata } from "next";
import { PostCard } from "@/components/home/home-bottom";
import { PageHero } from "@/components/site/page-hero";
import { getPageSections, getPosts } from "@/lib/data/public";

export const metadata: Metadata = {
  title: "Insights & Buyer Guides",
  description: "Practical guides on sourcing, fabrics, decoration and order planning for activewear buyers.",
};

export default async function InsightsPage() {
  const [page, posts] = await Promise.all([getPageSections("insights"), getPosts()]);
  return (
    <>
      <PageHero section={page.hero} crumbs={[{ label: "Home", href: "/" }, { label: "Insights" }]} />
      <section className="bg-paper py-20 md:py-24">
        <div className="shell">
          {posts.length ? (
            <div data-reveal="stagger" className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <div key={post.id} className="flex h-[480px]">
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-paper-muted text-[16px]">New guides are on the way.</p>
          )}
        </div>
      </section>
    </>
  );
}

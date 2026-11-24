import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Markdown } from "@/components/site/markdown";
import { Breadcrumbs } from "@/components/site/page-hero";
import { getCustomPage, getCustomPageSlugs } from "@/lib/data/public";

/** Custom pages created in Admin → Pages (wholesale terms, policies, landing pages). */

export async function generateStaticParams() {
  const slugs = await getCustomPageSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = await getCustomPage(slug);
  if (!page) return { title: "Page not found" };
  return { title: page.seo_title || page.title, description: page.seo_description || undefined };
}

async function CustomPage({ params }: { params: PageProps<"/[slug]">["params"] }) {
  const { slug } = await params;
  const page = await getCustomPage(slug);
  if (!page) notFound();
  return (
    <>
      <header className="bg-night pt-[120px] pb-16 xl:pt-[150px]">
        <div className="shell">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: page.title }]} />
          <h1 className="display display-xl mt-10 max-w-[900px] text-white">{page.title}</h1>
          {page.seo_description ? (
            <p className="text-muted-2 mt-6 max-w-[620px] text-[16px] leading-[1.6]">{page.seo_description}</p>
          ) : null}
        </div>
      </header>
      <article className="bg-paper py-16 md:py-24">
        <div className="mx-auto w-[min(820px,calc(100vw-40px))]">
          <Markdown>{page.body}</Markdown>
        </div>
      </article>
    </>
  );
}

export default function Page({ params }: PageProps<"/[slug]">) {
  return (
    <Suspense fallback={<div className="bg-night min-h-[600px]" />}>
      <CustomPage params={params} />
    </Suspense>
  );
}

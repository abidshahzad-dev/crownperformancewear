import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PostCard } from "@/components/home/home-bottom";
import { Markdown } from "@/components/site/markdown";
import { Breadcrumbs } from "@/components/site/page-hero";
import { getPostBySlug, getPosts } from "@/lib/data/public";
import { formatDate } from "@/lib/utils";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/insights/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Article not found" };
  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || undefined,
    openGraph: { type: "article", images: post.cover_url ? [post.cover_url] : undefined },
  };
}

async function Article({ params }: { params: PageProps<"/insights/[slug]">["params"] }) {
  const { slug } = await params;
  const [post, posts] = await Promise.all([getPostBySlug(slug), getPosts()]);
  if (!post) notFound();
  const more = posts.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <>
      <header className="bg-night pt-[120px] pb-14 xl:pt-[150px]">
        <div className="mx-auto w-[min(860px,calc(100vw-40px))]">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Insights", href: "/insights" }, { label: "Article" }]}
          />
          {post.tag ? <p className="eyebrow text-signal mt-10">{post.tag}</p> : null}
          <h1 className="mt-5 text-[clamp(36px,5vw,64px)] leading-[0.98] font-bold tracking-[-0.05em] text-white">
            {post.title}
          </h1>
          <p className="text-muted-2 mt-6 text-[17px] leading-[1.6]">{post.excerpt}</p>
          <p className="text-muted mt-6 text-[12px] font-bold tracking-[0.12em] uppercase">
            {post.author ? `${post.author} · ` : ""}
            {formatDate(post.published_at)}
          </p>
        </div>
      </header>
      {post.cover_url ? (
        <div className="bg-night">
          <div className="relative mx-auto aspect-[16/8] w-[min(1100px,calc(100vw-40px))] overflow-hidden rounded-[22px]">
            <Image src={post.cover_url} alt="" fill priority sizes="1100px" className="object-cover" />
          </div>
        </div>
      ) : null}
      <article className="bg-paper py-16 md:py-20">
        <div className="mx-auto w-[min(760px,calc(100vw-40px))]">
          <Markdown>{post.body}</Markdown>
          <Link href="/insights" className="text-link text-paper-ink mt-12">
            <ArrowLeft className="size-4" /> All insights
          </Link>
        </div>
      </article>
      {more.length ? (
        <section className="bg-navy py-20">
          <div className="shell">
            <h2 className="display display-md mb-10 text-white">Keep reading</h2>
            <div className="grid gap-5 md:grid-cols-3">
              {more.map((p) => (
                <div key={p.id} className="flex h-[440px]">
                  <PostCard post={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

export default function ArticlePage({ params }: PageProps<"/insights/[slug]">) {
  return (
    <Suspense fallback={<div className="bg-night min-h-[600px]" />}>
      <Article params={params} />
    </Suspense>
  );
}

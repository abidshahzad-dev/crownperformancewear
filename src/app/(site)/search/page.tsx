import { ArrowRight, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { after } from "next/server";
import { Suspense } from "react";
import { PostCard, ServiceCard } from "@/components/home/home-bottom";
import { Breadcrumbs } from "@/components/site/page-hero";
import { ProductCard } from "@/components/site/product-card";
import { getSettings, sanitizeSearch, searchSite } from "@/lib/data/public";
import { isSupabaseConfigured } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/public";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

async function Results({ searchParams }: { searchParams: PageProps<"/search">["searchParams"] }) {
  const sp = await searchParams;
  const raw = typeof sp.q === "string" ? sp.q : "";
  const q = sanitizeSearch(raw);
  const [results, settings] = await Promise.all([searchSite(q), getSettings()]);

  // Record the search for the admin "Searches" report once the response has been sent.
  if (q && isSupabaseConfigured()) {
    after(async () => {
      const { error } = await createPublicClient()
        .from("search_queries")
        .insert({ term: q.toLowerCase(), results_count: results.total });
      if (error) console.error("Search log failed:", error.message);
    });
  }

  return (
    <>
      <form
        action="/search"
        className="mt-8 flex max-w-[760px] items-center gap-3 border-b border-white/30 pb-3"
        role="search"
      >
        <Search className="text-muted size-6 shrink-0" />
        <input
          name="q"
          defaultValue={raw}
          placeholder="Search by style, SKU or fabric…"
          aria-label="Search terms"
          className="w-full bg-transparent text-[24px] font-semibold tracking-tight text-white outline-none placeholder:text-white/35 md:text-[30px]"
        />
        <button type="submit" className="btn btn-signal">
          Search
        </button>
      </form>

      {!q ? (
        <div className="mt-8 flex flex-wrap gap-2">
          {settings.popular_searches.map((t) => (
            <Link
              key={t}
              href={`/search?q=${encodeURIComponent(t)}`}
              className="text-muted-2 hover:border-signal border border-white/15 px-3.5 py-2 text-[13px] hover:text-white"
            >
              {t}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-muted mt-6 text-[14px]">
          {results.total} {results.total === 1 ? "result" : "results"} for{" "}
          <span className="font-bold text-white">“{q}”</span>
        </p>
      )}

      {q && results.total === 0 ? (
        <div className="mt-12 rounded-md border border-white/10 p-8">
          <p className="text-[22px] font-bold text-white">No matches yet.</p>
          <p className="text-muted mt-2 max-w-[520px] text-[14px] leading-[1.6]">
            We source many styles on request. Tell us what you are looking for and we&apos;ll quote it.
          </p>
          <Link href="/quote" className="btn btn-signal mt-6">
            Request this style <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : null}

      {results.categories.length ? (
        <div className="mt-14">
          <h2 className="eyebrow text-signal mb-5">Collections</h2>
          <div className="flex flex-wrap gap-3">
            {results.categories.map((c) => (
              <Link key={c.id} href={`/collections/${c.slug}`} className="btn btn-ghost">
                {c.name} <ArrowRight className="size-4" />
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {results.products.length ? (
        <div className="mt-14">
          <h2 className="eyebrow text-signal mb-6">Products ({results.products.length})</h2>
          <div data-reveal="stagger" className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
            {results.products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      ) : null}

      {results.services.length ? (
        <div className="mt-16">
          <h2 className="eyebrow text-signal mb-6">Services</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {results.services.map((s, i) => (
              <ServiceCard key={s.id} service={s} index={i} />
            ))}
          </div>
        </div>
      ) : null}

      {results.posts.length ? (
        <div className="mt-16">
          <h2 className="eyebrow text-signal mb-6">Insights</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {results.posts.map((p) => (
              <div key={p.id} className="flex h-[420px]">
                <PostCard post={p} />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <div className="bg-ink-2 min-h-[70vh] pt-[120px] pb-24 xl:pt-[150px]">
      <div className="shell">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
        <h1 className="display display-lg mt-10 text-white">Search</h1>
        <Suspense fallback={<div className="mt-8 h-16 max-w-[760px] animate-pulse rounded bg-white/5" />}>
          <Results searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getProducts, type ProductQuery } from "@/lib/data/public";
import { ProductCard } from "./product-card";

const SORTS = new Set(["featured", "newest", "price-asc", "price-desc", "name"]);

export function parseProductQuery(sp: Record<string, string | string[] | undefined>, category?: string): ProductQuery {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const sort = one(sp.sort);
  return {
    q: one(sp.q).slice(0, 80) || undefined,
    category: category ?? (one(sp.category) || undefined),
    sort: (SORTS.has(sort) ? sort : "featured") as ProductQuery["sort"],
  };
}

/** Server-rendered result grid for the catalogue and collection pages. */
export async function ProductGrid({ query, resetHref }: { query: ProductQuery; resetHref: string }) {
  const products = await getProducts(query);
  return (
    <div>
      <p className="mb-6 text-[15px] text-white">
        <span className="text-[26px] font-bold tracking-[-0.04em]">{products.length}</span>{" "}
        <span className="text-muted">matching {products.length === 1 ? "style" : "styles"}</span>
      </p>
      {products.length ? (
        <div data-reveal="stagger" className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 4} />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-white/10 p-10 text-center">
          <p className="text-[20px] font-bold text-white">No styles match those filters.</p>
          <p className="text-muted mt-2 text-[14px]">Try a different search, or ask us. We source styles on request.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={resetHref} className="btn btn-ghost">
              Clear filters
            </Link>
            <Link href="/quote" className="btn btn-signal">
              Request a style <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4" aria-busy>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i}>
          <div className="aspect-[4/4.3] animate-pulse rounded-[18px] bg-white/10" />
          <div className="mt-4 h-3 w-1/3 animate-pulse rounded bg-white/10" />
          <div className="mt-3 h-5 w-3/4 animate-pulse rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}

"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

/** Search, category and sort controls that drive the catalogue through URL search params. */
export function CatalogueFilters({
  categories,
  showCategory = true,
}: {
  categories: Option[];
  showCategory?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQ(params.get("q") ?? "");
  }, [params]);

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const query = next.toString();
    startTransition(() => router.replace(`${pathname}${query ? `?${query}` : ""}#catalogue`, { scroll: false }));
  };

  return (
    <form
      className={cn(
        "grid gap-4 rounded-md border border-white/10 bg-white/[0.04] p-4 transition-opacity md:p-5",
        showCategory ? "md:grid-cols-[1.6fr_1fr_1fr]" : "md:grid-cols-[2fr_1fr]",
        pending && "opacity-70",
      )}
      onSubmit={(e) => {
        e.preventDefault();
        update({ q: q.trim() });
      }}
      role="search"
    >
      <div>
        <label htmlFor="catalogue-q" className="label text-muted">
          Search
        </label>
        <div className="relative">
          <Search className="text-muted pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
          <input
            id="catalogue-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search CPW-H320, hoodie, nylon…"
            className="field-dark pr-10 pl-10"
          />
          {q ? (
            <button
              type="button"
              aria-label="Clear search"
              className="text-muted absolute top-1/2 right-3 -translate-y-1/2 hover:text-white"
              onClick={() => {
                setQ("");
                update({ q: "" });
              }}
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      </div>
      {showCategory ? (
        <div>
          <label htmlFor="catalogue-category" className="label text-muted">
            Category
          </label>
          <select
            id="catalogue-category"
            className="field-dark"
            value={params.get("category") ?? ""}
            onChange={(e) => update({ category: e.target.value })}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <div>
        <label htmlFor="catalogue-sort" className="label text-muted">
          Sort by
        </label>
        <select
          id="catalogue-sort"
          className="field-dark"
          value={params.get("sort") ?? "featured"}
          onChange={(e) => update({ sort: e.target.value === "featured" ? "" : e.target.value })}
        >
          <option value="featured">Featured</option>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>
      <button type="submit" className="sr-only">
        Search
      </button>
    </form>
  );
}

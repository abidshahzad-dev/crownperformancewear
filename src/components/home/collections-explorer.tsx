"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type CollectionItem = { slug: string; name: string; tagline: string; image: string };

/**
 * Numbered category list; hovering or focusing a row slides it in, grows the lime marker and swaps the
 * large preview with a short wipe-and-settle animation.
 */
export function CollectionsExplorer({ items, intro }: { items: CollectionItem[]; intro: ReactNode }) {
  const [active, setActive] = useState(0);
  const current = items[active];

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,522px)_minmax(0,1fr)] lg:gap-16">
      <div className="lg:order-1">
        {intro}
        <ul className="border-line-dark mt-12 border-t" data-reveal="stagger">
          {items.map((item, i) => (
            <li key={item.slug}>
              <Link
                href={`/collections/${item.slug}`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className={cn(
                  "group border-line-dark relative grid grid-cols-[36px_1fr_auto] items-center gap-3 border-b py-6 pr-0.5 transition-[padding,color] duration-500 ease-[var(--ease-out)] md:grid-cols-[40px_1fr_150px_24px] md:py-[26px]",
                  "before:bg-signal before:absolute before:top-1/2 before:left-0 before:h-[44%] before:w-[3px] before:-translate-y-1/2 before:scale-y-0 before:transition-transform before:duration-500",
                  i === active ? "pl-6 before:scale-y-100" : "pl-[18px]",
                )}
              >
                <span className="text-paper-muted text-[10px] font-bold">{String(i + 1).padStart(2, "0")}</span>
                <span
                  className={cn(
                    "text-[26px] leading-[1.05] tracking-[-0.04em] transition-colors duration-300 md:text-[30px]",
                    i === active ? "text-paper-ink" : "text-paper-muted",
                  )}
                >
                  {item.name}
                </span>
                <span
                  className={cn(
                    "hidden text-right text-[11px] leading-[1.4] transition-colors md:block",
                    i === active ? "text-[#182b20]" : "text-paper-muted",
                  )}
                >
                  {item.tagline}
                </span>
                <ArrowUpRight
                  className={cn(
                    "text-paper-ink size-5 transition-[opacity,transform] duration-300 max-md:hidden",
                    i === active
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
                  )}
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {current ? (
        <div className="lg:order-2">
          <div
            className="bg-ink relative aspect-[4/3.6] overflow-hidden rounded-[22px] lg:sticky lg:top-[120px] lg:aspect-auto lg:h-[min(620px,72vh)]"
            data-reveal="clip"
            style={{ "--clip-r": "22px" } as CSSProperties}
          >
            {/* Keyed so the swap animation replays on every change; the others stay mounted for instant swaps. */}
            <div key={current.slug} className="swap-in absolute inset-0">
              <Image src={current.image} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
            {items.map((item) =>
              item.slug === current.slug ? null : (
                <Image
                  key={item.slug}
                  src={item.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="-z-10 object-cover opacity-0"
                />
              ),
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <div key={`copy-${current.slug}`} className="hero-copy absolute inset-x-0 bottom-0 p-6 md:p-10">
              <p className="text-[44px] leading-[0.95] font-bold tracking-[-0.05em] text-white md:text-[64px]">
                {current.name}
              </p>
              <Link
                href={`/collections/${current.slug}`}
                className="mt-5 inline-flex items-center gap-2 text-[12px] font-bold text-white underline underline-offset-4"
              >
                View category <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

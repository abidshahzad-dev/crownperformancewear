import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { asLink, cn, str } from "@/lib/utils";
import { DisplayTitle } from "./section-heading";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-muted text-[12px]", className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 ? <span aria-hidden>/</span> : null}
            {item.href ? (
              <Link href={item.href} className="hover:text-signal text-white">
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Full-bleed dark hero used by inner pages. */
export function PageHero({
  section,
  crumbs,
  children,
  compact = false,
}: {
  section: Record<string, unknown>;
  crumbs?: Crumb[];
  children?: ReactNode;
  compact?: boolean;
}) {
  const image = str(section.image);
  const primary = asLink(section.primary);
  const secondary = asLink(section.secondary);

  return (
    <section className="bg-night relative isolate overflow-hidden">
      {image ? (
        <>
          <div className="absolute inset-x-0 -top-[8%] -bottom-[8%] -z-20" data-parallax="-0.14">
            <Image src={image} alt="" fill priority sizes="100vw" className="hero-zoom object-cover object-center" />
          </div>
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(2,7,12,0.94)_0%,rgba(2,7,12,0.78)_42%,rgba(2,7,12,0.25)_100%)]" />
          <div className="from-night absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t to-transparent" />
        </>
      ) : null}
      <div
        className={cn(
          "shell flex flex-col justify-end pt-[120px] pb-16 md:pb-24 xl:pt-[150px]",
          compact ? "min-h-[420px]" : "min-h-[620px] md:min-h-[700px]",
        )}
      >
        {crumbs?.length ? <Breadcrumbs items={crumbs} className="mb-auto pb-10" /> : null}
        <div className="hero-copy max-w-[860px]">
          {section.eyebrow ? <p className="eyebrow text-signal mb-5">{str(section.eyebrow)}</p> : null}
          <DisplayTitle as="h1" title={section.title} className="display-xl text-white-soft" />
          {section.text ? (
            <p className="text-white-soft/90 mt-7 max-w-[620px] text-[16px] leading-[1.55]">{str(section.text)}</p>
          ) : null}
          {primary || secondary ? (
            <div className="mt-9 flex flex-wrap gap-3">
              {primary ? (
                <Link href={primary.href} className="btn btn-signal">
                  {primary.label}
                  <ArrowRight className="size-4" />
                </Link>
              ) : null}
              {secondary ? (
                <Link href={secondary.href} className="btn btn-ghost">
                  {secondary.label}
                  <ArrowRight className="size-4" />
                </Link>
              ) : null}
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </section>
  );
}

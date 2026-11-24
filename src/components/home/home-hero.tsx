import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CmsIcon } from "@/components/site/icons";
import { DisplayTitle } from "@/components/site/section-heading";
import { asLink, asList, str } from "@/lib/utils";

type Section = Record<string, unknown>;

export function HomeHero({ s }: { s: Section }) {
  const primary = asLink(s.primary);
  const secondary = asLink(s.secondary);
  const image = str(s.image);
  return (
    <section className="bg-night relative isolate md:min-h-[max(760px,100svh)]">
      {image ? (
        <div className="relative h-[330px] overflow-hidden md:absolute md:inset-0 md:h-auto">
          <div className="absolute inset-x-0 -top-[6%] -bottom-[6%]" data-parallax="-0.12">
            <Image
              src={image}
              alt=""
              fill
              priority
              sizes="100vw"
              className="hero-zoom object-cover object-[70%_center]"
            />
          </div>
          <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(2,7,12,0.9)_0%,rgba(2,7,12,0.62)_38%,rgba(2,7,12,0.05)_72%)] md:block" />
          <div className="from-night absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t to-transparent" />
          <div className="from-night/70 absolute inset-x-0 top-0 h-40 bg-gradient-to-b to-transparent" />
        </div>
      ) : null}
      <div className="shell relative flex flex-col justify-center pt-6 pb-14 md:min-h-[max(760px,100svh)] md:pt-[150px] md:pb-28">
        <div className="hero-copy max-w-[860px]">
          <p className="eyebrow text-signal mb-6">{str(s.eyebrow)}</p>
          <DisplayTitle as="h1" title={s.title} className="display-xl text-white-soft" />
          <p className="text-white-soft mt-8 max-w-[660px] text-[16px] leading-[1.55]">{str(s.text)}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            {primary ? (
              <Link href={primary.href} className="btn btn-signal min-h-[54px] sm:min-w-[220px]">
                {primary.label}
                <ArrowRight className="size-4" />
              </Link>
            ) : null}
            {secondary ? (
              <Link
                href={secondary.href}
                className="btn btn-ghost min-h-[54px] max-sm:justify-start max-sm:border-0 max-sm:bg-transparent max-sm:px-0"
              >
                {secondary.label}
                <ArrowRight className="size-4" />
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProofBand({ s }: { s: Section }) {
  const items = asList<{ icon?: string; title?: string; text?: string }>(s.items);
  const noteLink = asLink(s.noteLink);
  return (
    <section className="bg-night border-t border-white/10">
      <div className="shell">
        <ul className="proof-in grid grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <li
              key={`${item.title}-${i}`}
              className="flex gap-4 border-white/10 px-0 py-6 max-lg:odd:pr-4 max-lg:even:border-l max-lg:even:pl-4 lg:border-l lg:px-[30px] lg:first:border-l-0 lg:first:pl-0 max-lg:[&:nth-child(-n+2)]:border-b"
            >
              <CmsIcon name={item.icon ?? "package"} className="text-signal mt-0.5 size-[22px] shrink-0" />
              <div>
                <p className="text-[13px] font-extrabold tracking-[0.06em] text-white uppercase">{item.title}</p>
                <p className="text-muted mt-1.5 text-[12px] leading-[1.5]">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
        {s.note ? (
          <p className="text-muted border-t border-white/10 py-4 text-[12px]">
            {str(s.note)}{" "}
            {noteLink ? (
              <Link href={noteLink.href} className="text-white underline-offset-4 hover:underline">
                {noteLink.label} →
              </Link>
            ) : null}
          </p>
        ) : null}
      </div>
    </section>
  );
}

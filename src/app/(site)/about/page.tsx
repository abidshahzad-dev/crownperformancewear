import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TrustCards } from "@/components/home/home-middle";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { DisplayTitle } from "@/components/site/section-heading";
import { getPageSections } from "@/lib/data/public";
import { asLink, asList, str } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About Us",
  description: "The people and business behind Crown Performance Wear, a wholesale activewear partner.",
};

type Item = { title?: string; text?: string };

export default async function AboutPage() {
  const [page, home] = await Promise.all([getPageSections("about"), getPageSections("home")]);
  const stats = asList<{ value?: string; label?: string }>(page.intro.stats);
  const pillars = asList<Item>(page.pillars.items);
  const milestones = asList<Item & { year?: string }>(page.milestones.items);
  const values = asList<Item>(page.values.items);
  const ctaButton = asLink(page.cta.button);
  const ctaImage = str(page.cta.image);

  return (
    <>
      <PageHero section={page.hero} crumbs={[{ label: "Home", href: "/" }, { label: "About" }]} />

      <section className="bg-paper text-paper-ink py-24 md:py-28">
        <div className="shell grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <p className="eyebrow text-paper-eyebrow mb-5">{str(page.intro.eyebrow)}</p>
            <DisplayTitle title={page.intro.title} className="display-lg" />
          </div>
          <div className="self-end">
            <p className="text-paper-muted text-[16px] leading-[1.7]">{str(page.intro.text)}</p>
          </div>
        </div>
        <dl data-reveal="stagger" className="shell mt-16 grid grid-cols-2 border-t-2 border-[#cbe7a3] lg:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={`${s.label}-${i}`}
              className="border-line-dark border-b p-5 [&:not(:first-child)]:border-l max-lg:[&:nth-child(3)]:border-l-0"
            >
              <dd className="text-[clamp(34px,3.4vw,48px)] font-bold tracking-[-0.06em]">{s.value}</dd>
              <dt className="text-paper-muted mt-2 text-[12px]">{s.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <TrustCards s={{ ...home.trust }} />

      <section className="bg-navy py-24 md:py-28">
        <div className="shell">
          <p className="eyebrow text-signal mb-5">{str(page.pillars.eyebrow)}</p>
          <DisplayTitle title={page.pillars.title} className="display-lg max-w-[900px] text-white" />
          <div className="mt-14 grid border-t border-white/10 md:grid-cols-3">
            {pillars.map((p, i) => (
              <Reveal
                key={`${p.title}-${i}`}
                delay={i * 80}
                className="border-b border-white/10 py-9 md:border-b-0 md:px-8 md:first:pl-0 md:[&:not(:first-child)]:border-l"
              >
                <span className="text-signal text-[11px] font-bold">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-6 text-[28px] leading-[1] font-bold tracking-[-0.045em] text-white">{p.title}</h3>
                <p className="text-muted mt-4 text-[14px] leading-[1.6]">{p.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper text-paper-ink py-24 md:py-28">
        <div className="shell">
          <p className="eyebrow text-paper-eyebrow mb-5">{str(page.milestones.eyebrow)}</p>
          <DisplayTitle title={page.milestones.title} className="display-lg" />
          <ol data-reveal="stagger" className="bg-line-dark mt-14 grid gap-px overflow-hidden rounded-md md:grid-cols-2 lg:grid-cols-4">
            {milestones.map((m, i) => (
              <li key={`${m.year}-${i}`} className="bg-paper-soft p-7">
                <p className="display text-paper-ink text-[44px]">{m.year}</p>
                <p className="mt-6 text-[17px] font-bold">{m.title}</p>
                <p className="text-paper-muted mt-2 text-[13px] leading-[1.6]">{m.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-ink py-24 md:py-28">
        <div className="shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow text-signal mb-5">{str(page.values.eyebrow)}</p>
            <DisplayTitle title={page.values.title} className="display-lg text-white" />
          </div>
          <div data-reveal="stagger" className="grid gap-4 sm:grid-cols-2">
            {values.map((v, i) => (
              <div key={`${v.title}-${i}`} className="rounded-md border border-white/10 p-6">
                <p className="text-[18px] font-bold text-white">{v.title}</p>
                <p className="text-muted mt-2 text-[14px] leading-[1.6]">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper text-paper-ink py-24 md:py-28">
        <div className="shell grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="eyebrow text-paper-eyebrow mb-5">{str(page.cta.eyebrow)}</p>
            <DisplayTitle title={page.cta.title} className="display-md" />
            <p className="text-paper-muted mt-6 max-w-[480px] text-[15px] leading-[1.65]">{str(page.cta.text)}</p>
            {ctaButton ? (
              <Link href={ctaButton.href} className="btn btn-ink mt-8">
                {ctaButton.label} <ArrowRight className="size-4" />
              </Link>
            ) : null}
          </div>
          {ctaImage ? (
            <div data-reveal="clip" className="relative aspect-[4/3] overflow-hidden rounded-[22px]">
              <Image src={ctaImage} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}

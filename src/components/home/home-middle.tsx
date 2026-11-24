import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/site/reveal";
import { DisplayTitle } from "@/components/site/section-heading";
import { asLink, asList, asStrings, cn, str } from "@/lib/utils";

type Section = Record<string, unknown>;

export function StatementBanner({ s }: { s: Section }) {
  const image = str(s.image);
  return (
    <section className="relative isolate overflow-hidden bg-[#10171a]">
      {image ? (
        <>
          <div className="absolute inset-x-0 -top-[14%] -bottom-[14%] -z-20" data-parallax="-0.22">
            <Image src={image} alt="" fill sizes="100vw" className="object-cover" />
          </div>
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(6,12,15,0.92)_0%,rgba(6,12,15,0.55)_55%,rgba(6,12,15,0.35)_100%)]" />
        </>
      ) : null}
      <div className="shell flex min-h-[520px] flex-col justify-center py-24 md:min-h-[684px]">
        <Reveal effect="fade">
          <p className="eyebrow mb-6 text-white">{str(s.eyebrow)}</p>
        </Reveal>
        <DisplayTitle
          title={s.title}
          className="text-[clamp(56px,10vw,144px)] leading-[0.78] tracking-[-0.075em] text-white uppercase"
        />
        <Reveal delay={250}>
          <p className="mt-8 max-w-[420px] text-[14px] leading-[1.6] text-white/85">{str(s.text)}</p>
        </Reveal>
      </div>
    </section>
  );
}

/** Four-column photo mosaic with a centred overlay title; columns drift at different speeds on scroll. */
export function GalleryMosaic({ s }: { s: Section }) {
  const images = asList<{ url?: string; alt?: string }>(s.images).filter((i) => i.url);
  const cta = asLink(s.cta);
  const bullets = asStrings(s.bullets);
  const columns = [0, 1, 2, 3].map((c) => images.filter((_, i) => i % 4 === c));
  const heights = [
    ["h-[260px] md:h-[330px]", "h-[200px] md:h-[250px]"],
    ["h-[180px] md:h-[230px]", "h-[260px] md:h-[350px]"],
    ["h-[240px] md:h-[300px]", "h-[200px] md:h-[280px]"],
    ["h-[200px] md:h-[260px]", "h-[240px] md:h-[320px]"],
  ];
  const speeds = ["0.06", "-0.08", "0.1", "-0.05"];

  return (
    <section className="bg-ink overflow-hidden py-16 md:py-24">
      <div className="relative mx-auto w-[min(1400px,calc(100vw-24px))]">
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3">
          {columns.map((col, c) => (
            <div key={c} className={cn(c > 1 && "max-md:hidden", c % 2 === 1 && "md:pt-12")}>
              <div className="flex flex-col gap-2.5 md:gap-3" data-parallax={speeds[c]}>
                {col.map((img, i) => (
                  <Reveal
                    key={`${img.url}-${i}`}
                    effect="clip"
                    delay={c * 90 + i * 120}
                    className={cn("relative overflow-hidden rounded-[18px]", heights[c][i % 2])}
                  >
                    <Image
                      src={img.url as string}
                      alt={img.alt ?? ""}
                      fill
                      sizes="(min-width: 768px) 25vw, 50vw"
                      className="object-cover"
                    />
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-[radial-gradient(ellipse_at_center,rgba(7,18,28,0.85)_0%,rgba(7,18,28,0.5)_45%,transparent_75%)] px-5">
          <div className="pointer-events-auto text-center">
            <Reveal effect="fade">
              <p className="eyebrow text-signal mb-4">{str(s.eyebrow)}</p>
            </Reveal>
            <DisplayTitle
              title={s.title}
              className="font-sans text-[clamp(40px,6vw,82px)] leading-[0.95] font-bold tracking-[-0.055em] text-white"
            />
            {cta ? (
              <Reveal delay={350}>
                <Link
                  href={cta.href}
                  className="text-ink hover:bg-signal mt-7 inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-[11px] font-extrabold tracking-[0.08em] uppercase transition-colors"
                >
                  {cta.label}
                  <ArrowRight className="size-3.5" />
                </Link>
              </Reveal>
            ) : null}
          </div>
        </div>
      </div>

      <div className="shell mt-14 grid gap-10 md:grid-cols-2 md:gap-16">
        <Reveal>
          <p className="text-muted-2 max-w-[560px] text-[14px] leading-[1.7]">{str(s.body)}</p>
          {s.note ? <p className="text-muted mt-5 text-[11px]">{str(s.note)}</p> : null}
        </Reveal>
        <Reveal as="ol" effect="stagger">
          {bullets.map((b, i) => (
            <li key={b} className="flex items-center gap-5 border-b border-white/10 py-3.5 text-[13px] text-white">
              <span className="text-signal text-[10px] font-bold">{String(i + 1).padStart(2, "0")}</span>
              {b}
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export function TrustCards({ s }: { s: Section }) {
  const cards = asList<{ title?: string; text?: string }>(s.cards);
  return (
    <section className="bg-ink pt-6 pb-20 md:pb-24">
      <div className="shell">
        <Reveal>
          <h2 className="display text-[clamp(30px,3.2vw,44px)] text-white">{str(s.title)}</h2>
          <p className="text-muted-2 mt-5 max-w-[760px] text-[14px] leading-[1.65]">{str(s.text)}</p>
        </Reveal>
        <Reveal effect="stagger" className="mt-9 grid gap-4 md:grid-cols-3">
          {cards.map((card, i) => (
            <div key={`${card.title}-${i}`} className="bg-paper-soft text-paper-ink lift rounded-md p-5">
              <p className="text-[13px] font-bold">{card.title}</p>
              <p className="text-paper-muted mt-2.5 text-[13px] leading-[1.55]">{card.text}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export function OrderEssentials({ s }: { s: Section }) {
  const stats = asList<{ label?: string; value?: string; unit?: string; text?: string; href?: string }>(s.stats);
  return (
    <section className="bg-paper text-paper-ink pt-[100px] pb-[86px]">
      <div className="shell">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <Reveal effect="fade">
              <p className="eyebrow text-paper-ink mb-5">{str(s.eyebrow)}</p>
            </Reveal>
            <DisplayTitle title={s.title} className="display-lg max-w-[720px]" />
          </div>
          <Reveal delay={200}>
            <p className="text-paper-muted max-w-[300px] text-[13px] leading-[1.6] md:pb-2">{str(s.text)}</p>
          </Reveal>
        </div>
        <div className="relative mt-14">
          <div data-reveal="grow" className="absolute inset-x-0 top-0 h-0.5 bg-[#b7e27a]" />
          <Reveal effect="stagger" className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            {stats.map((stat, i) => {
              const content = (
                <>
                  <p className="text-paper-ink min-h-[30px] text-[10px] leading-[1.4] font-extrabold tracking-[0.1em] uppercase">
                    {stat.label}
                  </p>
                  <p className="mt-6 text-[clamp(26px,2.3vw,32px)] leading-[0.92] font-bold tracking-[-0.055em]">
                    {stat.value}
                  </p>
                  <p className="text-paper-ink mt-1.5 text-[13px]">{stat.unit}</p>
                  <p className="text-paper-muted mt-4 text-[12px] leading-[1.5]">{stat.text}</p>
                  {stat.href ? (
                    <ArrowRight className="text-paper-ink mt-auto size-4 transition-transform group-hover:translate-x-1" />
                  ) : null}
                </>
              );
              const cls =
                "group flex min-h-[230px] flex-col border-b border-line-dark p-5 pb-6 transition-colors duration-300 hover:bg-white/60 [&:not(:first-child)]:border-l max-md:[&:nth-child(2n+1)]:border-l-0 md:max-xl:[&:nth-child(3n+1)]:border-l-0";
              return stat.href ? (
                <Link key={`${stat.label}-${i}`} href={stat.href} className={cls}>
                  {content}
                </Link>
              ) : (
                <div key={`${stat.label}-${i}`} className={cls}>
                  {content}
                </div>
              );
            })}
          </Reveal>
        </div>
        {s.note ? <p className="text-paper-muted mt-6 text-[11px]">{str(s.note)}</p> : null}
      </div>
    </section>
  );
}

export function ProcessIntro({ s }: { s: Section }) {
  const tags = asStrings(s.tags);
  const image = str(s.image);
  return (
    <section className="bg-paper text-paper-ink pt-10 pb-24 md:pb-28">
      <div className="shell grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        <div>
          <Reveal effect="fade">
            <p className="eyebrow text-paper-ink mb-5">{str(s.eyebrow)}</p>
          </Reveal>
          <DisplayTitle title={s.title} className="display-md" />
          <Reveal delay={200}>
            <p className="text-paper-muted mt-5 max-w-[480px] text-[14px] leading-[1.6]">{str(s.text)}</p>
          </Reveal>
          <Reveal as="ul" effect="stagger" className="mt-8 grid max-w-[540px] grid-cols-2 gap-x-8">
            {tags.map((tag) => (
              <li
                key={tag}
                className="border-line-dark border-t py-3.5 text-[10px] font-extrabold tracking-[0.14em] uppercase"
              >
                {tag}
              </li>
            ))}
          </Reveal>
        </div>
        {image ? (
          <Reveal effect="clip" className="relative aspect-[4/3] overflow-hidden rounded-[22px]">
            <div className="absolute inset-x-0 -top-[8%] -bottom-[8%]" data-parallax="0.08">
              <Image src={image} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}

type Step = { title?: string; text?: string; note?: string };
type Stage = { title?: string; image?: string; caption?: string; steps?: Step[] };

export function ProcessStages({ s }: { s: Section }) {
  const stages = asList<Stage>(s.stages);
  const offsets = stages.map((_, i) => stages.slice(0, i).reduce((n, st) => n + asList<Step>(st.steps).length, 0));
  return (
    <section className="bg-navy py-24 md:py-28">
      <div className="shell">
        <Reveal effect="fade">
          <p className="eyebrow text-signal mb-5">{str(s.eyebrow)}</p>
        </Reveal>
        <DisplayTitle title={s.title} className="display-lg max-w-[900px] text-white" />
        <div className="mt-16 space-y-20 md:space-y-28">
          {stages.map((stage, i) => (
            <div key={`${stage.title}-${i}`} className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
              {stage.image ? (
                <div className={cn("lg:sticky lg:top-[130px]", i % 2 === 1 && "lg:order-2")}>
                  <Reveal effect="clip" className="relative aspect-[4/3] overflow-hidden rounded-[22px]">
                    <Image
                      src={stage.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </Reveal>
                  {stage.caption ? <p className="text-muted mt-3 text-[11px]">{stage.caption}</p> : null}
                </div>
              ) : null}
              <div>
                <Reveal>
                  <h3 className="text-[clamp(30px,3vw,42px)] leading-[1] font-bold tracking-[-0.05em] text-white">
                    {stage.title}
                  </h3>
                </Reveal>
                <Reveal as="ol" effect="stagger" className="mt-8">
                  {asList<Step>(stage.steps).map((step, j) => {
                    const counter = offsets[i] + j + 1;
                    return (
                      <li
                        key={`${step.title}-${counter}`}
                        className="grid grid-cols-[42px_1fr] border-t border-white/10 py-6"
                      >
                        <span className="text-signal pt-1.5 text-[11px] font-bold">
                          {String(counter).padStart(2, "0")}
                        </span>
                        <div>
                          <p className="text-[20px] font-bold tracking-[-0.02em] text-white">{step.title}</p>
                          <p className="text-muted-2 mt-2 text-[14px] leading-[1.6]">{step.text}</p>
                          {step.note ? (
                            <p className="text-muted mt-2.5 text-[12px] leading-[1.5]">{step.note}</p>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </Reveal>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { FaqList } from "@/components/site/faq-list";
import { WhatsAppIcon } from "@/components/site/icons";
import { InquiryForm } from "@/components/site/inquiry-form";
import { Reveal } from "@/components/site/reveal";
import { DisplayTitle } from "@/components/site/section-heading";
import type { Faq, Post, Service } from "@/lib/types";
import { asLink, asList, str, whatsappHref } from "@/lib/utils";

type Section = Record<string, unknown>;

export function ServiceCard({ service, index }: { service: Service; index: number }) {
  return (
    <article className="group bg-card lift flex h-full flex-col overflow-hidden rounded-[var(--radius-xl)]">
      <Link
        href={`/services/${service.slug}`}
        className="relative block aspect-[4/3] overflow-hidden"
        data-reveal="clip"
        style={{ "--clip-r": "0px" } as CSSProperties}
      >
        {service.image_url ? (
          <Image
            src={service.image_url}
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-7 md:p-9">
        <p className="text-[11px] font-bold text-white/80">{String(index + 1).padStart(2, "0")}</p>
        <h3 className="mt-4 text-[clamp(30px,3vw,43px)] leading-[0.96] font-bold tracking-[-0.05em] text-[#eef3f3]">
          <Link href={`/services/${service.slug}`}>{service.title}</Link>
        </h3>
        <p className="text-muted mt-4 max-w-[440px] text-[13px] leading-[1.6]">{service.excerpt}</p>
        <Link href={`/services/${service.slug}`} className="text-link hover:text-signal mt-auto pt-8 text-white">
          Explore service <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}

export function HomeServices({ s, services }: { s: Section; services: Service[] }) {
  const link = asLink(s.link);
  return (
    <section className="bg-navy py-24 md:py-[115px]">
      <div className="shell">
        <Reveal effect="fade">
          <p className="eyebrow text-signal mb-10 md:mb-16">{str(s.eyebrow)}</p>
        </Reveal>
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <DisplayTitle title={s.title} className="text-[clamp(44px,5.4vw,78px)] text-[#f5f7f5]" />
          <Reveal delay={200}>
            <p className="text-muted max-w-[260px] text-[13px] leading-[1.6]">{str(s.text)}</p>
          </Reveal>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {services.map((service, i) => (
            <Reveal key={service.id} delay={(i % 2) * 110}>
              <ServiceCard service={service} index={i} />
            </Reveal>
          ))}
        </div>
        {link ? (
          <Link href={link.href} className="text-link hover:text-signal mt-12 text-white">
            {link.label} <ArrowRight className="size-4" />
          </Link>
        ) : null}
      </div>
    </section>
  );
}

type LinkItem = { title?: string; text?: string; href?: string };

export function FirstOrder({ s }: { s: Section }) {
  const items = asList<LinkItem>(s.items);
  const link = asLink(s.link);
  return (
    <section className="bg-paper text-paper-ink py-24 md:py-[115px]">
      <div className="shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <Reveal effect="fade">
            <p className="eyebrow mb-5">{str(s.eyebrow)}</p>
          </Reveal>
          <DisplayTitle title={s.title} className="display-lg" />
          <Reveal delay={250}>
            <p className="text-paper-muted mt-6 max-w-[300px] text-[13px] leading-[1.6]">{str(s.text)}</p>
          </Reveal>
        </div>
        <div className="self-center">
          <div className="relative">
            <span data-reveal="grow" className="bg-line-dark absolute inset-x-0 top-0 h-px" />
            <Reveal as="ul" effect="stagger">
              {items.map((item, i) => (
                <li key={`${item.title}-${i}`} className="relative">
                  <Link
                    href={item.href || "#"}
                    className="group grid grid-cols-[34px_minmax(0,1fr)_20px] items-center gap-x-4 gap-y-2 py-7 transition-[padding] duration-500 hover:pl-3 md:grid-cols-[44px_minmax(0,1fr)_minmax(0,1fr)_24px] md:gap-x-6"
                  >
                    <span className="text-[10px] font-bold">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[17px] font-extrabold tracking-[-0.01em] uppercase md:text-[18px]">
                      {item.title}
                    </span>
                    <span className="text-paper-muted col-span-2 col-start-2 row-start-2 text-[12px] leading-[1.55] md:col-span-1 md:col-start-3 md:row-start-1">
                      {item.text}
                    </span>
                    <ArrowRight className="col-start-3 row-start-1 size-4 transition-transform group-hover:translate-x-1 md:col-start-4" />
                  </Link>
                  <span
                    data-reveal="grow"
                    className="bg-line-dark absolute inset-x-0 bottom-0 h-px"
                    style={{ "--d": `${150 + i * 120}ms` } as CSSProperties}
                  />
                </li>
              ))}
            </Reveal>
          </div>
          {link ? (
            <Link href={link.href} className="text-link mt-8">
              {link.label} <ArrowRight className="size-4" />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function BuyerResources({ s }: { s: Section }) {
  const items = asList<LinkItem>(s.items);
  const link = asLink(s.link);
  return (
    <section className="bg-navy py-24 md:py-[115px]">
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          <Reveal effect="fade">
            <p className="eyebrow text-signal">{str(s.eyebrow)}</p>
          </Reveal>
          <DisplayTitle title={s.title} className="display-lg text-white" />
        </div>
        <Reveal>
          <p className="text-muted-2 mt-10 max-w-[440px] text-[14px] leading-[1.65] lg:mt-16">{str(s.text)}</p>
        </Reveal>
        <div className="relative mt-12">
          <span data-reveal="grow" className="absolute inset-x-0 top-0 h-px bg-white/10" />
          <Reveal effect="stagger" className="grid md:grid-cols-3">
            {items.map((item, i) => (
              <Link
                key={`${item.title}-${i}`}
                href={item.href || "#"}
                className="group flex flex-col border-b border-white/10 py-9 transition-colors duration-500 hover:bg-white/[0.03] md:border-b-0 md:px-8 md:first:pl-0 md:[&:not(:first-child)]:border-l"
              >
                <span className="text-signal text-[11px] font-bold">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-8 text-[clamp(30px,3vw,44px)] leading-[0.98] font-bold tracking-[-0.05em] text-white">
                  {item.title}
                </h3>
                <p className="text-muted mt-4 text-[13px] leading-[1.6]">{item.text}</p>
                <span className="text-link group-hover:text-signal mt-8 text-white">
                  Open guide <ArrowRight className="size-4" />
                </span>
              </Link>
            ))}
          </Reveal>
        </div>
        {link ? (
          <Link href={link.href} className="text-link hover:text-signal mt-10 text-white">
            {link.label} <ArrowRight className="size-4" />
          </Link>
        ) : null}
      </div>
    </section>
  );
}

export function CatalogueBanner({ s, whatsapp }: { s: Section; whatsapp: string }) {
  const cta = asLink(s.cta);
  const image = str(s.image);
  const href =
    cta?.href === "#inquiry" && whatsapp
      ? whatsappHref(whatsapp, "Hello, please send me your wholesale catalogue and price list.")
      : (cta?.href ?? "#inquiry");
  const external = href.startsWith("http");
  return (
    <section className="bg-paper text-paper-ink pb-24 md:pb-[115px]">
      <div className="shell">
        <Reveal className="border-line-dark grid items-center gap-6 rounded-md border bg-white/40 p-5 md:grid-cols-[200px_1fr_auto] md:gap-10 md:p-6">
          {image ? (
            <div
              className="media-zoom relative aspect-[4/3] overflow-hidden rounded-sm md:aspect-[1/1.05]"
              data-reveal="clip"
              style={{ "--clip-r": "2px", "--d": "150ms" } as CSSProperties}
            >
              <Image src={image} alt="" fill sizes="200px" className="object-cover" />
            </div>
          ) : null}
          <div>
            <p className="eyebrow text-paper-eyebrow mb-3">{str(s.eyebrow)}</p>
            <h2 className="display text-[clamp(32px,3.4vw,46px)]">{str(s.title)}</h2>
            <p className="text-paper-muted mt-4 max-w-[560px] text-[13px] leading-[1.6]">{str(s.text)}</p>
          </div>
          {cta ? (
            <a
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noreferrer" : undefined}
              className="btn btn-signal gap-3 justify-self-start md:mr-4"
            >
              <WhatsAppIcon className="size-4" />
              {cta.label}
              <ArrowRight className="size-4" />
            </a>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}

export function HomeFaq({ s, faqs }: { s: Section; faqs: Faq[] }) {
  const link = asLink(s.link);
  return (
    <section className="bg-navy py-24 md:py-[115px]">
      <div className="shell grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
        <div className="lg:sticky lg:top-[130px] lg:self-start">
          <Reveal effect="fade">
            <p className="eyebrow text-signal mb-6">{str(s.eyebrow)}</p>
          </Reveal>
          <DisplayTitle title={s.title} className="text-[clamp(48px,6vw,86px)] text-white" />
          <Reveal delay={300}>
            <p className="text-muted mt-7 max-w-[260px] text-[13px] leading-[1.6]">{str(s.text)}</p>
            {link ? (
              <Link href={link.href} className="text-link hover:text-signal mt-8 text-white">
                {link.label} <ArrowRight className="size-4" />
              </Link>
            ) : null}
          </Reveal>
        </div>
        <FaqList faqs={faqs} reveal />
      </div>
    </section>
  );
}

export function PostCard({ post, large = false }: { post: Post; large?: boolean }) {
  return (
    <Link
      href={`/insights/${post.slug}`}
      className="group bg-ink relative flex w-full shrink-0 snap-start flex-col justify-end overflow-hidden rounded-md"
    >
      {post.cover_url ? (
        <Image
          src={post.cover_url}
          alt=""
          fill
          sizes="(min-width: 768px) 40vw, 85vw"
          className="object-cover opacity-80 transition-transform duration-[1.1s] ease-[var(--ease-out)] group-hover:scale-[1.06]"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />
      <div className="relative p-6 md:p-7">
        {post.tag ? <p className="eyebrow text-signal">{post.tag}</p> : null}
        <h3
          className={
            large
              ? "mt-3 text-[clamp(28px,2.8vw,40px)] leading-[1] font-bold tracking-[-0.045em] text-white"
              : "mt-3 text-[24px] leading-[1.05] font-bold tracking-[-0.04em] text-white"
          }
        >
          {post.title}
        </h3>
        <p className="mt-4 line-clamp-3 text-[13px] leading-[1.55] text-white/80">{post.excerpt}</p>
        <span className="text-link text-signal mt-6">
          Read article <ArrowRight className="size-4" />
        </span>
      </div>
    </Link>
  );
}

/** Pinned on desktop: scrolling down moves the article cards sideways (like the reference design). */
export function HomeInsights({ s, posts }: { s: Section; posts: Post[] }) {
  const link = asLink(s.link);
  return (
    <section className="bg-paper text-paper-ink relative" data-hscroll>
      <div className="hs-stage overflow-hidden py-24 md:py-[115px] lg:py-0">
        <div className="shell grid w-full gap-10 lg:grid-cols-[300px_1fr] lg:items-center lg:gap-14">
          <div>
            <Reveal effect="fade">
              <p className="eyebrow mb-5">{str(s.eyebrow)}</p>
            </Reveal>
            <DisplayTitle title={s.title} className="text-[clamp(40px,4.2vw,58px)]" />
            <Reveal delay={250}>
              <p className="text-paper-muted mt-6 text-[13px] leading-[1.6]">{str(s.text)}</p>
              {link ? (
                <Link href={link.href} className="text-link mt-8">
                  {link.label} <ArrowRight className="size-4" />
                </Link>
              ) : null}
            </Reveal>
          </div>
          <div
            data-hscroll-track
            className="no-scrollbar -mr-[max(20px,calc((100vw-1320px)/2))] flex snap-x snap-mandatory gap-5 overflow-x-auto pr-5 pb-2"
          >
            {posts.map((post, i) => (
              <Reveal
                key={post.id}
                delay={i * 120}
                className="flex h-[480px] w-[85vw] shrink-0 snap-start md:h-[560px] md:w-[min(520px,44vw)]"
              >
                <PostCard post={post} large />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function FinalInquiry({ s, categories }: { s: Section; categories: string[] }) {
  const image = str(s.image);
  return (
    <section id="inquiry" className="relative isolate scroll-mt-24 overflow-hidden bg-[#061018]">
      {image ? (
        <>
          <div className="absolute inset-x-0 -top-[14%] -bottom-[14%] -z-20" data-parallax="-0.2">
            <Image src={image} alt="" fill sizes="100vw" className="object-cover" />
          </div>
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(6,16,24,0.95)_0%,rgba(6,16,24,0.82)_50%,rgba(6,16,24,0.7)_100%)]" />
        </>
      ) : null}
      <div className="shell grid items-center gap-12 py-24 lg:min-h-[620px] lg:grid-cols-[1fr_468px] lg:gap-16">
        <div>
          <Reveal effect="fade">
            <p className="eyebrow text-signal mb-5">{str(s.eyebrow)}</p>
          </Reveal>
          <DisplayTitle title={s.title} className="display-lg text-white" />
          <Reveal delay={250}>
            <p className="mt-7 max-w-[440px] text-[16px] leading-[1.55] text-white/85">{str(s.text)}</p>
          </Reveal>
        </div>
        <Reveal delay={200}>
          <InquiryForm type="catalogue" categories={categories} submitLabel={str(s.button, "Request a catalogue")} />
        </Reveal>
      </div>
    </section>
  );
}

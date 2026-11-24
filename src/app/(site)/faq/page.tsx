import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { FaqList } from "@/components/site/faq-list";
import { PageHero } from "@/components/site/page-hero";
import { getFaqs, getPageSections } from "@/lib/data/public";
import { slugify } from "@/lib/utils";
import type { Faq } from "@/lib/types";

export const metadata: Metadata = {
  title: "Wholesale FAQ",
  description: "Answers on MOQ, pricing, samples, branding, quality control and shipping for wholesale buyers.",
};

export default async function FaqPage() {
  const [page, faqs] = await Promise.all([getPageSections("faq"), getFaqs()]);
  const groups = new Map<string, Faq[]>();
  for (const f of faqs) groups.set(f.group_name, [...(groups.get(f.group_name) ?? []), f]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PageHero section={page.hero} crumbs={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />
      <section className="bg-navy py-20 md:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[260px_1fr] lg:gap-20">
          <nav aria-label="FAQ topics" className="lg:sticky lg:top-[120px] lg:self-start">
            <p className="eyebrow text-signal mb-4">Topics</p>
            <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-0">
              {[...groups.keys()].map((g) => (
                <li key={g}>
                  <a
                    href={`#${slugify(g)}`}
                    className="text-muted-2 block border border-white/15 px-3 py-2 text-[13px] hover:text-white lg:border-0 lg:border-b lg:border-white/10 lg:px-0 lg:py-3"
                  >
                    {g}
                  </a>
                </li>
              ))}
            </ul>
            <Link href="/contact" className="text-link hover:text-signal mt-8 text-white">
              Ask a question <ArrowRight className="size-4" />
            </Link>
          </nav>
          <div className="space-y-16">
            {[...groups.entries()].map(([group, items]) => (
              <div key={group} id={slugify(group)} className="scroll-mt-28">
                <h2 className="text-[28px] font-bold tracking-[-0.04em] text-white">{group}</h2>
                <div className="mt-4">
                  <FaqList faqs={items} openFirst={false} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

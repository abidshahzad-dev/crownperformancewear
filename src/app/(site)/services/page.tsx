import type { Metadata } from "next";
import { ServiceCard } from "@/components/home/home-bottom";
import { CtaBand } from "@/components/site/cta-band";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { DisplayTitle } from "@/components/site/section-heading";
import { getPageSections, getServices } from "@/lib/data/public";
import { asList, asStrings, str } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Wholesale, Private Label & Team Apparel Services",
  description: "Ready-stock wholesale, private label programmes, custom team apparel and logo decoration.",
};

export default async function ServicesPage() {
  const [page, services] = await Promise.all([getPageSections("services"), getServices()]);
  const columns = asStrings(page.comparison.columns);
  const rows = asList<{ label?: string; values?: unknown }>(page.comparison.rows);

  return (
    <>
      <PageHero section={page.hero} crumbs={[{ label: "Home", href: "/" }, { label: "Services" }]} />

      <section className="bg-navy py-24 md:py-28">
        <div className="shell">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow text-signal mb-5">{str(page.intro.eyebrow)}</p>
              <DisplayTitle title={page.intro.title} className="display-lg text-white" />
            </div>
            <p className="text-muted max-w-[380px] text-[14px] leading-[1.6]">{str(page.intro.text)}</p>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {services.map((service, i) => (
              <Reveal key={service.id} delay={(i % 2) * 100}>
                <ServiceCard service={service} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {rows.length ? (
        <section className="bg-paper text-paper-ink py-24 md:py-28">
          <div className="shell">
            <p className="eyebrow text-paper-eyebrow mb-5">{str(page.comparison.eyebrow)}</p>
            <DisplayTitle title={page.comparison.title} className="display-md max-w-[900px]" />
            <p className="text-paper-muted mt-5 max-w-[560px] text-[14px] leading-[1.6]">{str(page.comparison.text)}</p>
            <div data-reveal="up" className="mt-12 overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-[14px]">
                <thead>
                  <tr className="border-paper-ink border-b-2">
                    <th className="w-[22%] py-4 pr-4" />
                    {columns.map((c) => (
                      <th key={c} className="py-4 pr-4 text-[11px] font-extrabold tracking-[0.12em] uppercase">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={`${row.label}-${i}`} className="border-line-dark border-b">
                      <th className="text-paper-muted py-5 pr-4 text-[11px] font-extrabold tracking-[0.1em] uppercase">
                        {row.label}
                      </th>
                      {columns.map((c, ci) => (
                        <td key={c} className="py-5 pr-4 font-medium">
                          {asStrings(row.values)[ci] ?? "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}

      <CtaBand s={page.cta} />
    </>
  );
}

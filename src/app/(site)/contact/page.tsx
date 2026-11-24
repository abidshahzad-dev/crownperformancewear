import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import { WhatsAppIcon } from "@/components/site/icons";
import { InquiryForm } from "@/components/site/inquiry-form";
import { PageHero } from "@/components/site/page-hero";
import { getPageSections, getSettings } from "@/lib/data/public";
import { asList, asStrings, str, whatsappHref } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact & Wholesale Enquiries",
  description: "Contact Crown Performance Wear for wholesale quotes, samples and custom team apparel.",
};

export default async function ContactPage() {
  const [page, settings] = await Promise.all([getPageSections("contact"), getSettings()]);
  const notes = asList<{ title?: string; text?: string }>(page.aside.items);
  const steps = asStrings(page.after.steps);

  return (
    <>
      <PageHero section={page.hero} crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      <section className="bg-ink-2 py-20 md:py-24">
        <div className="shell grid gap-10 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-md border border-white/10 bg-white/[0.03] p-6 md:p-10">
            <p className="eyebrow text-signal">{str(page.form.eyebrow)}</p>
            <h2 className="mt-4 text-[clamp(28px,3vw,40px)] font-bold tracking-[-0.045em] text-white">
              {str(page.form.title)}
            </h2>
            <p className="text-muted mt-3 max-w-[560px] text-[14px] leading-[1.6]">{str(page.form.text)}</p>
            <InquiryForm
              type="contact"
              variant="full"
              categories={settings.inquiry_categories}
              submitLabel="Send enquiry"
              className="mt-8"
            />
          </div>

          <aside className="space-y-6">
            <div className="bg-paper-soft text-paper-ink rounded-md p-6">
              <p className="text-[15px] font-bold">{str(page.aside.title)}</p>
              <ul className="mt-4 space-y-4">
                {notes.map((n, i) => (
                  <li key={`${n.title}-${i}`}>
                    <p className="text-[13px] font-bold">{n.title}</p>
                    <p className="text-paper-muted mt-1 text-[13px] leading-[1.55]">{n.text}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-md border border-white/10 p-6">
              <p className="eyebrow text-signal">Direct contact</p>
              <ul className="mt-5 space-y-4 text-[14px] text-white">
                <li className="flex gap-3">
                  <Mail className="text-muted mt-0.5 size-4 shrink-0" />
                  <a href={`mailto:${settings.email}`} className="hover:text-signal">
                    {settings.email}
                  </a>
                </li>
                <li className="flex gap-3">
                  <Phone className="text-muted mt-0.5 size-4 shrink-0" />
                  <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="hover:text-signal">
                    {settings.phone}
                  </a>
                </li>
                {settings.whatsapp ? (
                  <li className="flex gap-3">
                    <WhatsAppIcon className="text-muted mt-0.5 size-4 shrink-0" />
                    <a
                      href={whatsappHref(settings.whatsapp)}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-signal"
                    >
                      Chat on WhatsApp
                    </a>
                  </li>
                ) : null}
                <li className="flex gap-3">
                  <MapPin className="text-muted mt-0.5 size-4 shrink-0" />
                  <span className="text-muted-2 whitespace-pre-line">{settings.address}</span>
                </li>
                {settings.hours ? (
                  <li className="flex gap-3">
                    <Clock className="text-muted mt-0.5 size-4 shrink-0" />
                    <span className="text-muted-2">{settings.hours}</span>
                  </li>
                ) : null}
              </ul>
            </div>

            {steps.length ? (
              <div className="rounded-md border border-white/10 p-6">
                <p className="text-[15px] font-bold text-white">{str(page.after.title)}</p>
                <ol className="mt-4 space-y-3">
                  {steps.map((step, i) => (
                    <li key={step} className="text-muted-2 flex gap-3 text-[13px] leading-[1.55]">
                      <span className="text-signal text-[11px] font-bold">{String(i + 1).padStart(2, "0")}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </>
  );
}

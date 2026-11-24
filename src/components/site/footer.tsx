import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { whatsappHref } from "@/lib/utils";
import { Logo } from "./logo";

export function SiteFooter({ settings, year }: { settings: SiteSettings; year: number }) {
  const copyright = settings.copyright.replace("{year}", String(year));
  return (
    <footer className="bg-footer text-white">
      <div className="shell grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.1fr_1.4fr_1.3fr] lg:gap-10 lg:py-20">
        <div>
          <Logo name={settings.brand_short} logoUrl={settings.logo_url || undefined} />
          <p className="mt-6 max-w-[320px] text-[13px] leading-[1.65] text-[#a5b1b6]">{settings.description}</p>
          <p className="mt-4 text-[13px] leading-[1.65] whitespace-pre-line text-[#a5b1b6]">{settings.address}</p>
          <div className="mt-6 space-y-2 text-[13px]">
            <a href={`mailto:${settings.email}`} className="block text-[#d9e0e3] underline-offset-4 hover:underline">
              {settings.email}
            </a>
            {settings.whatsapp ? (
              <a
                href={whatsappHref(settings.whatsapp)}
                target="_blank"
                rel="noreferrer"
                className="block text-[#d9e0e3] underline-offset-4 hover:underline"
              >
                WhatsApp {settings.phone}
              </a>
            ) : null}
            {settings.hours ? <p className="text-[#a5b1b6]">{settings.hours}</p> : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {settings.footer_columns.map((col) => (
            <div key={col.title}>
              <p className="eyebrow mb-5 text-white">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={`${col.title}-${l.href}-${l.label}`}>
                    <Link href={l.href} className="hover:text-signal text-[13px] text-[#d9e0e3] transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div>
          <p className="eyebrow mb-3 text-white">Official profiles</p>
          <p className="max-w-[360px] text-[13px] leading-[1.65] text-[#a5b1b6]">
            Follow {settings.brand_name} for new styles, restocks and wholesale offers.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2.5">
            {settings.socials.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:border-signal inline-flex items-center border border-white/15 px-3.5 py-2.5 text-[12px] font-semibold text-[#d9e0e3] transition-colors hover:text-white"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <Link href="/contact" className="text-link text-signal mt-7">
            Contact the sales team
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-3 py-6 text-[11px] font-bold tracking-[0.12em] text-[#8c989e] uppercase sm:flex-row sm:items-center sm:justify-between">
          <p>{copyright}</p>
          <ul className="flex flex-wrap gap-5">
            {settings.legal_links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

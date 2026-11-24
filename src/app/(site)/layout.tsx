import type { Metadata } from "next";
import { EnquiryProvider } from "@/components/site/enquiry-list";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { MotionObserver } from "@/components/site/motion-observer";
import { WhatsAppFloat } from "@/components/site/whatsapp-float";
import { getSettings } from "@/lib/data/public";

export async function generateMetadata(): Promise<Metadata> {
  "use cache";
  const settings = await getSettings();
  return {
    title: { absolute: settings.seo_title, template: `%s | ${settings.brand_name}` },
    description: settings.seo_description,
    openGraph: { siteName: settings.brand_name, type: "website" },
  };
}

async function currentYear() {
  "use cache";
  return new Date().getFullYear();
}

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [settings, year] = await Promise.all([getSettings(), currentYear()]);
  return (
    <EnquiryProvider>
      <SiteHeader
        brand_short={settings.brand_short}
        logo_url={settings.logo_url}
        nav={settings.nav}
        header_cta={settings.header_cta}
        whatsapp={settings.whatsapp}
        popular_searches={settings.popular_searches}
        announcement={settings.announcement}
      />
      <main>{children}</main>
      <SiteFooter settings={settings} year={year} />
      <WhatsAppFloat number={settings.whatsapp} />
      <MotionObserver />
    </EnquiryProvider>
  );
}

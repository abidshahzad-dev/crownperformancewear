import { Check } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ServiceCard } from "@/components/home/home-bottom";
import { InquiryForm } from "@/components/site/inquiry-form";
import { Markdown } from "@/components/site/markdown";
import { PageHero } from "@/components/site/page-hero";
import { getServiceBySlug, getServices, getSettings } from "@/lib/data/public";

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Service not found" };
  return {
    title: service.seo_title || service.title,
    description: service.seo_description || service.excerpt || undefined,
  };
}

async function ServiceDetail({ params }: { params: PageProps<"/services/[slug]">["params"] }) {
  const { slug } = await params;
  const [service, services, settings] = await Promise.all([getServiceBySlug(slug), getServices(), getSettings()]);
  if (!service) notFound();
  const others = services.filter((s) => s.id !== service.id).slice(0, 2);

  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: service.title }]}
        section={{
          eyebrow: service.eyebrow,
          title: service.title,
          text: service.excerpt,
          image: service.image_url,
          primary: { label: "Request a quote", href: "#service-inquiry" },
        }}
      />

      <section className="bg-paper py-20 md:py-24">
        <div className="shell grid gap-14 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            {service.features.length ? (
              <ul className="mb-12 grid gap-3 sm:grid-cols-2">
                {service.features.map((f) => (
                  <li
                    key={f}
                    className="bg-paper-soft text-paper-ink flex items-start gap-3 rounded-md p-4 text-[14px] font-semibold"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-[#3d8b00]" /> {f}
                  </li>
                ))}
              </ul>
            ) : null}
            <Markdown>{service.body}</Markdown>
          </div>
          <div id="service-inquiry" className="scroll-mt-28 lg:sticky lg:top-[120px] lg:self-start">
            <div className="bg-ink rounded-md p-2">
              <p className="px-5 pt-5 pb-2 text-[22px] font-bold tracking-tight text-white">
                Start a {service.title.toLowerCase()} request
              </p>
              <InquiryForm
                type="quote"
                categories={settings.inquiry_categories}
                submitLabel="Send request"
                defaultMessage={`Service: ${service.title}\n`}
              />
            </div>
          </div>
        </div>
      </section>

      {others.length ? (
        <section className="bg-navy py-20 md:py-24">
          <div className="shell">
            <h2 className="display display-md mb-10 text-white">Other services</h2>
            <div className="grid gap-5 md:grid-cols-2">
              {others.map((s) => (
                <ServiceCard key={s.id} service={s} index={services.indexOf(s)} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

export default function ServicePage({ params }: PageProps<"/services/[slug]">) {
  return (
    <Suspense fallback={<div className="bg-night min-h-[700px]" />}>
      <ServiceDetail params={params} />
    </Suspense>
  );
}

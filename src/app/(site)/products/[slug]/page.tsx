import { ArrowRight, BadgeCheck, ClipboardList, Layers, PackageCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AddToEnquiry } from "@/components/site/add-to-enquiry";
import { WhatsAppIcon } from "@/components/site/icons";
import { Markdown } from "@/components/site/markdown";
import { Breadcrumbs } from "@/components/site/page-hero";
import { ProductCard } from "@/components/site/product-card";
import { ProductGallery } from "@/components/site/product-gallery";
import { getProductBySlug, getProducts, getRelatedProducts, getSettings } from "@/lib/data/public";
import { formatPrice, whatsappHref } from "@/lib/utils";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.slice(0, 50).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  const image = product.images[0]?.url;
  return {
    title: product.seo_title || `${product.name} | ${product.sku}`,
    description: product.seo_description || product.short_description || undefined,
    openGraph: image ? { images: [image] } : undefined,
  };
}

const ASSURANCES = [
  { icon: BadgeCheck, title: "Physical sample", text: "Approve the garment before bulk." },
  { icon: ClipboardList, title: "Written specification", text: "Measurements and tolerances recorded." },
  { icon: Layers, title: "Material approval", text: "Fabric, weight and colour confirmed." },
  { icon: PackageCheck, title: "Order-specific packing", text: "Packaging and cartons agreed in the quote." },
];

async function ProductDetail({ params }: { params: PageProps<"/products/[slug]">["params"] }) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSettings()]);
  if (!product) notFound();
  const related = await getRelatedProducts(product);

  const rows = (
    [
      ["Fabric", product.fabric ?? ""],
      ["Fabric weight", product.gsm ?? ""],
      ["Fit", product.fit ?? ""],
      ["Sizes", product.sizes.join(", ")],
      ["Colours", product.colors.join(", ")],
      ["Minimum order", `${product.moq}+ pieces per style · mixed sizes`],
      ["Sample timing", product.sample_time ?? ""],
      ["Lead time", product.lead_time ?? ""],
      ...product.specs
        .filter((s) => !["Fabric", "Fabric weight", "Fit"].includes(s.label))
        .map((s): [string, string] => [s.label, s.value]),
    ] as Array<[string, string]>
  ).filter(([, v]) => v);

  const enquiryItem = {
    product_id: product.id,
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    image: product.images[0]?.url,
    moq: product.moq,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.short_description,
    image: product.images.map((i) => i.url),
    brand: { "@type": "Brand", name: settings.brand_name },
    ...(product.price_from != null
      ? {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: product.currency,
            lowPrice: product.price_from,
            highPrice: Math.max(...product.price_tiers.map((t) => t.price), product.price_from),
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="shell pb-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            ...(product.category
              ? [{ label: product.category.name, href: `/collections/${product.category.slug}` }]
              : []),
            { label: product.sku },
          ]}
        />
      </div>

      <div className="shell grid gap-12 pb-20 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16">
        <ProductGallery images={product.images} name={product.name} sku={product.sku} />

        <div>
          <p className="eyebrow text-signal">
            {product.category?.name ?? "Wholesale"} · {product.sku}
          </p>
          <h1 className="mt-5 text-[clamp(36px,4.2vw,58px)] leading-[0.98] font-bold tracking-[-0.05em] text-white">
            {product.name}
          </h1>
          <p className="text-muted-2 mt-6 max-w-[620px] text-[15px] leading-[1.65]">{product.short_description}</p>

          <div className="mt-8 rounded-md border border-white/10 bg-white/[0.03]">
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-white/10 px-5 py-4">
              <p className="eyebrow text-signal">Wholesale price breaks</p>
              <p className="text-muted text-[13px]">
                From{" "}
                <span className="text-[20px] font-bold text-white">
                  {formatPrice(product.price_from, product.currency)}
                </span>{" "}
                / piece
              </p>
            </div>
            {product.price_tiers.length ? (
              <table className="w-full text-left text-[14px]">
                <thead>
                  <tr className="text-muted text-[10px] tracking-[0.12em] uppercase">
                    <th className="px-5 pt-4 pb-2 font-extrabold">Quantity</th>
                    <th className="px-5 pt-4 pb-2 text-right font-extrabold">Unit price</th>
                  </tr>
                </thead>
                <tbody>
                  {product.price_tiers.map((tier) => (
                    <tr key={tier.min_qty} className="border-t border-white/10">
                      <td className="px-5 py-3 text-white">
                        {tier.max_qty
                          ? `${tier.min_qty.toLocaleString()} – ${tier.max_qty.toLocaleString()}`
                          : `${tier.min_qty.toLocaleString()}+`}{" "}
                        pcs
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-white">
                        {formatPrice(tier.price, product.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-muted px-5 py-4 text-[14px]">
                Pricing is quoted per order. Add this style to your enquiry list.
              </p>
            )}
            <p className="text-muted border-t border-white/10 px-5 py-3 text-[11px]">
              Prices exclude decoration, custom packaging and freight. Final pricing is confirmed in your written
              quotation.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="border-signal border-l-2 bg-white/[0.04] p-4">
              <p className="eyebrow text-signal">Branding options</p>
              <p className="text-muted-2 mt-2 text-[13px] leading-[1.55]">
                {product.customization.join(" · ") || "On request"}
              </p>
            </div>
            <div className="border-signal border-l-2 bg-white/[0.04] p-4">
              <p className="eyebrow text-signal">What happens after you enquire</p>
              <p className="text-muted-2 mt-2 text-[13px] leading-[1.55]">
                Send your quantity and changes. We confirm the specification and prepare the quotation or sample plan.
              </p>
            </div>
          </div>

          <dl data-reveal="stagger" className="mt-8 border-t border-white/10">
            {rows.map(([label, value]) => (
              <div key={label} className="grid gap-1 border-b border-white/10 py-4 sm:grid-cols-[170px_1fr] sm:gap-6">
                <dt className="text-muted text-[10px] font-extrabold tracking-[0.12em] uppercase">{label}</dt>
                <dd className="text-[14px] leading-[1.55] text-white">{value}</dd>
              </div>
            ))}
          </dl>

          {product.tags.length ? (
            <ul className="mt-6 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={`/search?q=${encodeURIComponent(tag)}`}
                    className="hover:border-signal inline-block border border-white/15 px-3 py-2 text-[10px] font-extrabold tracking-[0.1em] text-white uppercase"
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/quote?add=${product.slug}`} className="btn btn-signal">
              Get a quotation <ArrowRight className="size-4" />
            </Link>
            <AddToEnquiry item={enquiryItem} variant="button" />
            {settings.whatsapp ? (
              <a
                href={whatsappHref(
                  settings.whatsapp,
                  `Hello, I'd like a wholesale quote for ${product.name} (${product.sku}).`,
                )}
                target="_blank"
                rel="noreferrer"
                className="btn gap-3 bg-[#25d366] text-white hover:bg-[#1fb857]"
              >
                <WhatsAppIcon className="size-4" /> WhatsApp about this style
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <section className="shell pb-20">
        <div data-reveal="stagger" className="grid border border-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {ASSURANCES.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex gap-3.5 border-white/10 p-5 max-lg:border-b lg:[&:not(:first-child)]:border-l sm:[&:nth-child(even)]:border-l"
            >
              <Icon className="text-signal size-5 shrink-0" strokeWidth={1.6} />
              <div>
                <p className="text-[13px] font-bold text-white">{title}</p>
                <p className="text-muted mt-1 text-[12px]">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {product.description ? (
        <section className="bg-paper py-20 md:py-24">
          <div className="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="eyebrow text-paper-eyebrow mb-5">Style details</p>
              <h2 className="display display-md text-paper-ink">About the {product.name}</h2>
            </div>
            <Markdown>{product.description}</Markdown>
          </div>
        </section>
      ) : null}

      {related.length ? (
        <section className="bg-ink-2 py-20 md:py-24">
          <div className="shell">
            <div className="mb-10 flex items-end justify-between gap-6">
              <h2 className="display display-md text-white">You may also like</h2>
              <Link href="/products" className="text-link hover:text-signal text-white">
                All products <ArrowRight className="size-4" />
              </Link>
            </div>
            <div data-reveal="stagger" className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

function DetailSkeleton() {
  return (
    <div className="shell grid gap-12 pb-20 lg:grid-cols-2">
      <div className="aspect-square animate-pulse rounded-[22px] bg-white/10" />
      <div className="space-y-4">
        <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
        <div className="h-14 w-3/4 animate-pulse rounded bg-white/10" />
        <div className="h-40 animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}

export default function ProductPage({ params }: PageProps<"/products/[slug]">) {
  return (
    <div className="bg-ink-2 pt-[110px] xl:pt-[130px]">
      <Suspense fallback={<DetailSkeleton />}>
        <ProductDetail params={params} />
      </Suspense>
    </div>
  );
}

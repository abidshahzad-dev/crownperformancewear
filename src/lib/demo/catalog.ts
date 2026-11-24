import { SITE_IMAGES as S, type SiteImageSlot } from "@/lib/cms/site-images.generated";
import type { Category, Faq, Page, Post, PriceTier, Product, Service, Spec } from "@/lib/types";

/**
 * Dummy catalogue and content for Crown Performance Wear.
 *
 * It seeds Supabase (`npm run seed:generate` writes `supabase/seed.sql`) and powers the site in demo
 * mode when Supabase is not configured yet. Delete or replace any of it from the admin dashboard.
 */

const STAMP = "2026-11-23T00:00:00.000Z";

/** Deterministic UUIDs so the seed is stable and re-runnable. */
function uuid(group: number, n: number): string {
  const g = group.toString(16).padStart(4, "0");
  const s = n.toString(16).padStart(12, "0");
  return `00000000-${g}-4000-8000-${s}`;
}

const timestamps = { created_at: STAMP, updated_at: STAMP, deleted_at: null };

type CategorySeed = Pick<Category, "name" | "slug" | "tagline" | "description" | "image_url">;

const CATEGORY_SEEDS: CategorySeed[] = [
  {
    name: "Performance tops",
    slug: "performance-tops",
    tagline: "Technical tees · long sleeves",
    description: "Moisture-wicking training tees and long sleeves in light, quick-dry knits.",
    image_url: S["cat-tops"],
  },
  {
    name: "Performance polos",
    slug: "performance-polos",
    tagline: "Short sleeve · long sleeve",
    description: "Clean, breathable polos for clubs, coaches, golf and corporate teams.",
    image_url: S["cat-polos"],
  },
  {
    name: "Shorts & joggers",
    slug: "shorts-and-joggers",
    tagline: "Training shorts · joggers · pants",
    description: "Lightweight shorts, tapered joggers and travel pants built for movement.",
    image_url: S["cat-shorts"],
  },
  {
    name: "Hoodies & fleece",
    slug: "hoodies-and-fleece",
    tagline: "Heavyweight fleece · zip layers",
    description: "Pullover hoodies, zip hoodies and crewnecks in brushed and heavyweight fleece.",
    image_url: S["cat-hoodies"],
  },
  {
    name: "Leggings & sports bras",
    slug: "leggings-and-sports-bras",
    tagline: "Leggings · bras · tanks",
    description: "Squat-proof leggings, supportive sports bras and fitted tanks for studios and gyms.",
    image_url: S["cat-leggings"],
  },
  {
    name: "Team kits & tracksuits",
    slug: "team-kits-and-tracksuits",
    tagline: "Jerseys · tracksuits · matching sets",
    description: "Sublimated jerseys, tracksuits and matching sets for clubs, schools and events.",
    image_url: S["cat-teamkits"],
  },
];

export const DEMO_CATEGORIES: Category[] = CATEGORY_SEEDS.map((c, i) => ({
  id: uuid(1, i + 1),
  parent_id: null,
  sort_order: i + 1,
  is_active: true,
  is_featured: true,
  seo_title: null,
  seo_description: null,
  ...c,
  ...timestamps,
}));

const categoryId = (slug: string) => DEMO_CATEGORIES.find((c) => c.slug === slug)?.id ?? null;

const tiers = (base: number): PriceTier[] => [
  { min_qty: 50, max_qty: 199, price: base },
  { min_qty: 200, max_qty: 499, price: Math.round(base * 0.88 * 100) / 100 },
  { min_qty: 500, max_qty: 999, price: Math.round(base * 0.8 * 100) / 100 },
  { min_qty: 1000, max_qty: null, price: Math.round(base * 0.72 * 100) / 100 },
];

type ProductSeed = {
  sku: string;
  name: string;
  category: string;
  short: string;
  fabric: string;
  gsm: string;
  fit: string;
  sizes: string[];
  colors: string[];
  price: number;
  images: SiteImageSlot[];
  featured?: boolean;
  isNew?: boolean;
  tags?: string[];
};

const ADULT = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
const WOMEN = ["XS", "S", "M", "L", "XL"];

const PRODUCT_SEEDS: ProductSeed[] = [
  {
    sku: "CPW-T101",
    name: "Core Dri-Tech Training Tee",
    category: "performance-tops",
    short: "Lightweight quick-dry training tee with a clean crew neck and flatlock seams.",
    fabric: "100% Polyester interlock",
    gsm: "150 GSM",
    fit: "Athletic fit",
    sizes: ADULT,
    colors: ["Black", "White", "Navy", "Charcoal", "Royal"],
    price: 6.4,
    images: ["p-t101-1", "p-t101-2"],
    featured: true,
    tags: ["tee", "training", "quick dry"],
  },
  {
    sku: "CPW-T204",
    name: "Seamless Long Sleeve Base Layer",
    category: "performance-tops",
    short: "Second-skin long sleeve with thumbholes for cold-weather training.",
    fabric: "92% Nylon, 8% Spandex",
    gsm: "180 GSM",
    fit: "Compression fit",
    sizes: ADULT,
    colors: ["Black", "Graphite", "Olive"],
    price: 9.2,
    images: ["p-t204-1", "p-t204-2"],
    isNew: true,
    tags: ["long sleeve", "base layer", "compression"],
  },
  {
    sku: "CPW-T310",
    name: "Heavyweight Cotton Blend Gym Tee",
    category: "performance-tops",
    short: "Boxy heavyweight tee for gym merch and lifestyle drops.",
    fabric: "60% Cotton, 40% Polyester",
    gsm: "220 GSM",
    fit: "Oversized fit",
    sizes: ADULT,
    colors: ["Black", "Sand", "Sage", "Washed grey"],
    price: 7.1,
    images: ["p-t310-1", "p-t310-2"],
    tags: ["tee", "oversized", "merch"],
  },
  {
    sku: "CPW-P110",
    name: "Pro Pique Performance Polo",
    category: "performance-polos",
    short: "Breathable pique polo with a three-button placket for clubs and coaches.",
    fabric: "100% Polyester pique",
    gsm: "170 GSM",
    fit: "Regular fit",
    sizes: ADULT,
    colors: ["White", "Black", "Navy", "Forest", "Red"],
    price: 8.6,
    images: ["p-p110-1", "p-p110-2"],
    featured: true,
    tags: ["polo", "club", "golf"],
  },
  {
    sku: "CPW-P220",
    name: "Coach Quarter-Zip Polo",
    category: "performance-polos",
    short: "Long sleeve quarter-zip polo for sideline staff and cooler days.",
    fabric: "88% Polyester, 12% Spandex",
    gsm: "200 GSM",
    fit: "Regular fit",
    sizes: ADULT,
    colors: ["Navy", "Black", "Steel"],
    price: 11.9,
    images: ["p-p220-1", "p-p220-2"],
    tags: ["polo", "quarter zip", "coach"],
  },
  {
    sku: "CPW-P305",
    name: "Corporate Stretch Polo",
    category: "performance-polos",
    short: "Smart stretch polo with a knitted collar, ready for embroidery.",
    fabric: "95% Polyester, 5% Spandex",
    gsm: "185 GSM",
    fit: "Tailored fit",
    sizes: ADULT,
    colors: ["White", "Black", "Sky", "Bottle green"],
    price: 9.4,
    images: ["p-p305-1", "p-p305-2"],
    tags: ["polo", "corporate", "uniform"],
  },
  {
    sku: "CPW-S120",
    name: 'Flex 7" Training Short',
    category: "shorts-and-joggers",
    short: "Four-way stretch training short with a zip pocket and liner option.",
    fabric: "90% Polyester, 10% Spandex",
    gsm: "140 GSM",
    fit: "Regular fit",
    sizes: ADULT,
    colors: ["Black", "Navy", "Olive", "Grey"],
    price: 7.8,
    images: ["p-s120-1", "p-s120-2"],
    featured: true,
    tags: ["shorts", "training", "stretch"],
  },
  {
    sku: "CPW-J240",
    name: "Tapered Tech Jogger",
    category: "shorts-and-joggers",
    short: "Tapered jogger in a smooth tech knit with zip ankles and pockets.",
    fabric: "85% Polyester, 15% Spandex",
    gsm: "260 GSM",
    fit: "Tapered fit",
    sizes: ADULT,
    colors: ["Black", "Charcoal", "Navy"],
    price: 12.6,
    images: ["p-j240-1", "p-j240-2"],
    tags: ["joggers", "pants", "tech fleece"],
  },
  {
    sku: "CPW-J330",
    name: "Fleece Sweatpant",
    category: "shorts-and-joggers",
    short: "Brushed-back fleece sweatpant with a cuffed hem, matching our hoodies.",
    fabric: "60% Cotton, 40% Polyester fleece",
    gsm: "320 GSM",
    fit: "Relaxed fit",
    sizes: ADULT,
    colors: ["Heather grey", "Black", "Navy", "Sand"],
    price: 11.2,
    images: ["p-j330-1", "p-j330-2"],
    tags: ["sweatpants", "fleece", "set"],
  },
  {
    sku: "CPW-H320",
    name: "Heavyweight Pullover Hoodie",
    category: "hoodies-and-fleece",
    short: "Our best-selling 320 GSM brushed fleece hoodie with a double-layer hood.",
    fabric: "60% Cotton, 40% Polyester fleece",
    gsm: "320 GSM",
    fit: "Regular fit",
    sizes: ADULT,
    colors: ["Black", "Heather grey", "Navy", "Sand", "Forest", "Maroon"],
    price: 13.5,
    images: ["p-h320-1", "p-h320-2", "p-h320-3"],
    featured: true,
    tags: ["hoodie", "fleece", "merch"],
  },
  {
    sku: "CPW-H420",
    name: "Full-Zip Fleece Hoodie",
    category: "hoodies-and-fleece",
    short: "Full-zip hoodie with metal zip and kangaroo pockets for team layering.",
    fabric: "80% Cotton, 20% Polyester fleece",
    gsm: "380 GSM",
    fit: "Regular fit",
    sizes: ADULT,
    colors: ["Black", "Navy", "Charcoal"],
    price: 16.2,
    images: ["p-h420-1", "p-h420-2"],
    tags: ["zip hoodie", "fleece"],
  },
  {
    sku: "CPW-C300",
    name: "Classic Crewneck Sweatshirt",
    category: "hoodies-and-fleece",
    short: "Clean crewneck sweatshirt with rib trims, ideal for embroidery.",
    fabric: "60% Cotton, 40% Polyester fleece",
    gsm: "300 GSM",
    fit: "Regular fit",
    sizes: ADULT,
    colors: ["Heather grey", "Black", "Cream", "Navy"],
    price: 11.8,
    images: ["p-c300-1", "p-c300-2"],
    isNew: true,
    tags: ["crewneck", "sweatshirt"],
  },
  {
    sku: "CPW-L250",
    name: "Sculpt High-Rise Legging",
    category: "leggings-and-sports-bras",
    short: "Squat-proof high-rise legging with a no-front-seam waistband.",
    fabric: "75% Nylon, 25% Spandex",
    gsm: "250 GSM",
    fit: "Compression fit",
    sizes: WOMEN,
    colors: ["Black", "Mocha", "Navy", "Sage"],
    price: 10.9,
    images: ["p-l250-1", "p-l250-2"],
    featured: true,
    tags: ["leggings", "studio", "gym"],
  },
  {
    sku: "CPW-B180",
    name: "Medium Support Sports Bra",
    category: "leggings-and-sports-bras",
    short: "Racerback sports bra with removable pads and a soft brushed finish.",
    fabric: "75% Nylon, 25% Spandex",
    gsm: "230 GSM",
    fit: "Fitted",
    sizes: WOMEN,
    colors: ["Black", "Blush", "Sage", "White"],
    price: 7.6,
    images: ["p-b180-1", "p-b180-2"],
    tags: ["sports bra", "studio"],
  },
  {
    sku: "CPW-K140",
    name: "Studio Fitted Tank",
    category: "leggings-and-sports-bras",
    short: "Lightweight fitted tank with a scoop neck for studio and gym wear.",
    fabric: "88% Polyester, 12% Spandex",
    gsm: "160 GSM",
    fit: "Fitted",
    sizes: WOMEN,
    colors: ["Black", "White", "Lilac"],
    price: 5.9,
    images: ["p-k140-1", "p-k140-2"],
    tags: ["tank", "studio"],
  },
  {
    sku: "CPW-TK10",
    name: "Sublimated Team Jersey",
    category: "team-kits-and-tracksuits",
    short: "Fully sublimated jersey with your colours, crest, names and numbers.",
    fabric: "100% Polyester birdseye mesh",
    gsm: "140 GSM",
    fit: "Regular fit",
    sizes: ["YS", "YM", "YL", ...ADULT],
    colors: ["Custom sublimation"],
    price: 8.9,
    images: ["p-tk10-1", "p-tk10-2"],
    featured: true,
    tags: ["jersey", "team", "sublimation"],
  },
  {
    sku: "CPW-TS20",
    name: "Club Tracksuit Set",
    category: "team-kits-and-tracksuits",
    short: "Zip track jacket and tapered pant set for travel, warm-ups and presentations.",
    fabric: "100% Polyester tricot",
    gsm: "280 GSM",
    fit: "Regular fit",
    sizes: ["YS", "YM", "YL", ...ADULT],
    colors: ["Navy / White", "Black / Red", "Royal / White"],
    price: 21.5,
    images: ["p-ts20-1", "p-ts20-2"],
    tags: ["tracksuit", "team", "set"],
  },
  {
    sku: "CPW-MS30",
    name: "Hoodie & Jogger Matching Set",
    category: "team-kits-and-tracksuits",
    short: "Coordinated hoodie and jogger set for staff, squads and merch bundles.",
    fabric: "60% Cotton, 40% Polyester fleece",
    gsm: "320 GSM",
    fit: "Regular fit",
    sizes: ADULT,
    colors: ["Black", "Heather grey", "Navy"],
    price: 23.9,
    images: ["p-ms30-1", "p-ms30-2"],
    isNew: true,
    tags: ["matching set", "hoodie", "joggers"],
  },
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/["']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const specsFor = (p: ProductSeed): Spec[] => [
  { label: "Fabric", value: p.fabric },
  { label: "Fabric weight", value: p.gsm },
  { label: "Fit", value: p.fit },
  { label: "Branding", value: "Screen print, heat transfer, embroidery, woven labels" },
  { label: "Packaging", value: "Individual polybag, 50 pcs per carton (custom packaging available)" },
];

export const DEMO_PRODUCTS: Product[] = PRODUCT_SEEDS.map((p, i) => ({
  id: uuid(2, i + 1),
  category_id: categoryId(p.category),
  sku: p.sku,
  name: p.name,
  slug: slugify(`${p.sku}-${p.name}`),
  short_description: p.short,
  description: `${p.short}\n\n## Built for wholesale\n\nThe **${p.name}** is a core Crown style available in ready stock from **50 pieces**, with mixed sizes and colours per order. Add your logo by screen print, heat transfer or embroidery, or develop a private-label version with your own labels and packaging.\n\n## What to confirm before bulk\n\n- Final colour shades against a physical swatch\n- Logo size and placement on a sample\n- Size breakdown and packing per carton`,
  fabric: p.fabric,
  gsm: p.gsm,
  fit: p.fit,
  sizes: p.sizes,
  colors: p.colors,
  customization: ["Screen print", "Heat transfer", "Embroidery", "Woven labels", "Custom packaging"],
  tags: p.tags ?? [],
  moq: 50,
  price_from: Math.round(p.price * 0.72 * 100) / 100,
  currency: "USD",
  price_tiers: tiers(p.price),
  specs: specsFor(p),
  images: p.images.map((slot, n) => ({ url: S[slot], alt: `${p.name} view ${n + 1}` })),
  sample_time: "5–7 days",
  lead_time: "3–5 working days (ready stock) · 15–25 working days (custom)",
  is_featured: p.featured ?? false,
  is_new: p.isNew ?? false,
  is_active: true,
  sort_order: i + 1,
  seo_title: null,
  seo_description: null,
  ...timestamps,
}));

export const DEMO_SERVICES: Service[] = [
  {
    title: "Wholesale ready stock",
    slug: "wholesale-ready-stock",
    eyebrow: "From 50 pieces",
    excerpt: "Buy core performance styles in bulk with tiered pricing, mixed sizes and fast dispatch.",
    image_url: S["svc-ready"],
    features: ["Tiered bulk pricing", "Mixed sizes & colours", "Dispatch in 3–5 working days"],
  },
  {
    title: "Private label programmes",
    slug: "private-label-programmes",
    eyebrow: "Your brand, our base",
    excerpt: "Launch your own activewear line on proven Crown blocks with your labels, tags and packaging.",
    image_url: S["svc-private"],
    features: ["Custom neck labels & hang tags", "Branded polybags & cartons", "Exclusive colourways"],
  },
  {
    title: "Custom team apparel",
    slug: "custom-team-apparel",
    eyebrow: "Clubs · schools · events",
    excerpt: "Sublimated jerseys, tracksuits and matching sets with names, numbers and crests.",
    image_url: S["svc-team"],
    features: ["Full sublimation", "Names & numbers", "Youth to 3XL sizing"],
  },
  {
    title: "Logo decoration & embroidery",
    slug: "logo-decoration-and-embroidery",
    eyebrow: "Print · embroider · transfer",
    excerpt: "Screen print, heat transfer and embroidery matched to your fabric, logo and quantity.",
    image_url: S["svc-decoration"],
    features: ["Pantone colour matching", "Placement mock-ups", "Stretch-safe transfers"],
  },
].map((s, i) => ({
  id: uuid(3, i + 1),
  ...s,
  body: `## What's included\n\n${s.features.map((f) => `- ${f}`).join("\n")}\n\n## How it works\n\n1. Send your brief: product, quantity, target date and artwork.\n2. We confirm the route, price and sample plan in writing.\n3. Approve the sample, then we produce, inspect and ship your order.\n\nEdit this text from **Admin → Services**.`,
  sort_order: i + 1,
  is_active: true,
  seo_title: null,
  seo_description: null,
  ...timestamps,
}));

export const DEMO_POSTS: Post[] = [
  {
    title: "How to vet a wholesale activewear supplier: an 8-point checklist",
    slug: "how-to-vet-a-wholesale-activewear-supplier",
    tag: "Buyer checklist · Supplier evaluation",
    excerpt: "A practical checklist of the evidence that matters, from sample quality to written terms and shipping records.",
    cover_url: S["post-vet"],
  },
  {
    title: "Ready stock vs private label vs custom: choosing your route",
    slug: "ready-stock-vs-private-label-vs-custom",
    tag: "Comparison · Buying routes",
    excerpt: "Compare minimums, lead times, ownership and cost so you can pick the right starting point for your range.",
    cover_url: S["post-routes"],
  },
  {
    title: "Wholesale MOQ explained: why minimums change by fabric, colour and process",
    slug: "wholesale-moq-explained",
    tag: "Explainer · Order planning",
    excerpt: "Why the minimum order changes with every decision you make, and how to plan a first order that fits your budget.",
    cover_url: S["post-moq"],
  },
].map((p, i) => ({
  id: uuid(4, i + 1),
  ...p,
  body: `${p.excerpt}\n\n## Start with the brief\n\nBefore comparing suppliers, write down your product, quantity, target price and delivery date. A clear brief makes every quotation comparable.\n\n## What to ask for\n\n- A physical sample in your size range\n- Written price breaks and lead times\n- Inspection and packing details\n\n## Next steps\n\nReady to compare? [Request a wholesale quote](/quote) and our team will reply within one business day.\n\nEdit this article from **Admin → Insights**.`,
  author: "Crown Performance Wear",
  published_at: `2026-11-${String(10 + i * 4).padStart(2, "0")}T09:00:00.000Z`,
  is_published: true,
  seo_title: null,
  seo_description: null,
  ...timestamps,
}));

const FAQ_SEEDS: Array<Pick<Faq, "question" | "answer" | "group_name" | "show_on_home">> = [
  {
    group_name: "Ordering",
    question: "What is the minimum order quantity?",
    answer:
      "Ready-stock styles start at 50 pieces per style, with mixed sizes and colours allowed. Custom and private-label orders start at 150–300 pieces per style depending on fabric and process.",
    show_on_home: true,
  },
  {
    group_name: "Ordering",
    question: "Do you offer tiered wholesale pricing?",
    answer:
      "Yes. Every product shows its price breaks (for example 50–199, 200–499, 500–999 and 1,000+ pieces). Your final price is confirmed in a written quotation.",
    show_on_home: true,
  },
  {
    group_name: "Samples",
    question: "Can I order a sample before bulk?",
    answer:
      "Yes. Stock samples ship in 5–7 days. Custom samples with your logo or changes take 7–12 days. Sample fees are credited against your bulk order once it is confirmed.",
    show_on_home: true,
  },
  {
    group_name: "Branding",
    question: "Can you add my logo and labels?",
    answer:
      "Yes. We offer screen print, heat transfer, embroidery, woven or printed neck labels, hang tags and custom packaging.",
    show_on_home: true,
  },
  {
    group_name: "Shipping",
    question: "Do you ship internationally?",
    answer:
      "We ship worldwide by sea, air or express courier, and can quote door-to-door delivery including duties for many destinations.",
    show_on_home: true,
  },
  {
    group_name: "Payment",
    question: "What payment terms do you accept?",
    answer:
      "Typically a 30% deposit to start production and the balance before dispatch. Repeat customers can apply for account terms.",
    show_on_home: false,
  },
  {
    group_name: "Quality",
    question: "How do you control quality?",
    answer:
      "Bulk production is checked in-line and at final inspection against the approved sample. We share an inspection summary and photos before shipping.",
    show_on_home: false,
  },
  {
    group_name: "Ordering",
    question: "How long does production take?",
    answer:
      "Ready-stock orders dispatch in 3–5 working days after payment and artwork approval. Custom production takes 15–25 working days after sample approval.",
    show_on_home: false,
  },
];

export const DEMO_FAQS: Faq[] = FAQ_SEEDS.map((f, i) => ({
  id: uuid(5, i + 1),
  ...f,
  sort_order: i + 1,
  is_active: true,
  created_at: STAMP,
  updated_at: STAMP,
}));

export const DEMO_CUSTOM_PAGES: Page[] = [
  {
    slug: "wholesale-terms",
    title: "Wholesale terms",
    seo_description: "MOQ, size mix, samples, payment and delivery terms for Crown Performance Wear wholesale orders.",
    body: `Everything you need to plan a wholesale order with Crown Performance Wear. Final terms are confirmed in your written quotation.

## Minimum order & size mix

| Route | Minimum per style | Size mix |
| --- | --- | --- |
| Ready stock + logo | 50 pieces | Any mix of sizes and colours |
| Private label | 150 pieces | Up to 4 colours per style |
| Full custom | 300 pieces | Agreed per colourway |

## Samples & revisions

- Stock samples ship in **5–7 days**.
- Custom samples take **7–12 days** and include one round of revisions.
- Sample fees are credited against your confirmed bulk order.

## Pricing

Every product page shows tiered price breaks. Prices exclude decoration, custom packaging and freight unless stated in your quotation.

## Payment & delivery

- 30% deposit to start production, 70% before dispatch.
- Ready stock dispatches in 3–5 working days; custom production takes 15–25 working days after sample approval.
- We ship by sea, air or express courier. See [Shipping & returns](/shipping-returns).

Edit this page from **Admin → Pages**.`,
  },
  {
    slug: "shipping-returns",
    title: "Shipping & returns",
    seo_description: "Shipping methods, delivery times and returns policy for wholesale orders.",
    body: `## Shipping methods

- **Express courier:** 3–7 days door to door. Best for samples and urgent top-ups.
- **Air freight:** 7–12 days. Good balance of speed and cost for mid-size orders.
- **Sea freight:** 25–45 days. Most economical for large orders.

## Duties & taxes

Unless your quotation says otherwise, import duties and taxes are paid by the buyer.

## Returns & claims

Report any shortage or defect within **14 days** of delivery with photos and carton labels. We replace, repair or credit confirmed defects. Custom and decorated goods cannot be returned for change of mind.

Edit this page from **Admin → Pages**.`,
  },
  {
    slug: "privacy-policy",
    title: "Privacy policy",
    seo_description: "How Crown Performance Wear handles your personal data.",
    body: `This placeholder policy explains how we handle data you share through our enquiry forms. Replace it with your own legal text from **Admin → Pages**.

## What we collect

Your name, email, company, phone number and the details you include in an enquiry.

## How we use it

Only to reply to your enquiry, prepare quotations and manage your orders. We do not sell your data.

## Contact

Email us to access, correct or delete your data.`,
  },
].map((p, i) => ({
  id: uuid(6, i + 1),
  kind: "custom" as const,
  sections: {},
  seo_title: null,
  is_published: true,
  ...p,
  ...timestamps,
}));

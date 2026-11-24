import type { SiteSettings } from "@/lib/types";
import { SITE_IMAGES as S } from "./site-images.generated";

/**
 * Default content for every system page and the site settings.
 *
 * These values seed the database (see `scripts/generate-seed.ts`) and fill any section an admin has not
 * saved yet. Everything here is editable from the dashboard: Admin → Pages and Admin → Settings.
 */

export const DEFAULT_SETTINGS: SiteSettings = {
  brand_name: "Crown Performance Wear",
  brand_short: "Crown",
  logo_url: "",
  tagline: "Wholesale activewear & sportswear",
  description:
    "Wholesale performance wear, private label and custom team apparel for gyms, clubs, retailers and growing brands.",
  email: "sales@crownperformancewear.com",
  phone: "+1 (000) 000-0000",
  whatsapp: "10000000000",
  address: "Crown Performance Wear\nWholesale & Distribution Centre\nUpdate this address from Admin → Settings",
  hours: "Mon–Fri · 9:00–18:00",
  header_cta: { label: "Get a quote", href: "/quote" },
  nav: [
    { label: "Products", href: "/products" },
    { label: "Collections", href: "/collections" },
    { label: "Services", href: "/services" },
    { label: "Wholesale", href: "/wholesale-terms" },
    { label: "About", href: "/about" },
    { label: "Insights", href: "/insights" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ],
  footer_columns: [
    {
      title: "Explore",
      links: [
        { label: "Products", href: "/products" },
        { label: "Collections", href: "/collections" },
        { label: "Services", href: "/services" },
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Buyers",
      links: [
        { label: "Wholesale terms", href: "/wholesale-terms" },
        { label: "Request a quote", href: "/quote" },
        { label: "Shipping & returns", href: "/shipping-returns" },
        { label: "Insights", href: "/insights" },
        { label: "FAQ", href: "/faq" },
      ],
    },
  ],
  socials: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Facebook", href: "https://facebook.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
    { label: "YouTube", href: "https://youtube.com" },
  ],
  legal_links: [{ label: "Privacy policy", href: "/privacy-policy" }],
  copyright: "© {year} Crown Performance Wear. All rights reserved.",
  inquiry_categories: [
    "Performance tops",
    "Polos",
    "Shorts & joggers",
    "Hoodies & fleece",
    "Leggings & sports bras",
    "Team kits & tracksuits",
    "Other / mixed order",
  ],
  popular_searches: ["Hoodie", "Polo", "Joggers", "Team kit", "Leggings", "Quarter zip"],
  seo_title: "Crown Performance Wear | Wholesale Activewear & Sportswear",
  seo_description:
    "Wholesale performance wear for teams, gyms and retailers. Tiered bulk pricing from 50 pieces, private label and custom branding.",
  announcement: "",
};

const IMG = {
  hero: S["home-hero"],
  statement: S["home-statement"],
  process: S["home-process"],
  catalogue: S["home-catalogue"],
  inquiry: S["home-inquiry"],
  productsHero: S["products-hero"],
  servicesHero: S["services-hero"],
  aboutHero: S["about-hero"],
  aboutCta: S["about-cta"],
  contactHero: S["contact-hero"],
  faqHero: S["faq-hero"],
  insightsHero: S["insights-hero"],
};

const GALLERY = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => S[`gallery-${n}` as keyof typeof S]);

export const PAGE_DEFAULTS: Record<string, Record<string, Record<string, unknown>>> = {
  home: {
    hero: {
      eyebrow: "Wholesale · Private label · Custom branding",
      title: "Wholesale Activewear &\nPerformance\nSportswear",
      text: "Crown Performance Wear supplies training tops, polos, fleece and team kits in bulk for gyms, clubs, retailers and growing brands. Order from 50 pieces per style with tiered pricing, mixed sizes and your logo.",
      image: IMG.hero,
      primary: { label: "Get a quote", href: "/quote" },
      secondary: { label: "Review wholesale terms", href: "/wholesale-terms" },
    },
    proof: {
      items: [
        { icon: "package", title: "MOQ 50+", text: "Per style · mixed sizes & logo" },
        { icon: "timer", title: "Samples: 5–7 days", text: "Approve before you buy bulk" },
        { icon: "shirt", title: "Private label · Custom", text: "Print, embroidery & custom tags" },
        { icon: "globe", title: "Sea · Air · Express", text: "Door-to-door shipping available" },
      ],
      note: "Wholesale prices and terms are confirmed in writing for every order.",
      noteLink: { label: "Review the terms", href: "/wholesale-terms" },
    },
    collections: {
      eyebrow: "The product collections",
      title: "Made for\nyour next\ncollection.",
      text: "Browse connected product families, from everyday training tops to team kits and heavyweight fleece. Start with a core style, then make it yours.",
      link: { label: "Browse all products", href: "/products" },
    },
    statement: {
      eyebrow: "Fabric · Fit · Finish",
      title: "Built to\nperform.",
      text: "Every fabric, seam and print is chosen for repeat wear and repeat orders, then checked again before it ships.",
      image: IMG.statement,
    },
    gallery: {
      eyebrow: "Inside our operation",
      title: "Real stock.\nReal production.",
      text: "",
      cta: { label: "Explore our services", href: "/services" },
      images: GALLERY.map((url, i) => ({ url, alt: `Crown production floor ${i + 1}` })),
      body: "Step inside the operation behind your next wholesale order: the cutting tables, sewing lines, decoration machines and packing benches that turn an approved sample into bulk stock.",
      bullets: ["Fabric preparation & cutting", "Sewing & decoration", "Quality checks & packing"],
      note: "Photos show our partner production floor. Order-specific records are shared on request.",
    },
    trust: {
      title: "Buy with confidence. Define your order.",
      text: "Crown Performance Wear works with brands, clubs and retailers worldwide. Every order is confirmed in writing, from the approved sample to the packing list.",
      cards: [
        { title: "Transparent pricing", text: "See tiered wholesale price breaks on every product before you ask for a quote." },
        { title: "Approved samples", text: "Fit, fabric, colour and branding are signed off on a physical sample first." },
        { title: "Written order terms", text: "Quantities, lead times, inspection and shipping are agreed before payment." },
      ],
    },
    essentials: {
      eyebrow: "Wholesale order essentials",
      title: "Clear numbers.\nSmarter buying.",
      text: "Key details wholesale buyers ask about, confirmed for our standard programme.",
      stats: [
        { label: "Ready-stock MOQ", value: "50+", unit: "pieces", text: "Mix sizes and colours", href: "/wholesale-terms" },
        { label: "Custom-order MOQ", value: "300+", unit: "pieces", text: "Per style and colourway", href: "/wholesale-terms" },
        { label: "Samples", value: "5–7", unit: "days", text: "Stock or custom samples", href: "/wholesale-terms" },
        { label: "Ready-stock dispatch", value: "3–5", unit: "working days", text: "After payment and artwork approval", href: "/wholesale-terms" },
        { label: "Custom production", value: "15–25", unit: "working days", text: "After sample approval", href: "/wholesale-terms" },
        { label: "Shipping options", value: "Sea · Air", unit: "+ express courier", text: "Choose the route for your destination", href: "/shipping-returns" },
      ],
      note: "Production periods are working days; sample periods are calendar days. Freight and project-specific costs are quoted separately.",
    },
    process: {
      eyebrow: "Built for repeat orders",
      title: "Approved once.\nRepeated at scale.",
      text: "The approved sample becomes the reference for fit, fabric, construction and decoration throughout bulk production and every reorder.",
      image: IMG.process,
      tags: ["Fit", "Fabric", "Construction", "Decoration"],
    },
    stages: {
      eyebrow: "Our wholesale system",
      title: "From your brief to bulk delivery.",
      stages: [
        {
          title: "Define the product",
          image: S["stage-define"],
          caption: "Fabric library at our partner mill",
          steps: [
            {
              title: "Product brief",
              text: "Share your product type, intended use, target quantity and reference files.",
              note: "Prepare: reference images, a tech pack if available and your target market.",
            },
            {
              title: "Fabric & trims",
              text: "Review fabric composition, weight, stretch, colour and trim options against the brief.",
              note: "Confirm: the material direction and any testing requirements.",
            },
          ],
        },
        {
          title: "Review before production",
          image: S["stage-review"],
          caption: "Sample room",
          steps: [
            {
              title: "Sample development",
              text: "Review fit, measurements, construction and branding through the agreed sample process.",
              note: "Approve: size set, logo placement and colour standards.",
            },
            {
              title: "Order confirmation",
              text: "Lock quantities, size breakdown, packaging and delivery dates in a written order.",
              note: "Confirm: deposit, inspection points and shipping terms.",
            },
          ],
        },
        {
          title: "Produce & deliver",
          image: S["stage-deliver"],
          caption: "Packed cartons ready for dispatch",
          steps: [
            {
              title: "Bulk production",
              text: "Cutting, sewing and decoration follow the approved sample, with in-line quality checks.",
              note: "Receive: progress photos at agreed milestones.",
            },
            {
              title: "QC & shipping",
              text: "Final inspection, folding, polybagging and carton labelling, then dispatch by your chosen route.",
              note: "Receive: packing list, inspection summary and tracking.",
            },
          ],
        },
      ],
    },
    services: {
      eyebrow: "Wholesale services",
      title: "Four routes.\nOne quality standard.",
      text: "Choose the route that matches your product brief and programme.",
      link: { label: "Explore all services", href: "/services" },
    },
    firstOrder: {
      eyebrow: "Before the first order",
      title: "Know what\nyou are\napproving.",
      text: "Compare buying routes, then confirm the terms specific to your product. Published guides are not a quotation.",
      items: [
        { title: "MOQ & size mix", text: "Understand minimums, size mix and how to plan your first order.", href: "/wholesale-terms" },
        { title: "Samples & revisions", text: "Review the sampling scope, revision plan and approval timing.", href: "/wholesale-terms" },
        { title: "Payment & delivery", text: "Confirm payment milestones, shipping scope and delivery responsibilities.", href: "/shipping-returns" },
      ],
      link: { label: "Explore all wholesale FAQs", href: "/faq" },
    },
    resources: {
      eyebrow: "Buyer resources",
      title: "Arrive with a\nclearer brief.",
      text: "Use the same decisions our team needs to assess your order. These guides organise your requirements without inventing a price or stock promise.",
      items: [
        { title: "Size & fit guide", text: "Compare body measurements and fits across our core blocks before you choose a size mix.", href: "/insights" },
        { title: "Fabric & GSM guide", text: "Match fabric weight, stretch and finish to the way your customers will wear the product.", href: "/insights" },
        { title: "Decoration guide", text: "Compare screen print, heat transfer and embroidery for your logo, fabric and quantity.", href: "/insights" },
      ],
      link: { label: "View all buyer guides", href: "/insights" },
    },
    catalogue: {
      eyebrow: "A gift for your next project",
      title: "Get your free catalogue.",
      text: "Send us a message to request our complimentary digital wholesale catalogue and price list, and tell us which products interest you.",
      image: IMG.catalogue,
      cta: { label: "Request the catalogue", href: "#inquiry" },
    },
    faq: {
      eyebrow: "Buyer FAQ",
      title: "Short\nanswers\nbefore the\nquote.",
      text: "Programme-specific answers are confirmed in your written quotation.",
      link: { label: "View all FAQs", href: "/faq" },
    },
    insights: {
      eyebrow: "Selected buyer guides",
      title: "Insights for\nsmarter\nwholesale\nbuying.",
      text: "Supplier checks, buying routes and order minimums: practical reads before you source.",
      link: { label: "View all insights", href: "/insights" },
    },
    inquiry: {
      eyebrow: "Let's build together",
      title: "Request your\nCrown\ncatalogue.",
      text: "Share your email to request the wholesale catalogue and price list. Our team reviews every request and replies personally.",
      image: IMG.inquiry,
      button: "Request a catalogue",
    },
  },
  products: {
    hero: {
      eyebrow: "Wholesale · Private label · Custom",
      title: "Wholesale Activewear &\nSportswear Catalogue",
      text: "Search our wholesale styles across performance tops, polos, shorts, fleece, leggings and team kits. Filter by category or search by SKU, style or fabric, then add styles to your enquiry list.",
      image: IMG.productsHero,
    },
    stats: {
      items: [
        { label: "Product categories", value: "6" },
        { label: "Ready-stock MOQ", value: "50+ pieces" },
        { label: "Custom-order MOQ", value: "300+ pieces" },
      ],
    },
    routes: {
      title: "Choose a ready style or\ndevelop your own.",
      items: [
        {
          title: "Ready style with your branding",
          text: "Start with a catalogue style and add your logo, labels and packaging. Tiered wholesale pricing applies from 50 pieces.",
          link: { label: "MOQ & size mix", href: "/wholesale-terms" },
        },
        {
          title: "Custom product development",
          text: "Share the fit, fabric and construction changes you need. We agree development scope and exclusivity in writing before work begins.",
          link: { label: "Explore our services", href: "/services" },
        },
      ],
    },
    grid: {
      eyebrow: "Search by SKU, style or fabric",
      title: "Build your wholesale\nshortlist.",
      text: "Every card shows the style code and starting wholesale price. Exact stock, shade and terms are reconfirmed in your quotation.",
    },
  },
  collections: {
    hero: {
      eyebrow: "The product collections",
      title: "Shop by\ncollection.",
      text: "Connected product families built on shared fits and fabrics, so your range looks consistent from tee to tracksuit.",
      image: S["collections-hero"],
    },
  },
  services: {
    hero: {
      eyebrow: "Wholesale · Private label · Team apparel",
      title: "Wholesale, Private Label &\nCustom Team Apparel",
      text: "From ready-stock bulk orders to fully custom programmes, Crown Performance Wear manages sourcing, decoration and delivery so you can focus on selling.",
      image: IMG.servicesHero,
      primary: { label: "Request a quote", href: "/quote" },
      secondary: { label: "See the catalogue", href: "/products" },
    },
    intro: {
      eyebrow: "Our services",
      title: "Start where your\nproduct is today.",
      text: "Pick the route that fits your timeline, quantity and level of customisation. Every route follows the same sampling and quality standard.",
    },
    comparison: {
      eyebrow: "Compare routes",
      title: "Ready stock, private label and custom are related, not interchangeable.",
      text: "Use this table to choose the right starting point. Final terms are confirmed in your quotation.",
      columns: ["Ready stock + logo", "Private label", "Full custom"],
      rows: [
        { label: "Starting MOQ", values: ["50 pieces / style", "150 pieces / style", "300 pieces / style"] },
        { label: "Who owns the design", values: ["Crown catalogue style", "Crown base, your label", "Your design"] },
        { label: "Branding", values: ["Print or embroidery", "Labels, tags, packaging", "Everything custom"] },
        { label: "Sampling", values: ["Optional", "Recommended", "Required"] },
        { label: "Typical lead time", values: ["3–5 working days", "12–18 working days", "15–25 working days"] },
      ],
    },
    cta: {
      eyebrow: "Next step",
      title: "Bring the brief.\nWe'll map the route.",
      text: "Send your product type, quantity and target date. We reply with the best route and a written quotation.",
      button: { label: "Start a quote", href: "/quote" },
    },
  },
  about: {
    hero: {
      eyebrow: "About Crown · Wholesale performance wear",
      title: "About Crown\nPerformance Wear",
      text: "A wholesale partner for gyms, clubs, retailers and brands. Professional in the details. Strict on quality. Efficient in delivery. Warm in service.",
      image: IMG.aboutHero,
    },
    intro: {
      eyebrow: "Company at a glance",
      title: "The people and business\nbehind Crown.",
      text: "Crown Performance Wear was founded to make bulk activewear simple: transparent pricing, reliable samples and production that matches what you approved. Replace this text with your own story from Admin → Pages → About.",
      stats: [
        { value: "50+", label: "Piece MOQ on ready styles" },
        { value: "6", label: "Core product families" },
        { value: "30+", label: "Countries shipped to" },
        { value: "5–7", label: "Day sample turnaround" },
      ],
    },
    pillars: {
      eyebrow: "What we stand on",
      title: "Rooted in production.\nFocused on your next collection.",
      text: "",
      items: [
        { title: "A verifiable business", text: "Clear company details, written quotations and order records for every buyer." },
        { title: "A connected product range", text: "Tops, polos, bottoms, fleece and team kits built on shared fits and fabrics." },
        { title: "A relationship built around the brief", text: "One account manager follows your order from first sample to final carton." },
      ],
    },
    milestones: {
      eyebrow: "Our story",
      title: "Milestones in the making.",
      text: "",
      items: [
        { year: "2018", title: "Wholesale trading begins", text: "Supplying ready-stock activewear to local gyms and clubs." },
        { year: "2020", title: "Private label programme", text: "Launched custom labels and packaging for growing brands." },
        { year: "2023", title: "Team apparel division", text: "Added sublimated team kits and tracksuits for clubs and schools." },
        { year: "Today", title: "A full wholesale platform", text: "Online catalogue, tiered pricing and global shipping for buyers worldwide." },
      ],
    },
    values: {
      eyebrow: "How we work",
      title: "Make the details matter.",
      text: "",
      items: [
        { title: "Professional in the details", text: "Specs, measurements and artwork are confirmed in writing." },
        { title: "Strict on quality", text: "In-line and final inspections against the approved sample." },
        { title: "Efficient in delivery", text: "Clear lead times and proactive updates at every milestone." },
        { title: "Warm in service", text: "Real people who answer quickly and follow through." },
      ],
    },
    cta: {
      eyebrow: "Get closer to the work",
      title: "Your idea brings the direction.\nThe details make it real.",
      text: "Tell us what you want to sell and who it's for. We'll recommend styles, fabrics and decoration that fit your budget.",
      button: { label: "Talk to our team", href: "/contact" },
      image: IMG.aboutCta,
    },
  },
  contact: {
    hero: {
      eyebrow: "Start a project",
      title: "Contact Crown for a\nWholesale Quote",
      text: "Share your product category and project requirements. Our team will review the details and reply to your work email.",
      image: IMG.contactHero,
    },
    form: {
      eyebrow: "Project inquiry",
      title: "Three details to get started.",
      text: "Tell us the product, the quantity and the date you need it. Attachments can follow by email.",
    },
    aside: {
      title: "Before you send technical files",
      items: [
        { title: "Share only what we need", text: "A reference image and target quantity are enough for a first quote." },
        { title: "Confidentiality", text: "We can sign an NDA before you share tech packs or artwork." },
        { title: "Response time", text: "We reply to most enquiries within one business day." },
      ],
    },
    after: {
      title: "After you submit",
      steps: [
        "We review your product, quantity and timeline.",
        "We confirm the best route and any questions by email.",
        "You receive a written quotation and sample plan.",
      ],
    },
  },
  faq: {
    hero: {
      eyebrow: "Wholesale help centre",
      title: "Wholesale FAQ for\nB2B Buyers",
      text: "Buyer-first answers on MOQ, samples, pricing, custom branding, quality control and international shipping.",
      image: IMG.faqHero,
    },
  },
  insights: {
    hero: {
      eyebrow: "Buyer guides",
      title: "Insights for Smarter\nWholesale Buying",
      text: "Practical guides on sourcing, fabrics, decoration and order planning for activewear buyers.",
      image: IMG.insightsHero,
    },
  },
  quote: {
    hero: {
      eyebrow: "Your enquiry list",
      title: "Request a\nwholesale quote.",
      text: "Review the styles you've shortlisted, set target quantities and send them to our team in one request.",
    },
    empty: {
      eyebrow: "Nothing here yet",
      title: "Your enquiry list is empty.",
      text: "Browse the catalogue and use “Add to enquiry” on any style. You can also send a general request below.",
      link: { label: "Browse products", href: "/products" },
    },
  },
};

/** Merge saved sections over the defaults, section by section. */
export function withPageDefaults(slug: string, saved: Record<string, unknown> | null | undefined) {
  const defaults = PAGE_DEFAULTS[slug] ?? {};
  const merged: Record<string, Record<string, unknown>> = {};
  for (const key of Object.keys(defaults)) {
    const savedSection = saved?.[key];
    merged[key] =
      savedSection && typeof savedSection === "object"
        ? { ...defaults[key], ...(savedSection as Record<string, unknown>) }
        : defaults[key];
  }
  return merged;
}

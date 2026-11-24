/**
 * Content schemas for the CMS.
 *
 * Every system page (home, about, ...) is a list of sections. Each section declares its fields here;
 * the admin page editor renders a form from these definitions and the public page reads the values.
 * Add a field here, render it on the page, and it becomes editable in the dashboard.
 */

export type FieldBase = { name: string; label: string; help?: string };

export type Field =
  | (FieldBase & { type: "text"; placeholder?: string })
  | (FieldBase & { type: "textarea"; rows?: number })
  | (FieldBase & { type: "markdown"; rows?: number })
  | (FieldBase & { type: "image" })
  | (FieldBase & { type: "link" })
  | (FieldBase & { type: "strings"; placeholder?: string })
  | (FieldBase & { type: "list"; itemLabel: string; fields: Field[] });

export type SectionSchema = { key: string; label: string; description?: string; fields: Field[] };

export type PageSchema = { slug: string; title: string; path: string; sections: SectionSchema[] };

const t = (name: string, label: string, help?: string): Field => ({ type: "text", name, label, help });
const ta = (name: string, label: string, rows = 3): Field => ({ type: "textarea", name, label, rows });
const img = (name: string, label: string): Field => ({ type: "image", name, label });
const link = (name: string, label: string): Field => ({ type: "link", name, label });
const list = (name: string, label: string, itemLabel: string, fields: Field[]): Field => ({
  type: "list",
  name,
  label,
  itemLabel,
  fields,
});
const strings = (name: string, label: string, help?: string): Field => ({ type: "strings", name, label, help });

const TITLE_HELP = "Use a new line to break the heading.";

const hero = (withImage = true, withCta = true): SectionSchema => ({
  key: "hero",
  label: "Hero",
  fields: [
    t("eyebrow", "Eyebrow"),
    { type: "textarea", name: "title", label: "Title", rows: 2, help: TITLE_HELP },
    ta("text", "Intro text"),
    ...(withImage ? [img("image", "Background image")] : []),
    ...(withCta ? [link("primary", "Primary button"), link("secondary", "Secondary button")] : []),
  ],
});

const heading = (key: string, label: string, extra: Field[] = []): SectionSchema => ({
  key,
  label,
  fields: [
    t("eyebrow", "Eyebrow"),
    { type: "textarea", name: "title", label: "Title", rows: 2, help: TITLE_HELP },
    ta("text", "Text"),
    ...extra,
  ],
});

export const PAGE_SCHEMAS: PageSchema[] = [
  {
    slug: "home",
    title: "Home",
    path: "/",
    sections: [
      hero(),
      {
        key: "proof",
        label: "Proof band",
        description: "Four key facts below the hero.",
        fields: [
          list("items", "Items", "Item", [
            t("icon", "Icon", "One of: package, timer, shirt, globe, shield, truck, tag, award"),
            t("title", "Title"),
            t("text", "Text"),
          ]),
          t("note", "Note"),
          link("noteLink", "Note link"),
        ],
      },
      heading("collections", "Collections", [link("link", "Link")]),
      heading("statement", "Statement banner", [img("image", "Background image")]),
      heading("gallery", "Photo mosaic", [
        link("cta", "Button"),
        list("images", "Images", "Image", [img("url", "Image"), t("alt", "Alt text")]),
        ta("body", "Text under the mosaic"),
        strings("bullets", "Numbered points"),
        t("note", "Small note"),
      ]),
      {
        key: "trust",
        label: "Trust cards",
        fields: [
          t("title", "Title"),
          ta("text", "Text"),
          list("cards", "Cards", "Card", [t("title", "Title"), ta("text", "Text", 2)]),
        ],
      },
      heading("essentials", "Order essentials", [
        list("stats", "Stats", "Stat", [
          t("label", "Label"),
          t("value", "Value"),
          t("unit", "Unit"),
          t("text", "Text"),
          t("href", "Link"),
        ]),
        t("note", "Footnote"),
      ]),
      heading("process", "Process intro", [img("image", "Image"), strings("tags", "Tags")]),
      {
        key: "stages",
        label: "Process stages",
        fields: [
          t("eyebrow", "Eyebrow"),
          { type: "textarea", name: "title", label: "Title", rows: 2, help: TITLE_HELP },
          list("stages", "Stages", "Stage", [
            t("title", "Stage title"),
            img("image", "Image"),
            t("caption", "Image caption"),
            list("steps", "Steps", "Step", [t("title", "Title"), ta("text", "Text", 2), t("note", "Note")]),
          ]),
        ],
      },
      heading("services", "Services", [link("link", "Link")]),
      heading("firstOrder", "Before the first order", [
        list("items", "Items", "Item", [t("title", "Title"), ta("text", "Text", 2), t("href", "Link")]),
        link("link", "Link"),
      ]),
      heading("resources", "Buyer resources", [
        list("items", "Items", "Item", [t("title", "Title"), ta("text", "Text", 2), t("href", "Link")]),
        link("link", "Link"),
      ]),
      heading("catalogue", "Catalogue banner", [img("image", "Image"), link("cta", "Button")]),
      heading("faq", "FAQ", [link("link", "Link")]),
      heading("insights", "Insights", [link("link", "Link")]),
      heading("inquiry", "Final inquiry", [img("image", "Background image"), t("button", "Button label")]),
    ],
  },
  {
    slug: "products",
    title: "Products",
    path: "/products",
    sections: [
      hero(true, false),
      {
        key: "stats",
        label: "Stats strip",
        fields: [list("items", "Stats", "Stat", [t("label", "Label"), t("value", "Value")])],
      },
      {
        key: "routes",
        label: "Buying routes",
        fields: [
          { type: "textarea", name: "title", label: "Title", rows: 2 },
          list("items", "Cards", "Card", [t("title", "Title"), ta("text", "Text", 2), link("link", "Link")]),
        ],
      },
      heading("grid", "Catalogue intro"),
    ],
  },
  { slug: "collections", title: "Collections", path: "/collections", sections: [hero(true, false)] },
  {
    slug: "services",
    title: "Services",
    path: "/services",
    sections: [
      hero(),
      heading("intro", "Intro"),
      heading("comparison", "Comparison table", [
        strings("columns", "Column headings"),
        list("rows", "Rows", "Row", [t("label", "Label"), strings("values", "Values (one per column)")]),
      ]),
      heading("cta", "Closing call to action", [link("button", "Button")]),
    ],
  },
  {
    slug: "about",
    title: "About",
    path: "/about",
    sections: [
      hero(true, false),
      heading("intro", "Company at a glance", [
        list("stats", "Stats", "Stat", [t("value", "Value"), t("label", "Label")]),
      ]),
      heading("pillars", "What we stand on", [
        list("items", "Items", "Item", [t("title", "Title"), ta("text", "Text", 2)]),
      ]),
      heading("milestones", "Milestones", [
        list("items", "Milestones", "Milestone", [t("year", "Year"), t("title", "Title"), ta("text", "Text", 2)]),
      ]),
      heading("values", "Values", [list("items", "Values", "Value", [t("title", "Title"), ta("text", "Text", 2)])]),
      heading("cta", "Closing call to action", [link("button", "Button"), img("image", "Image")]),
    ],
  },
  {
    slug: "contact",
    title: "Contact",
    path: "/contact",
    sections: [
      hero(true, false),
      heading("form", "Form intro"),
      {
        key: "aside",
        label: "Side notes",
        fields: [t("title", "Title"), list("items", "Notes", "Note", [t("title", "Title"), ta("text", "Text", 2)])],
      },
      { key: "after", label: "After you submit", fields: [t("title", "Title"), strings("steps", "Steps")] },
    ],
  },
  { slug: "faq", title: "FAQ", path: "/faq", sections: [hero(true, false)] },
  { slug: "insights", title: "Insights", path: "/insights", sections: [hero(true, false)] },
  {
    slug: "quote",
    title: "Quote request",
    path: "/quote",
    sections: [hero(false, false), heading("empty", "Empty enquiry list", [link("link", "Link")])],
  },
];

export function getPageSchema(slug: string): PageSchema | undefined {
  return PAGE_SCHEMAS.find((p) => p.slug === slug);
}

export const SETTINGS_SCHEMA: SectionSchema[] = [
  {
    key: "brand",
    label: "Brand",
    fields: [
      t("brand_name", "Brand name"),
      t("brand_short", "Short name (logo text)"),
      img("logo_url", "Logo image (optional, replaces the crown mark)"),
      t("tagline", "Tagline"),
      ta("description", "Footer description"),
      t("announcement", "Announcement bar (leave empty to hide)"),
    ],
  },
  {
    key: "contact",
    label: "Contact details",
    fields: [
      t("email", "Sales email"),
      t("phone", "Phone"),
      t("whatsapp", "WhatsApp number (digits only, with country code)"),
      ta("address", "Address", 2),
      t("hours", "Business hours"),
    ],
  },
  {
    key: "navigation",
    label: "Navigation",
    fields: [
      link("header_cta", "Header button"),
      list("nav", "Main menu", "Menu item", [t("label", "Label"), t("href", "Link")]),
      list("footer_columns", "Footer columns", "Column", [
        t("title", "Column title"),
        list("links", "Links", "Link", [t("label", "Label"), t("href", "Link")]),
      ]),
      list("legal_links", "Legal links", "Link", [t("label", "Label"), t("href", "Link")]),
      list("socials", "Social profiles", "Profile", [t("label", "Label"), t("href", "URL")]),
      t("copyright", "Copyright line"),
    ],
  },
  {
    key: "commerce",
    label: "Enquiries & search",
    fields: [
      strings("inquiry_categories", "Product categories offered in enquiry forms"),
      strings("popular_searches", "Popular searches shown in the search overlay"),
    ],
  },
  {
    key: "seo",
    label: "SEO defaults",
    fields: [t("seo_title", "Default title"), ta("seo_description", "Default description")],
  },
];

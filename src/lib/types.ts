export type ImageRef = { url: string; alt?: string };

export type PriceTier = { min_qty: number; max_qty?: number | null; price: number };

export type Spec = { label: string; value: string };

export type Category = {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type Product = {
  id: string;
  category_id: string | null;
  sku: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  fabric: string | null;
  gsm: string | null;
  fit: string | null;
  sizes: string[];
  colors: string[];
  customization: string[];
  tags: string[];
  moq: number;
  price_from: number | null;
  currency: string;
  price_tiers: PriceTier[];
  specs: Spec[];
  images: ImageRef[];
  sample_time: string | null;
  lead_time: string | null;
  is_featured: boolean;
  is_new: boolean;
  is_active: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ProductWithCategory = Product & {
  category: Pick<Category, "id" | "name" | "slug"> | null;
};

export type Service = {
  id: string;
  title: string;
  slug: string;
  eyebrow: string | null;
  excerpt: string | null;
  body: string | null;
  image_url: string | null;
  features: string[];
  sort_order: number;
  is_active: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  tag: string | null;
  excerpt: string | null;
  body: string | null;
  cover_url: string | null;
  author: string | null;
  published_at: string;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  group_name: string;
  sort_order: number;
  is_active: boolean;
  show_on_home: boolean;
  created_at: string;
  updated_at: string;
};

export type PageKind = "system" | "custom";

export type Page = {
  id: string;
  slug: string;
  title: string;
  kind: PageKind;
  sections: Record<string, unknown>;
  body: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type InquiryType = "quote" | "catalogue" | "contact" | "sample";

export const INQUIRY_STATUSES = ["new", "in_review", "quoted", "won", "lost", "closed"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export type InquiryItem = { product_id?: string; sku?: string; name: string; quantity?: number };

export type Inquiry = {
  id: string;
  type: InquiryType;
  name: string | null;
  email: string;
  company: string | null;
  phone: string | null;
  country: string | null;
  category: string | null;
  quantity: string | null;
  message: string | null;
  items: InquiryItem[];
  source_page: string | null;
  status: InquiryStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Media = {
  id: string;
  url: string;
  storage_key: string | null;
  filename: string | null;
  content_type: string | null;
  size_bytes: number | null;
  alt: string | null;
  created_at: string;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "user";
  created_at: string;
};

export type SearchTermStat = {
  term: string;
  searches: number;
  last_searched_at: string;
  avg_results: number;
  zero_result_searches: number;
};

export type NavLink = { label: string; href: string };

export type SocialLink = { label: string; href: string };

export type FooterColumn = { title: string; links: NavLink[] };

export type SiteSettings = {
  brand_name: string;
  brand_short: string;
  logo_url: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  hours: string;
  header_cta: NavLink;
  nav: NavLink[];
  footer_columns: FooterColumn[];
  socials: SocialLink[];
  legal_links: NavLink[];
  copyright: string;
  inquiry_categories: string[];
  popular_searches: string[];
  seo_title: string;
  seo_description: string;
  announcement: string;
};

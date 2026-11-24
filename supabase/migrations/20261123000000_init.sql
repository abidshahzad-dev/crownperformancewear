-- Crown Performance Wear: initial schema.
-- Run with `supabase db push`, or paste into the Supabase SQL editor.
-- Public visitors read published content through RLS; only admins write.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles and roles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- SECURITY DEFINER so RLS policies can call it without recursing into profiles' own policies.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Every new auth user gets a profile with the 'user' role. Admins are promoted explicitly.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, coalesce(new.email, ''), new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories (id) on delete set null,
  name text not null,
  slug text not null unique,
  tagline text,
  description text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  is_featured boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index categories_active_idx on public.categories (is_active, sort_order) where deleted_at is null;

create trigger categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories (id) on delete set null,
  sku text not null unique,
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  fabric text,
  gsm text,
  fit text,
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  customization text[] not null default '{}',
  tags text[] not null default '{}',
  moq integer not null default 50 check (moq >= 1),
  price_from numeric(10, 2),
  currency text not null default 'USD',
  -- [{ "min_qty": 50, "max_qty": 199, "price": 12.5 }]
  price_tiers jsonb not null default '[]'::jsonb,
  -- [{ "label": "Fabric weight", "value": "180 GSM" }]
  specs jsonb not null default '[]'::jsonb,
  -- [{ "url": "https://...", "alt": "Front view" }]
  images jsonb not null default '[]'::jsonb,
  sample_time text,
  lead_time text,
  is_featured boolean not null default false,
  is_new boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index products_category_idx on public.products (category_id) where deleted_at is null;
create index products_active_idx on public.products (is_active, sort_order) where deleted_at is null;
create index products_search_idx on public.products using gin (
  to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(sku, '') || ' ' || coalesce(short_description, '') || ' ' || coalesce(fabric, ''))
);

create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Content
-- ---------------------------------------------------------------------------

create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  eyebrow text,
  excerpt text,
  body text,
  image_url text,
  features text[] not null default '{}',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create trigger services_updated_at before update on public.services
  for each row execute function public.set_updated_at();

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  tag text,
  excerpt text,
  body text,
  cover_url text,
  author text,
  published_at timestamptz not null default now(),
  is_published boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create trigger posts_updated_at before update on public.posts
  for each row execute function public.set_updated_at();

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  group_name text not null default 'General',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  show_on_home boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger faqs_updated_at before update on public.faqs
  for each row execute function public.set_updated_at();

-- System pages (home, about, ...) keep their editable sections in `sections`.
-- Custom pages (kind = 'custom') render `body` as Markdown at /<slug>.
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  kind text not null default 'custom' check (kind in ('system', 'custom')),
  sections jsonb not null default '{}'::jsonb,
  body text,
  seo_title text,
  seo_description text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create trigger pages_updated_at before update on public.pages
  for each row execute function public.set_updated_at();

create table public.site_settings (
  id integer primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create trigger site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

create table public.media (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  storage_key text,
  filename text,
  content_type text,
  size_bytes bigint,
  alt text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Leads and analytics
-- ---------------------------------------------------------------------------

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'quote' check (type in ('quote', 'catalogue', 'contact', 'sample')),
  name text,
  email text not null check (char_length(email) <= 254),
  company text,
  phone text,
  country text,
  category text,
  quantity text,
  message text check (char_length(message) <= 5000),
  -- [{ "product_id": "...", "sku": "...", "name": "...", "quantity": 100 }]
  items jsonb not null default '[]'::jsonb,
  source_page text,
  status text not null default 'new' check (status in ('new', 'in_review', 'quoted', 'won', 'lost', 'closed')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index inquiries_status_idx on public.inquiries (status, created_at desc);

create trigger inquiries_updated_at before update on public.inquiries
  for each row execute function public.set_updated_at();

create table public.search_queries (
  id bigint generated always as identity primary key,
  term text not null check (char_length(term) between 1 and 120),
  results_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index search_queries_created_idx on public.search_queries (created_at desc);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.services enable row level security;
alter table public.posts enable row level security;
alter table public.faqs enable row level security;
alter table public.pages enable row level security;
alter table public.site_settings enable row level security;
alter table public.media enable row level security;
alter table public.inquiries enable row level security;
alter table public.search_queries enable row level security;

-- Profiles: users see their own row; admins see and manage everyone.
create policy "profiles: read own" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles: admin update" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());
create policy "profiles: admin delete" on public.profiles
  for delete using (public.is_admin());

-- Published content is public; admins see drafts and soft-deleted rows.
create policy "categories: public read" on public.categories
  for select using ((is_active and deleted_at is null) or public.is_admin());
create policy "categories: admin write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

create policy "products: public read" on public.products
  for select using ((is_active and deleted_at is null) or public.is_admin());
create policy "products: admin write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

create policy "services: public read" on public.services
  for select using ((is_active and deleted_at is null) or public.is_admin());
create policy "services: admin write" on public.services
  for all using (public.is_admin()) with check (public.is_admin());

create policy "posts: public read" on public.posts
  for select using ((is_published and deleted_at is null and published_at <= now()) or public.is_admin());
create policy "posts: admin write" on public.posts
  for all using (public.is_admin()) with check (public.is_admin());

create policy "faqs: public read" on public.faqs
  for select using (is_active or public.is_admin());
create policy "faqs: admin write" on public.faqs
  for all using (public.is_admin()) with check (public.is_admin());

create policy "pages: public read" on public.pages
  for select using ((is_published and deleted_at is null) or public.is_admin());
create policy "pages: admin write" on public.pages
  for all using (public.is_admin()) with check (public.is_admin());

create policy "settings: public read" on public.site_settings
  for select using (true);
create policy "settings: admin write" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

create policy "media: admin only" on public.media
  for all using (public.is_admin()) with check (public.is_admin());

-- Anyone may submit an inquiry, but only as a fresh 'new' lead without admin notes.
create policy "inquiries: public insert" on public.inquiries
  for insert with check (status = 'new' and admin_notes is null);
create policy "inquiries: admin read" on public.inquiries
  for select using (public.is_admin());
create policy "inquiries: admin update" on public.inquiries
  for update using (public.is_admin()) with check (public.is_admin());
create policy "inquiries: admin delete" on public.inquiries
  for delete using (public.is_admin());

create policy "search: public insert" on public.search_queries
  for insert with check (true);
create policy "search: admin read" on public.search_queries
  for select using (public.is_admin());
create policy "search: admin delete" on public.search_queries
  for delete using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Grants (explicit, so the API works even where public tables are not auto-exposed)
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;
grant select on public.categories, public.products, public.services, public.posts,
  public.faqs, public.pages, public.site_settings to anon, authenticated;
grant insert on public.inquiries, public.search_queries to anon, authenticated;
grant select, insert, update, delete on public.categories, public.products, public.services,
  public.posts, public.faqs, public.pages, public.site_settings, public.media,
  public.inquiries, public.profiles to authenticated;
grant select, delete on public.search_queries to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Search analytics view for the admin dashboard
-- ---------------------------------------------------------------------------

create or replace view public.search_term_stats
with (security_invoker = true) as
select
  lower(trim(term)) as term,
  count(*)::integer as searches,
  max(created_at) as last_searched_at,
  round(avg(results_count))::integer as avg_results,
  sum(case when results_count = 0 then 1 else 0 end)::integer as zero_result_searches
from public.search_queries
group by lower(trim(term));

grant select on public.search_term_stats to authenticated;

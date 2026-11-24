# Crown Performance Wear

Wholesale activewear platform: a public catalogue site plus an admin CMS. Built with Next.js 16 (App Router,
`src/` directory, Cache Components), Tailwind CSS v4, Supabase (Postgres + Auth) and AWS S3 for images.

## Quick start

```bash
npm install
cp .env.example .env        # fill in Supabase (and S3) values
npm run db:migrate          # create tables, security rules and the search analytics view
npm run seed:generate       # write supabase/seed.sql from the dummy content
npm run db:seed             # load dummy categories, products, services, posts, FAQs and page content
npm run admin:create -- you@company.com "a-strong-password" "Your Name"
npm run dev
```

Site: http://localhost:3000 · Admin: http://localhost:3000/admin

Without Supabase variables, the public site still runs from the bundled dummy content ("demo mode"), and the
admin shows setup instructions.

## Public site

| Route | What it is |
| --- | --- |
| `/` | Home: hero, proof band, collections explorer, process, services, FAQ, insights, catalogue request form |
| `/products` | Catalogue with search, category filter and sort |
| `/products/[slug]` | Product detail: gallery, tiered wholesale price breaks, specs, add to enquiry, WhatsApp |
| `/collections`, `/collections/[slug]` | Categories and their products |
| `/services`, `/services/[slug]` | Services, comparison table, per-service enquiry form |
| `/about`, `/contact`, `/faq` | Company page, contact form, grouped FAQ (with FAQ schema) |
| `/insights`, `/insights/[slug]` | Buyer guides (Markdown articles) |
| `/quote` | Enquiry list ("cart" of styles + quantities) sent as one quote request |
| `/search` | Site search across products, collections, services and articles (searches are logged) |
| `/<slug>` | Custom pages created in the admin (wholesale terms, policies, landing pages) |

## Admin dashboard (`/admin`)

Only users whose `profiles.role` is `admin` can sign in. Every admin page and server action re-checks the role,
and Postgres row-level security enforces it again at the database.

- **Overview**: counts, new inquiries, top and zero-result searches
- **Products**: CRUD, images (S3 upload or URL), price tiers, specs, sizes/colours, SEO, publish/feature toggles, trash and restore
- **Categories, Services, Insights, FAQs**: full CRUD with ordering
- **Pages**: every section of every system page (home, products, services, about, contact, ...) is editable from a
  generated form; custom Markdown pages
- **Settings**: brand, logo, contact details, WhatsApp, navigation, footer, socials, enquiry categories, popular searches, SEO
- **Inquiries**: quote/contact/catalogue requests with status pipeline and notes
- **Searches**: what visitors search for, and which searches found nothing
- **Media**: S3 upload library
- **Users**: promote/demote admins, create admin accounts (needs `SUPABASE_SECRET_KEY`)

Saving in the admin refreshes the public pages immediately (cache tags are expired on every write).

## Editing page content in code

Page sections are defined in `src/lib/cms/schema.ts` and their default content in `src/lib/cms/defaults.ts`. Add a field
to a section's schema, render it in the page, and it appears in the admin form automatically.

## Images (AWS S3)

1. Create a bucket and an IAM user that can `s3:PutObject` on `arn:aws:s3:::<bucket>/uploads/*`.
2. Make `uploads/*` publicly readable (bucket policy) or put CloudFront in front and set `NEXT_PUBLIC_S3_PUBLIC_URL`.
3. Add a CORS rule so the browser can upload directly:

```json
[{ "AllowedOrigins": ["http://localhost:3000", "https://your-domain.com"], "AllowedMethods": ["PUT"], "AllowedHeaders": ["*"], "MaxAgeSeconds": 3000 }]
```

4. Set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` (or `REGION`) and `S3_BUCKET` (or an `S3_URL` that
   contains the bucket).

## Site images

The stock photos on every page live in your storage bucket under `site/` as compressed WebP files, cropped to the
size each one is shown at (about 6 MB in total, down from 18 MB of source photos). `next/image` then serves
right-sized AVIF/WebP versions to each device.

- Change a photo: edit its slot in `scripts/site-images.mts`, then run `npx tsx scripts/site-images.mts --only=<slot>`.
  File names include a content hash, so a changed image always gets a new URL (no stale CDN copies).
- Point existing database content at rebuilt images: `npx tsx scripts/refresh-images.mts`. It only replaces placeholder
  images, never images you set in the admin.

## Motion

Scroll animations follow the reference design: line-by-line headline reveals, photo wipes, staggered lists, drawn
divider lines, parallax backgrounds, a slow hero zoom and a pinned sideways scroller for insights on desktop. Add
`data-reveal="up|fade|clip|lines|stagger|grow"` to any element (or use `<Reveal>`), and `data-parallax="0.1"` to a
background layer. Everything is CSS-driven by one observer (`src/components/site/motion-observer.tsx`) and is switched
off for visitors who prefer reduced motion.

## Dummy content

The seed data (6 categories, 18 products, 4 services, 3 articles, 8 FAQs, 3 custom pages) lives in
`src/lib/demo/catalog.ts`. Photos are free-licence Unsplash images (compressed copies in your bucket) used as
placeholders; replace them with your own product photography before launch. Contact details are placeholders too:
update them in Admin → Settings.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run db:status` | List tables and applied migrations |
| `npm run db:migrate` | Apply new files in `supabase/migrations` (uses `DIRECT_URL`) |
| `npm run seed:generate` / `npm run db:seed` | Regenerate and load the dummy content (re-running restores it) |
| `npm run admin:create -- <email> <password> [name]` | Create or promote an admin user |
| `npm run typecheck`, `npm run lint`, `npm run build` | Checks |
# crownperformancewear

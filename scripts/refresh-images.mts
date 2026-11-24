/**
 * Points the database's dummy content at the compressed images in the storage bucket.
 * Only values that still hold an old Unsplash placeholder URL are changed, so anything edited in the
 * admin dashboard is left alone.   npx tsx scripts/refresh-images.mts
 */
import { existsSync } from "node:fs";
import pg from "pg";
import { PAGE_DEFAULTS } from "../src/lib/cms/defaults";
import { DEMO_CATEGORIES, DEMO_POSTS, DEMO_PRODUCTS, DEMO_SERVICES } from "../src/lib/demo/catalog";

for (const file of [".env.local", ".env"]) if (existsSync(file)) process.loadEnvFile(file);

const OLD = "images.unsplash.com";
/** Placeholder URLs: Unsplash originals, or site images from before content-hashed filenames. */
const isOld = (v: unknown) =>
  typeof v === "string" && (v.includes(OLD) || (/\/site\/[a-z0-9-]+\.webp$/.test(v) && !/-[0-9a-f]{10}\.webp$/.test(v)));

/** Replace placeholder strings in `saved` with the value at the same path in `fresh`. */
function swap(saved: unknown, fresh: unknown): unknown {
  if (isOld(saved)) return typeof fresh === "string" ? fresh : saved;
  if (Array.isArray(saved)) return saved.map((v, i) => swap(v, Array.isArray(fresh) ? fresh[i] : undefined));
  if (saved && typeof saved === "object") {
    const f = (fresh && typeof fresh === "object" ? fresh : {}) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(saved as Record<string, unknown>).map(([k, v]) => [k, swap(v, f[k])]));
  }
  return saved;
}

const client = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
let changed = 0;

async function updateColumn(table: string, column: string, rows: Array<{ id: string; value: unknown }>, json = false) {
  for (const row of rows) {
    const current = await client.query(`select ${column} as v from public.${table} where id = $1`, [row.id]);
    if (!current.rows.length) continue;
    const v = current.rows[0].v;
    const next = json ? swap(v, row.value) : isOld(v) ? row.value : v;
    if (JSON.stringify(next) !== JSON.stringify(v)) {
      await client.query(`update public.${table} set ${column} = $2${json ? "::jsonb" : ""} where id = $1`, [
        row.id,
        json ? JSON.stringify(next) : next,
      ]);
      changed++;
    }
  }
}

await updateColumn("categories", "image_url", DEMO_CATEGORIES.map((c) => ({ id: c.id, value: c.image_url })));
await updateColumn("products", "images", DEMO_PRODUCTS.map((p) => ({ id: p.id, value: p.images })), true);
await updateColumn("services", "image_url", DEMO_SERVICES.map((s) => ({ id: s.id, value: s.image_url })));
await updateColumn("posts", "cover_url", DEMO_POSTS.map((p) => ({ id: p.id, value: p.cover_url })));

for (const [slug, sections] of Object.entries(PAGE_DEFAULTS)) {
  const current = await client.query("select id, sections from public.pages where slug = $1", [slug]);
  if (!current.rows.length) continue;
  const next = swap(current.rows[0].sections, sections);
  if (JSON.stringify(next) !== JSON.stringify(current.rows[0].sections)) {
    await client.query("update public.pages set sections = $2::jsonb where id = $1", [current.rows[0].id, JSON.stringify(next)]);
    changed++;
  }
}

const left = await client.query(
  `select (select count(*) from public.products where images::text like '%${OLD}%')
        + (select count(*) from public.categories where image_url like '%${OLD}%')
        + (select count(*) from public.pages where sections::text like '%${OLD}%') as n`,
);
console.log(`Updated ${changed} rows. Rows still using placeholder URLs: ${left.rows[0].n}`);
await client.end();

/**
 * Database helper for Crown Performance Wear.
 *
 *   npm run db:status    list public tables and applied migrations
 *   npm run db:migrate   apply new files from supabase/migrations (tracked in app_private.migrations)
 *   npm run db:seed      load supabase/seed.sql (dummy content; safe to re-run, upserts by id)
 *
 * Uses DIRECT_URL (session pooler) or DATABASE_URL from .env / .env.local. Never prints the URL.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import pg from "pg";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Set DIRECT_URL (or DATABASE_URL) in .env to your Supabase Postgres connection string.");
  process.exit(1);
}

const MIGRATIONS_DIR = path.join(process.cwd(), "supabase", "migrations");
const SEED_FILE = path.join(process.cwd(), "supabase", "seed.sql");

async function withClient<T>(fn: (client: pg.Client) => Promise<T>): Promise<T> {
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

async function ensureTracking(client: pg.Client) {
  await client.query(`
    create schema if not exists app_private;
    create table if not exists app_private.migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    );
    revoke all on schema app_private from anon, authenticated;
  `);
}

async function status() {
  await withClient(async (client) => {
    await ensureTracking(client);
    const tables = await client.query<{ table_name: string }>(
      "select table_name from information_schema.tables where table_schema = 'public' order by 1",
    );
    const applied = await client.query<{ name: string; applied_at: Date }>(
      "select name, applied_at from app_private.migrations order by name",
    );
    console.log("Public tables:", tables.rows.map((r) => r.table_name).join(", ") || "(none)");
    console.log("Applied migrations:");
    for (const row of applied.rows) console.log(`  ${row.name}  ${row.applied_at.toISOString()}`);
    if (!applied.rows.length) console.log("  (none)");
  });
}

async function migrate() {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  await withClient(async (client) => {
    await ensureTracking(client);
    const done = new Set(
      (await client.query<{ name: string }>("select name from app_private.migrations")).rows.map((r) => r.name),
    );
    const pending = files.filter((f) => !done.has(f));
    if (!pending.length) {
      console.log("Database is up to date.");
      return;
    }
    for (const file of pending) {
      const sql = readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
      process.stdout.write(`Applying ${file} ... `);
      await client.query("begin");
      try {
        await client.query(sql);
        await client.query("insert into app_private.migrations (name) values ($1)", [file]);
        await client.query("commit");
        console.log("done");
      } catch (error) {
        await client.query("rollback");
        console.log("failed");
        throw error;
      }
    }
    // Ask PostgREST to pick up the new tables straight away.
    await client.query("notify pgrst, 'reload schema'");
  });
}

async function seed() {
  if (!existsSync(SEED_FILE)) {
    console.error("supabase/seed.sql not found. Run `npm run seed:generate` first.");
    process.exit(1);
  }
  const sql = readFileSync(SEED_FILE, "utf8");
  await withClient(async (client) => {
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query("commit");
      console.log("Seed data loaded.");
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  });
}

const command = process.argv[2] ?? "status";
const commands: Record<string, () => Promise<void>> = { status, migrate, seed };
const run = commands[command];
if (!run) {
  console.error(`Unknown command "${command}". Use: status | migrate | seed`);
  process.exit(1);
}
run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

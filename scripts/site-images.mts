/**
 * Builds the site's stock imagery: downloads each source photo (free Unsplash licence), crops it to the size
 * it is displayed at, compresses it to WebP and uploads it to the storage bucket under `site/`.
 * Writes src/lib/cms/site-images.generated.ts (slot → public URL) for the defaults and dummy catalogue.
 *
 *   npx tsx scripts/site-images.mts            build missing images
 *   npx tsx scripts/site-images.mts --force    rebuild all
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";

for (const file of [".env.local", ".env"]) if (existsSync(file)) process.loadEnvFile(file);

type Slot = { slot: string; id: string; w: number; h: number; flop?: boolean };
const HERO = { w: 2000, h: 1250 };
const WIDE = { w: 1400, h: 1050 };
const TILE = { w: 900, h: 1100 };
const CARD = { w: 1200, h: 1400 };
const PRODUCT = { w: 1100, h: 1180 };

const s = (slot: string, id: string, size: { w: number; h: number }, flop = false): Slot => ({ slot, id, ...size, flop });

export const SLOTS: Slot[] = [
  // Page heroes and banners
  s("home-hero", "photo-1611672585731-fa10603fb9e0", HERO, true),
  s("home-statement", "photo-1637004732258-4b792ce8f474", HERO),
  s("home-process", "photo-1530427425868-037e7819fb3b", WIDE),
  s("home-catalogue", "photo-1650287052182-a13d8245c927", { w: 800, h: 840 }),
  s("home-inquiry", "photo-1499971856191-1a420a42b498", HERO),
  s("stage-define", "photo-1605002619330-080580537d72", WIDE),
  s("stage-review", "photo-1561053114-fbe0ffaa1440", WIDE),
  s("stage-deliver", "photo-1451933335233-c41672c8f378", WIDE),
  s("gallery-1", "photo-1610891015188-5369212db097", TILE),
  s("gallery-2", "photo-1652211955967-99c892925469", TILE),
  s("gallery-3", "photo-1741176505800-caaa3a52631a", TILE),
  s("gallery-4", "photo-1625479144604-ae69462778b7", TILE),
  s("gallery-5", "photo-1741176506261-73218298e4d8", TILE),
  s("gallery-6", "photo-1768746350424-ee28a364dcf5", TILE),
  s("gallery-7", "photo-1659707751291-3f8666211d07", TILE),
  s("gallery-8", "photo-1675176785803-bffbbb0cd2f4", TILE),
  s("products-hero", "photo-1567401893414-76b7b1e5a7a5", HERO),
  s("collections-hero", "photo-1555529771-122e5d9f2341", HERO),
  s("services-hero", "photo-1589793463357-5fb813435467", HERO),
  s("about-hero", "photo-1540221652346-e5dd6b50f3e7", HERO),
  s("about-cta", "photo-1542219550-2da790bf52e9", WIDE),
  s("contact-hero", "photo-1562157873-818bc0726f68", HERO),
  s("faq-hero", "photo-1629426958003-35a5583b2977", HERO),
  s("insights-hero", "photo-1593250816874-8edf4f732edb", HERO),
  // Categories
  s("cat-tops", "photo-1608217002058-2e45c33b6c2c", CARD),
  s("cat-polos", "photo-1761956255550-e1d6d12e94be", CARD),
  s("cat-shorts", "photo-1729280924877-4750c0dba51e", CARD),
  s("cat-hoodies", "photo-1677538537484-324385aff147", CARD),
  s("cat-leggings", "photo-1617085606193-6b17105cff2a", CARD),
  s("cat-teamkits", "photo-1752681304960-bd4e018a04bb", CARD),
  // Products
  s("p-t101-1", "photo-1521572163474-6864f9cf17ab", PRODUCT),
  s("p-t101-2", "photo-1759572095317-3a96f9a98e2b", PRODUCT),
  s("p-t204-1", "photo-1608217002058-2e45c33b6c2c", PRODUCT),
  s("p-t204-2", "photo-1581009137042-c552e485697a", PRODUCT),
  s("p-t310-1", "photo-1620799139507-2a76f79a2f4d", PRODUCT),
  s("p-t310-2", "photo-1693443687750-611ad77f3aba", PRODUCT),
  s("p-p110-1", "photo-1671438118097-479e63198629", PRODUCT),
  s("p-p110-2", "photo-1714317438040-0e8584215699", PRODUCT),
  s("p-p220-1", "photo-1761956255550-e1d6d12e94be", PRODUCT),
  s("p-p220-2", "photo-1720514496268-44bb31c03815", PRODUCT),
  s("p-p305-1", "photo-1586363104862-3a5e2ab60d99", PRODUCT),
  s("p-p305-2", "photo-1549037173-e3b717902c57", PRODUCT),
  s("p-s120-1", "photo-1729280924877-4750c0dba51e", PRODUCT),
  s("p-s120-2", "photo-1602190420103-683df5093e86", PRODUCT),
  s("p-j240-1", "photo-1650461970708-7bf32499516d", PRODUCT),
  s("p-j240-2", "photo-1506629082955-511b1aa562c8", PRODUCT),
  s("p-j330-1", "photo-1602573991155-21f0143bb45c", PRODUCT),
  s("p-j330-2", "photo-1779676086590-b003acb94c7b", PRODUCT),
  s("p-h320-1", "photo-1620799140188-3b2a02fd9a77", PRODUCT),
  s("p-h320-2", "photo-1742392133846-a8b416e81661", PRODUCT),
  s("p-h320-3", "photo-1738486260590-23c954cf29b8", PRODUCT),
  s("p-h420-1", "photo-1673092147872-5ddb03194341", PRODUCT),
  s("p-h420-2", "photo-1699275303942-47957eea44b1", PRODUCT),
  s("p-c300-1", "photo-1759229874786-6d0cc75d95be", PRODUCT),
  s("p-c300-2", "photo-1542219550-2da790bf52e9", PRODUCT),
  s("p-l250-1", "photo-1789110853564-23a6b1d206e7", PRODUCT),
  s("p-l250-2", "photo-1606903037631-f09fd0bd74b4", PRODUCT),
  s("p-b180-1", "photo-1606902965551-dce093cda6e7", PRODUCT),
  s("p-b180-2", "photo-1635863637085-caaf8653938b", PRODUCT),
  s("p-k140-1", "photo-1597297260448-3cc8d0a38388", PRODUCT),
  s("p-k140-2", "photo-1762331660576-cbf66a7db84d", PRODUCT),
  s("p-tk10-1", "photo-1588333313104-1778f102e5ff", PRODUCT),
  s("p-tk10-2", "photo-1598881034666-6d3443d4b1bc", PRODUCT),
  s("p-ts20-1", "photo-1775836214303-416ff5ce9f81", PRODUCT),
  s("p-ts20-2", "photo-1752681304960-bd4e018a04bb", PRODUCT),
  s("p-ms30-1", "photo-1779676086744-a83b1f0e00bd", PRODUCT),
  s("p-ms30-2", "photo-1588117305388-c2631a279f82", PRODUCT),
  // Services
  s("svc-ready", "photo-1555529733-d1bc3c140ca8", WIDE),
  s("svc-private", "photo-1716951848908-8907bb6c655b", WIDE),
  s("svc-team", "photo-1748111405983-d1b10316eb83", WIDE),
  s("svc-decoration", "photo-1625479142928-c2f2914318f2", WIDE),
  // Insights
  s("post-vet", "photo-1741176505800-caaa3a52631a", WIDE),
  s("post-routes", "photo-1620799139834-6b8f844fbe61", WIDE),
  s("post-moq", "photo-1630329273801-8f629dba0a72", WIDE),
];

function storage() {
  const endpoint = process.env.S3_ENDPOINT || process.env.S3_URL;
  const bucket = process.env.S3_BUCKET;
  const region = process.env.AWS_REGION || process.env.REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!endpoint || !bucket || !region || !accessKeyId || !secretAccessKey) {
    throw new Error("Set S3_URL, S3_BUCKET, REGION, AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env first.");
  }
  const url = new URL(endpoint);
  const ref = url.hostname.split(".")[0];
  const isSupabase = /supabase\.(co|in)$/.test(url.hostname);
  const publicBase = process.env.NEXT_PUBLIC_S3_PUBLIC_URL
    ? process.env.NEXT_PUBLIC_S3_PUBLIC_URL.replace(/\/$/, "")
    : isSupabase
      ? `https://${ref}.supabase.co/storage/v1/object/public/${bucket}`
      : `https://${bucket}.s3.${region}.amazonaws.com`;
  const client = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
    ...(isSupabase ? { endpoint, forcePathStyle: true } : {}),
    requestChecksumCalculation: "WHEN_REQUIRED",
  });
  return { client, bucket, publicBase };
}

async function exists(client: S3Client, bucket: string, key: string) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const force = process.argv.includes("--force");
  const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7).split(",");
  const { client, bucket, publicBase } = storage();
  const file = path.join(process.cwd(), "src", "lib", "cms", "site-images.generated.ts");
  // Previously built URLs are reused unless a slot is rebuilt. Keys carry a content hash, so a rebuilt
  // image gets a new URL and long-lived CDN/browser caches can never serve a stale copy.
  const previous: Record<string, string> = existsSync(file)
    ? (JSON.parse(readFileSync(file, "utf8").match(/= (\{[\s\S]*?\}) as const/)?.[1] ?? "{}") as Record<string, string>)
    : {};
  const urls: Record<string, string> = {};
  let totalIn = 0;
  let totalOut = 0;

  const queue = [...SLOTS];
  const worker = async () => {
    for (let item = queue.shift(); item; item = queue.shift()) {
      const known = previous[item.slot];
      const rebuild = force || (only ? only.includes(item.slot) : !known || !/-[0-9a-f]{10}\.webp$/.test(known));
      if (!rebuild && known && (await exists(client, bucket, known.slice(publicBase.length + 1)))) {
        urls[item.slot] = known;
        continue;
      }
      const src = `https://images.unsplash.com/${item.id}?w=${item.w}&h=${item.h}&fit=crop&crop=faces,entropy&fm=jpg&q=90`;
      const res = await fetch(src);
      if (!res.ok) throw new Error(`Download failed for ${item.slot}: ${res.status}`);
      const input = Buffer.from(await res.arrayBuffer());
      const output = await (item.flop ? sharp(input).flop() : sharp(input))
        .resize(item.w, item.h, { fit: "cover", position: "attention" })
        .webp({ quality: 72, effort: 5 })
        .toBuffer();
      totalIn += input.length;
      totalOut += output.length;
      const hash = createHash("sha256").update(output).digest("hex").slice(0, 10);
      const key = `site/${item.slot}-${hash}.webp`;
      urls[item.slot] = `${publicBase}/${key}`;
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: output,
          ContentType: "image/webp",
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );
      console.log(`${item.slot.padEnd(18)} ${(input.length / 1024).toFixed(0).padStart(5)} KB → ${(output.length / 1024).toFixed(0).padStart(4)} KB`);
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);

  const ordered = Object.fromEntries(SLOTS.map((x) => [x.slot, urls[x.slot]]));
  writeFileSync(
    file,
    `// Generated by scripts/site-images.mts. Compressed WebP copies of the site's stock photos in your storage bucket.\n` +
      `export const SITE_IMAGES = ${JSON.stringify(ordered, null, 2)} as const;\n\n` +
      `export type SiteImageSlot = keyof typeof SITE_IMAGES;\n`,
  );
  if (totalIn) console.log(`\nCompressed ${(totalIn / 1048576).toFixed(1)} MB → ${(totalOut / 1048576).toFixed(1)} MB`);
  console.log(`Wrote ${file}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

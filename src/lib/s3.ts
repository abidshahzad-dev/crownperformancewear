import "server-only";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { slugify } from "@/lib/utils";

/** Image types the dashboard accepts. SVG is excluded because it can carry scripts. */
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

type S3Config = {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBase: string;
  /** Custom S3-compatible endpoint (Supabase Storage). Undefined means Amazon S3. */
  endpoint?: string;
};

/**
 * Supabase Storage exposes an S3-compatible API at https://<ref>.storage.supabase.co/storage/v1/s3
 * (or https://<ref>.supabase.co/storage/v1/s3). Returns the endpoint and the public object base for a bucket.
 */
export function parseSupabaseS3Url(value: string | undefined): { endpoint: string; publicOrigin: string } | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    const match = url.hostname.match(/^([a-z0-9]+)\.(?:storage\.)?supabase\.(co|in)$/);
    if (!match || !url.pathname.replace(/\/$/, "").endsWith("/storage/v1/s3")) return null;
    return {
      endpoint: `${url.origin}${url.pathname.replace(/\/$/, "")}`,
      publicOrigin: `https://${match[1]}.supabase.${match[2]}`,
    };
  } catch {
    return null;
  }
}

/** Reads bucket (and region) out of an S3 URL in virtual-hosted or path style. */
export function parseS3Url(value: string | undefined): { bucket?: string; region?: string } {
  if (!value) return {};
  try {
    const url = new URL(value);
    const virtual = url.hostname.match(/^(.+)\.s3[.-]([a-z0-9-]+)\.amazonaws\.com$/);
    if (virtual) return { bucket: virtual[1], region: virtual[2] };
    const path = url.hostname.match(/^s3[.-]([a-z0-9-]+)\.amazonaws\.com$/);
    if (path) {
      const bucket = url.pathname.split("/").filter(Boolean)[0];
      return { bucket, region: path[1] };
    }
    const legacy = url.hostname.match(/^(.+)\.s3\.amazonaws\.com$/);
    if (legacy) return { bucket: legacy[1] };
  } catch {
    // Not a URL; ignore.
  }
  return {};
}

type S3Settings = {
  region?: string;
  bucket?: string;
  publicBase?: string;
  endpoint?: string;
  hasCredentials: boolean;
};

/**
 * Raw storage settings, including what is missing. Works with Amazon S3 or Supabase Storage's S3 API:
 * when S3_URL (or S3_ENDPOINT) is a Supabase storage endpoint, uploads go there and images are served from
 * the bucket's public URL. Accepts AWS_REGION or REGION.
 */
export function getS3Settings(): S3Settings {
  const supabase = parseSupabaseS3Url(process.env.S3_ENDPOINT || process.env.S3_URL);
  const fromUrl = supabase ? {} : parseS3Url(process.env.S3_URL || process.env.NEXT_PUBLIC_S3_PUBLIC_URL);
  const region = process.env.AWS_REGION || process.env.REGION || fromUrl.region;
  const bucket = process.env.S3_BUCKET || fromUrl.bucket;

  let publicBase: string | undefined;
  if (process.env.NEXT_PUBLIC_S3_PUBLIC_URL) publicBase = process.env.NEXT_PUBLIC_S3_PUBLIC_URL;
  else if (supabase && bucket) publicBase = `${supabase.publicOrigin}/storage/v1/object/public/${bucket}`;
  else if (process.env.S3_URL && !supabase) publicBase = process.env.S3_URL;
  else if (bucket && region) publicBase = `https://${bucket}.s3.${region}.amazonaws.com`;

  return {
    region,
    bucket,
    publicBase: publicBase?.replace(/\/$/, ""),
    endpoint: supabase?.endpoint ?? (process.env.S3_ENDPOINT || undefined),
    hasCredentials: Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
  };
}

/** Human-readable list of the S3 settings that are still missing. */
export function missingS3Settings(): string[] {
  const s = getS3Settings();
  const missing: string[] = [];
  if (!s.hasCredentials) missing.push("AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY");
  if (!s.region) missing.push("AWS_REGION (or REGION)");
  if (!s.bucket) missing.push("S3_BUCKET (or an S3_URL that names the bucket)");
  return missing;
}

export function getS3Config(): S3Config | null {
  const s = getS3Settings();
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!s.region || !s.bucket || !s.publicBase || !accessKeyId || !secretAccessKey) return null;
  return {
    region: s.region,
    bucket: s.bucket,
    accessKeyId,
    secretAccessKey,
    publicBase: s.publicBase,
    endpoint: s.endpoint,
  };
}

export function isS3Configured(): boolean {
  return getS3Config() !== null;
}

function client(config: S3Config): S3Client {
  return new S3Client({
    region: config.region,
    credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
    // Supabase Storage (and most S3-compatible services) need path-style URLs on their own endpoint.
    ...(config.endpoint ? { endpoint: config.endpoint, forcePathStyle: true } : {}),
    // Presigned browser uploads must not carry a precomputed body checksum: the SDK would sign the
    // checksum of an empty body and the real upload would be rejected.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
}

export function buildObjectKey(filename: string, contentType: string, now = new Date()): string {
  const ext = ALLOWED_IMAGE_TYPES[contentType] ?? "bin";
  const base = slugify(filename.replace(/\.[^.]+$/, "")).slice(0, 60) || "image";
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `uploads/${yyyy}/${mm}/${crypto.randomUUID()}-${base}.${ext}`;
}

/** Presigned PUT URL valid for 5 minutes. The browser uploads directly to S3. */
export async function createPresignedUpload(input: { filename: string; contentType: string; size: number }) {
  const config = getS3Config();
  if (!config) throw new Error("S3 is not configured.");
  const key = buildObjectKey(input.filename, input.contentType);
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    ContentType: input.contentType,
    ContentLength: input.size,
    CacheControl: "public, max-age=31536000, immutable",
  });
  const uploadUrl = await getSignedUrl(client(config), command, { expiresIn: 300 });
  return { uploadUrl, key, publicUrl: `${config.publicBase}/${key}` };
}

export async function deleteObject(key: string): Promise<void> {
  const config = getS3Config();
  if (!config || !key.startsWith("uploads/")) return;
  await client(config).send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key }));
}

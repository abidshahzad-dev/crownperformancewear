import { z } from "zod";
import { getAdminContext } from "@/lib/auth";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  createPresignedUpload,
  isS3Configured,
  missingS3Settings,
} from "@/lib/s3";

const bodySchema = z.object({
  filename: z.string().trim().min(1).max(200),
  contentType: z.string().refine((t) => t in ALLOWED_IMAGE_TYPES, "Only JPG, PNG, WebP, AVIF or GIF images are allowed."),
  size: z
    .number()
    .int()
    .positive()
    .max(MAX_UPLOAD_BYTES, `Images must be ${MAX_UPLOAD_BYTES / 1024 / 1024} MB or smaller.`),
});

/** Issues a presigned S3 PUT URL for an admin image upload. */
export async function POST(request: Request) {
  const ctx = await getAdminContext();
  if (!ctx) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!isS3Configured()) {
    return Response.json(
      { error: `S3 uploads are not set up yet. Missing: ${missingS3Settings().join(", ")}.` },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid upload." }, { status: 400 });
  }

  try {
    const upload = await createPresignedUpload(parsed.data);
    return Response.json(upload);
  } catch (error) {
    console.error("Presign failed:", error instanceof Error ? error.message : "unknown error");
    return Response.json({ error: "Could not prepare the upload." }, { status: 500 });
  }
}

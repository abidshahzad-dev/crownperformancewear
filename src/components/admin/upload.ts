"use client";

import { recordMedia } from "@/app/admin/actions/media";

export type UploadedImage = { url: string; key: string };

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/** Client-side check so obvious mistakes fail fast, before asking the server for an upload URL. */
export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return `${file.name}: use a JPG, PNG, WebP, AVIF or GIF image.`;
  if (file.size > MAX_IMAGE_BYTES) return `${file.name}: images must be 10 MB or smaller.`;
  return null;
}

/** PUT with progress events (fetch has no upload progress). */
function putWithProgress(url: string, file: File, onProgress?: (fraction: number) => void): Promise<number> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total);
    };
    xhr.onload = () => resolve(xhr.status);
    xhr.onerror = () => reject(new Error("Network error while uploading. Check the storage bucket's CORS settings."));
    xhr.send(file);
  });
}

/**
 * Uploads one image straight from the browser to storage with a presigned URL, then records it in the
 * media library. Throws an Error with a readable message on failure.
 */
export async function uploadImageFile(file: File, onProgress?: (fraction: number) => void): Promise<UploadedImage> {
  const invalid = validateImageFile(file);
  if (invalid) throw new Error(invalid);

  const presign = await fetch("/api/admin/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
  });
  const body: unknown = await presign.json().catch(() => ({}));
  if (!presign.ok) {
    const message = body && typeof body === "object" && "error" in body ? String(body.error) : "Upload failed.";
    throw new Error(message);
  }
  const { uploadUrl, publicUrl, key } = body as { uploadUrl: string; publicUrl: string; key: string };

  onProgress?.(0);
  const status = await putWithProgress(uploadUrl, file, onProgress);
  if (status < 200 || status >= 300) {
    throw new Error(`Storage rejected the upload (${status}). Check the bucket allows uploads from this site.`);
  }
  onProgress?.(1);

  const recorded = await recordMedia({
    url: publicUrl,
    storage_key: key,
    filename: file.name,
    content_type: file.type,
    size_bytes: file.size,
    alt: null,
  });
  if (!recorded.ok) throw new Error(recorded.message);
  return { url: publicUrl, key };
}

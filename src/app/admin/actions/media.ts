"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { requireAdminAction, UnauthorizedError } from "@/lib/auth";
import { deleteObject } from "@/lib/s3";
import type { Media } from "@/lib/types";
import type { ActionResult } from "./entities";

const mediaSchema = z.object({
  url: z
    .string()
    .max(2000)
    .refine((v) => /^https?:\/\//.test(v), "Invalid URL."),
  storage_key: z.string().max(500).nullable().optional(),
  filename: z.string().max(300).nullable().optional(),
  content_type: z.string().max(100).nullable().optional(),
  size_bytes: z.number().int().min(0).nullable().optional(),
  alt: z.string().max(300).nullable().optional(),
});

function failure(error: unknown): ActionResult {
  if (error instanceof UnauthorizedError) return { ok: false, message: error.message };
  const message =
    error && typeof error === "object" && "message" in error ? String((error as { message: string }).message) : "";
  return { ok: false, message: message || "Something went wrong." };
}

/** Records an uploaded file (or pasted URL) in the media library. */
export async function recordMedia(values: unknown): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireAdminAction();
    const data = mediaSchema.parse(values);
    const { data: row, error } = await supabase
      .from("media")
      .insert({ ...data, created_by: user.id })
      .select("id")
      .single();
    if (error) return failure(error);
    return { ok: true, message: "Added to media library.", id: String((row as { id: string }).id) };
  } catch (error) {
    return failure(error);
  }
}

export async function listMediaForPicker(): Promise<Array<Pick<Media, "id" | "url" | "filename" | "alt">>> {
  const { supabase } = await requireAdminAction();
  const { data } = await supabase
    .from("media")
    .select("id, url, filename, alt")
    .order("created_at", { ascending: false })
    .limit(120);
  return (data ?? []) as Array<Pick<Media, "id" | "url" | "filename" | "alt">>;
}

export async function updateMediaAlt(id: string, alt: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdminAction();
    z.uuid().parse(id);
    const { error } = await supabase
      .from("media")
      .update({ alt: z.string().max(300).parse(alt) })
      .eq("id", id);
    if (error) return failure(error);
    return { ok: true, message: "Alt text saved." };
  } catch (error) {
    return failure(error);
  }
}

/** Removes the library entry and, for files uploaded through the dashboard, the S3 object too. */
export async function deleteMedia(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdminAction();
    z.uuid().parse(id);
    const { data: row } = await supabase.from("media").select("storage_key").eq("id", id).maybeSingle();
    const { error } = await supabase.from("media").delete().eq("id", id);
    if (error) return failure(error);
    const key = row ? (row as { storage_key: string | null }).storage_key : null;
    if (key) {
      try {
        await deleteObject(key);
      } catch (e) {
        console.error("S3 delete failed:", e instanceof Error ? e.message : "unknown");
      }
    }
    refresh();
    return { ok: true, message: "Deleted." };
  } catch (error) {
    return failure(error);
  }
}

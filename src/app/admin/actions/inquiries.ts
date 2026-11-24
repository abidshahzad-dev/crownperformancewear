"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { requireAdminAction, UnauthorizedError } from "@/lib/auth";
import { INQUIRY_STATUSES } from "@/lib/types";
import type { ActionResult } from "./entities";

const updateSchema = z.object({
  status: z.enum(INQUIRY_STATUSES),
  admin_notes: z
    .string()
    .max(5000)
    .transform((v) => v.trim() || null),
});

function failure(error: unknown): ActionResult {
  if (error instanceof UnauthorizedError) return { ok: false, message: error.message };
  const message =
    error && typeof error === "object" && "message" in error ? String((error as { message: string }).message) : "";
  return { ok: false, message: message || "Something went wrong." };
}

export async function updateInquiry(id: string, values: unknown): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdminAction();
    z.uuid().parse(id);
    const data = updateSchema.parse(values);
    const { error } = await supabase.from("inquiries").update(data).eq("id", id);
    if (error) return failure(error);
    refresh();
    return { ok: true, message: "Inquiry updated." };
  } catch (error) {
    return failure(error);
  }
}

export async function setInquiryStatus(id: string, status: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdminAction();
    z.uuid().parse(id);
    const { error } = await supabase
      .from("inquiries")
      .update({ status: z.enum(INQUIRY_STATUSES).parse(status) })
      .eq("id", id);
    if (error) return failure(error);
    refresh();
    return { ok: true, message: "Status updated." };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteInquiry(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdminAction();
    z.uuid().parse(id);
    const { error } = await supabase.from("inquiries").delete().eq("id", id);
    if (error) return failure(error);
    refresh();
    return { ok: true, message: "Inquiry deleted." };
  } catch (error) {
    return failure(error);
  }
}

export async function clearSearchLogs(term?: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdminAction();
    let query = supabase.from("search_queries").delete();
    query = term
      ? query.ilike(
          "term",
          z
            .string()
            .max(120)
            .parse(term)
            .replace(/[%_\\]/g, "\\$&"),
        )
      : query.gte("id", 0);
    const { error } = await query;
    if (error) return failure(error);
    refresh();
    return { ok: true, message: term ? `Cleared searches for “${term}”.` : "Search history cleared." };
  } catch (error) {
    return failure(error);
  }
}

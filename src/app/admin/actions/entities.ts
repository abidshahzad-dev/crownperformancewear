"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { ENTITIES, TOGGLE_FIELDS, type EntityName } from "@/lib/admin/entities";
import { requireAdminAction, UnauthorizedError } from "@/lib/auth";

export type ActionResult = { ok: boolean; message: string; id?: string; fieldErrors?: Record<string, string> };

const entityName = z.enum(["products", "categories", "services", "posts", "faqs", "pages"]);
const rowId = z.uuid();

function expire(entity: EntityName, slugs: Array<string | null | undefined> = []) {
  const config = ENTITIES[entity];
  for (const tag of config.tags) updateTag(tag);
  if (config.slugTag) for (const s of slugs) if (s) updateTag(`${config.slugTag}${s}`);
}

function failure(error: unknown): ActionResult {
  if (error instanceof UnauthorizedError) return { ok: false, message: error.message };
  if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "23505") {
    const detail = "message" in error ? String((error as { message: string }).message) : "";
    const field = detail.includes("sku") ? "SKU" : "slug";
    return { ok: false, message: `Another record already uses this ${field}. Choose a different one.` };
  }
  const message =
    error && typeof error === "object" && "message" in error ? String((error as { message: string }).message) : "";
  console.error("Admin action failed:", message);
  return { ok: false, message: message ? `Save failed: ${message}` : "Something went wrong. Please try again." };
}

/** Create (id = null) or update one row of an admin entity. */
export async function saveEntity(entity: EntityName, id: string | null, values: unknown): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdminAction();
    const name = entityName.parse(entity);
    const config = ENTITIES[name];
    const parsed = config.schema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.map(String).join(".") || "form";
        fieldErrors[key] ??= issue.message;
      }
      const first = Object.entries(fieldErrors)[0];
      return { ok: false, message: first ? `${first[0]}: ${first[1]}` : "Check the form.", fieldErrors };
    }
    const data = parsed.data;
    const newSlug = typeof data.slug === "string" ? data.slug : null;

    if (id) {
      rowId.parse(id);
      const { data: before } = await supabase.from(config.table).select("*").eq("id", id).maybeSingle();
      let query = supabase.from(config.table).update(data).eq("id", id);
      if (name === "pages") query = query.eq("kind", "custom");
      const { error } = await query;
      if (error) return failure(error);
      const oldSlug = before && typeof before === "object" && "slug" in before ? String(before.slug) : null;
      expire(name, [oldSlug, newSlug]);
      return { ok: true, message: "Saved.", id };
    }

    const insert = name === "pages" ? { ...data, kind: "custom" } : data;
    const { data: created, error } = await supabase.from(config.table).insert(insert).select("id").single();
    if (error) return failure(error);
    expire(name, [newSlug]);
    return { ok: true, message: "Created.", id: String((created as { id: string }).id) };
  } catch (error) {
    return failure(error);
  }
}

async function slugOf(entity: EntityName, id: string): Promise<string | null> {
  const { supabase } = await requireAdminAction();
  if (entity === "faqs") return null;
  const { data } = await supabase.from(ENTITIES[entity].table).select("slug").eq("id", id).maybeSingle();
  return data ? String((data as { slug: string }).slug) : null;
}

/** Soft delete (moves to Trash) for core content; FAQs are deleted outright. */
export async function deleteEntity(entity: EntityName, id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdminAction();
    const name = entityName.parse(entity);
    rowId.parse(id);
    const config = ENTITIES[name];
    const slug = await slugOf(name, id);
    let query = config.softDelete
      ? supabase.from(config.table).update({ deleted_at: new Date().toISOString() }).eq("id", id)
      : supabase.from(config.table).delete().eq("id", id);
    if (name === "pages") query = query.eq("kind", "custom");
    const { error } = await query;
    if (error) return failure(error);
    expire(name, [slug]);
    return { ok: true, message: config.softDelete ? "Moved to trash." : "Deleted." };
  } catch (error) {
    return failure(error);
  }
}

export async function restoreEntity(entity: EntityName, id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdminAction();
    const name = entityName.parse(entity);
    rowId.parse(id);
    const config = ENTITIES[name];
    if (!config.softDelete) return { ok: false, message: "This item cannot be restored." };
    const { error } = await supabase.from(config.table).update({ deleted_at: null }).eq("id", id);
    if (error) return failure(error);
    expire(name, [await slugOf(name, id)]);
    return { ok: true, message: "Restored." };
  } catch (error) {
    return failure(error);
  }
}

/** Permanently removes a row that is already in the trash. */
export async function purgeEntity(entity: EntityName, id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdminAction();
    const name = entityName.parse(entity);
    rowId.parse(id);
    const config = ENTITIES[name];
    let query = supabase.from(config.table).delete().eq("id", id);
    if (config.softDelete) query = query.not("deleted_at", "is", null);
    if (name === "pages") query = query.eq("kind", "custom");
    const { error } = await query;
    if (error) return failure(error);
    expire(name);
    return { ok: true, message: "Deleted permanently." };
  } catch (error) {
    return failure(error);
  }
}

export async function toggleEntityFlag(
  entity: EntityName,
  id: string,
  field: string,
  value: boolean,
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdminAction();
    const name = entityName.parse(entity);
    rowId.parse(id);
    if (!TOGGLE_FIELDS[name].includes(field)) return { ok: false, message: "That field cannot be toggled." };
    const { error } = await supabase
      .from(ENTITIES[name].table)
      .update({ [field]: z.boolean().parse(value) })
      .eq("id", id);
    if (error) return failure(error);
    expire(name, [await slugOf(name, id)]);
    return { ok: true, message: "Updated." };
  } catch (error) {
    return failure(error);
  }
}

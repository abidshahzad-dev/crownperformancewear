"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { zodForFields } from "@/lib/admin/schema-zod";
import { requireAdminAction, UnauthorizedError } from "@/lib/auth";
import { DEFAULT_SETTINGS } from "@/lib/cms/defaults";
import { getPageSchema, SETTINGS_SCHEMA } from "@/lib/cms/schema";
import type { ActionResult } from "./entities";

function failure(error: unknown): ActionResult {
  if (error instanceof UnauthorizedError) return { ok: false, message: error.message };
  if (error instanceof z.ZodError) {
    const issue = error.issues[0];
    return { ok: false, message: issue ? `${issue.path.join(".")}: ${issue.message}` : "Invalid content." };
  }
  const message =
    error && typeof error === "object" && "message" in error ? String((error as { message: string }).message) : "";
  console.error("Content save failed:", message);
  return { ok: false, message: message ? `Save failed: ${message}` : "Something went wrong." };
}

/** Saves the editable sections of a system page (home, about, ...). */
export async function saveSystemPage(
  slug: string,
  sections: unknown,
  meta: { seo_title?: string; seo_description?: string },
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdminAction();
    const schema = getPageSchema(z.string().parse(slug));
    if (!schema) return { ok: false, message: "Unknown page." };

    const input = z.record(z.string(), z.unknown()).parse(sections);
    const clean: Record<string, unknown> = {};
    for (const section of schema.sections) {
      clean[section.key] = zodForFields(section.fields).parse(input[section.key] ?? {});
    }
    const seo = z
      .object({ seo_title: z.string().max(120).optional(), seo_description: z.string().max(320).optional() })
      .parse(meta);

    const { error } = await supabase.from("pages").upsert(
      {
        slug: schema.slug,
        title: schema.title,
        kind: "system",
        sections: clean,
        seo_title: seo.seo_title?.trim() || null,
        seo_description: seo.seo_description?.trim() || null,
        is_published: true,
        deleted_at: null,
      },
      { onConflict: "slug" },
    );
    if (error) return failure(error);
    updateTag("pages");
    updateTag(`page:${schema.slug}`);
    return { ok: true, message: `${schema.title} page saved.` };
  } catch (error) {
    return failure(error);
  }
}

/** Resets a system page to the built-in default content. */
export async function resetSystemPage(slug: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdminAction();
    const schema = getPageSchema(z.string().parse(slug));
    if (!schema) return { ok: false, message: "Unknown page." };
    const { error } = await supabase
      .from("pages")
      .update({ sections: {} })
      .eq("slug", schema.slug)
      .eq("kind", "system");
    if (error) return failure(error);
    updateTag("pages");
    updateTag(`page:${schema.slug}`);
    return { ok: true, message: "Page reset to the default content." };
  } catch (error) {
    return failure(error);
  }
}

/** Saves global site settings (brand, contact, navigation, SEO). */
export async function saveSettings(values: unknown): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdminAction();
    const fields = SETTINGS_SCHEMA.flatMap((s) => s.fields);
    const parsed = zodForFields(fields).parse(values);
    const data = { ...DEFAULT_SETTINGS, ...parsed };
    const { error } = await supabase.from("site_settings").upsert({ id: 1, data }, { onConflict: "id" });
    if (error) return failure(error);
    updateTag("settings");
    return { ok: true, message: "Settings saved." };
  } catch (error) {
    return failure(error);
  }
}

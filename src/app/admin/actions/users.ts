"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { requireAdminAction, UnauthorizedError } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import type { ActionResult } from "./entities";

function failure(error: unknown): ActionResult {
  if (error instanceof UnauthorizedError) return { ok: false, message: error.message };
  if (error instanceof z.ZodError) return { ok: false, message: error.issues[0]?.message ?? "Invalid input." };
  const message =
    error && typeof error === "object" && "message" in error ? String((error as { message: string }).message) : "";
  return { ok: false, message: message || "Something went wrong." };
}

export async function setUserRole(userId: string, role: "admin" | "user"): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireAdminAction();
    z.uuid().parse(userId);
    const nextRole = z.enum(["admin", "user"]).parse(role);
    if (userId === user.id && nextRole !== "admin") {
      return { ok: false, message: "You cannot remove your own admin access." };
    }
    const { error } = await supabase.from("profiles").update({ role: nextRole }).eq("id", userId);
    if (error) return failure(error);
    refresh();
    return { ok: true, message: nextRole === "admin" ? "User promoted to admin." : "Admin access removed." };
  } catch (error) {
    return failure(error);
  }
}

const createSchema = z.object({
  email: z.email("Enter a valid email."),
  password: z.string().min(10, "Use at least 10 characters for the password.").max(128),
  full_name: z.string().trim().max(120).optional(),
});

/** Creates (or promotes) a dashboard admin. Needs SUPABASE_SERVICE_ROLE_KEY on the server. */
export async function createAdminUser(values: unknown): Promise<ActionResult> {
  try {
    await requireAdminAction();
    const service = createServiceClient();
    if (!service) return { ok: false, message: "Set SUPABASE_SERVICE_ROLE_KEY to create users from the dashboard." };
    const input = createSchema.parse(values);

    const { data: created, error } = await service.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: input.full_name ? { full_name: input.full_name } : undefined,
    });

    let userId = created.user?.id;
    if (error) {
      // An existing account: promote it instead.
      const { data: existing } = await service.from("profiles").select("id").eq("email", input.email).maybeSingle();
      if (!existing) return failure(error);
      userId = String((existing as { id: string }).id);
    }
    if (!userId) return { ok: false, message: "User could not be created." };

    const { error: profileError } = await service
      .from("profiles")
      .upsert(
        { id: userId, email: input.email, full_name: input.full_name || null, role: "admin" },
        { onConflict: "id" },
      );
    if (profileError) return failure(profileError);

    refresh();
    return { ok: true, message: error ? "Existing user promoted to admin." : "Admin user created." };
  } catch (error) {
    return failure(error);
  }
}

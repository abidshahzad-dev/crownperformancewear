import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { createSessionClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export type AdminContext = { user: User; profile: Profile; supabase: SupabaseClient };

/**
 * Reads the signed-in user and their profile. Returns null when signed out or not an admin.
 * Deduplicated per request with React `cache`.
 */
export const getAdminContext = cache(async (): Promise<AdminContext | null> => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || (profile as Profile).role !== "admin") return null;
  return { user, profile: profile as Profile, supabase };
});

/** For admin pages: redirects to the login page when the visitor is not an admin. */
export async function requireAdmin(): Promise<AdminContext> {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login");
  return ctx;
}

export class UnauthorizedError extends Error {
  constructor() {
    super("You must be signed in as an admin to do that.");
  }
}

/** For server actions and route handlers: throws instead of redirecting. */
export async function requireAdminAction(): Promise<AdminContext> {
  const ctx = await getAdminContext();
  if (!ctx) throw new UnauthorizedError();
  return ctx;
}

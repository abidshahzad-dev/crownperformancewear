import "server-only";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { supabaseAnonKey, supabaseUrl } from "@/lib/env";

/**
 * Request-scoped client that acts as the signed-in user. Admin reads and writes go through this client,
 * so the database's row level security (is_admin()) is enforced on every query.
 */
export async function createSessionClient(): Promise<SupabaseClient> {
  const url = supabaseUrl();
  const key = supabaseAnonKey();
  if (!url || !key) throw new Error("Supabase is not configured.");
  // Wait for a real request: Supabase validates the session against the current time, which Next.js does
  // not allow inside the cookie-aware prerenders it makes for instant navigations.
  await connection();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Called from a Server Component, where cookies are read-only. The proxy refreshes sessions.
        }
      },
    },
  });
}

import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client: bypasses RLS, can create/delete auth users directly.
 * Server-only — never import this from a Client Component or expose the key
 * to the browser. Used for admin-driven user creation (no self-signup path).
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

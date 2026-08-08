import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Admin client using the service_role key — BYPASSES Row-Level-Security.
 * Server-only. Never import this file from a Client Component, and never
 * expose SUPABASE_SERVICE_ROLE_KEY to the browser. Use this only for
 * trusted server-side operations (e.g. the AI processing pipeline writing
 * generated topics/subtopics/quizzes back to the database).
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

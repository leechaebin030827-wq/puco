import { createClient as createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Returns the current authenticated admin user, or null.
 * Checks both session validity AND admin_users table membership.
 */
export async function getAdminUser() {
  const supabase = await createServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  // Double-check against admin_users table via is_admin() RPC
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) return null;

  return user;
}

/**
 * Requires admin user. Redirects to /login if not authenticated or not admin.
 */
export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Returns the current authenticated user (non-admin).
 */
export async function getUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

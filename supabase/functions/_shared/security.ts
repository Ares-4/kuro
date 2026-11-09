// Shared auth / validation helpers for Kuro edge functions.
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

let _admin: SupabaseClient | null = null;
export const serviceClient = (): SupabaseClient => {
  if (!_admin) {
    _admin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
  }
  return _admin;
};

const bearer = (req: Request) => (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();

/** True when the call comes from another trusted server function using the service-role key. */
export const isServiceCall = (req: Request) => {
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const token = bearer(req);
  return key.length > 0 && token.length === key.length && token === key;
};

/** The signed-in Supabase user behind the request, or null (anon key / no token). */
export const getCaller = async (req: Request) => {
  const token = bearer(req);
  if (!token) return null;
  const { data, error } = await serviceClient().auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
};

export const isAdminUser = async (userId: string | undefined | null) => {
  if (!userId) return false;
  const { data } = await serviceClient().from("admins").select("user_id").eq("user_id", userId).maybeSingle();
  return !!data;
};

/** Admin user or trusted server-to-server call. */
export const isPrivileged = async (req: Request) => {
  if (isServiceCall(req)) return true;
  const user = await getCaller(req);
  return isAdminUser(user?.id);
};

export const escapeHtml = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const isEmail = (v: unknown): v is string =>
  typeof v === "string" && v.length <= 254 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

const ALLOWED_ORIGINS = [
  "https://kuroeduconsultancy.com",
  "https://www.kuroeduconsultancy.com",
  "http://localhost:3000",
  "http://localhost:5173",
];

/** Only allow redirects back to our own site (prevents open redirects via Stripe). */
export const isAllowedRedirect = (url: unknown) => {
  if (typeof url !== "string") return false;
  try {
    const u = new URL(url.replace("{CHECKOUT_SESSION_ID}", "x"));
    return ALLOWED_ORIGINS.includes(u.origin);
  } catch {
    return false;
  }
};

/** Count recent email_logs rows for a recipient (simple abuse throttle). */
export const recentEmailCount = async (recipient: string, minutes = 60) => {
  const since = new Date(Date.now() - minutes * 60_000).toISOString();
  const { count } = await serviceClient()
    .from("email_logs")
    .select("id", { count: "exact", head: true })
    .eq("recipient", recipient)
    .gte("created_at", since);
  return count ?? 0;
};

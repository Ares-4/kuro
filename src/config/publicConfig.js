// Public, browser-safe configuration. Every value here is shipped to every
// visitor's browser anyway (Supabase anon key is gated by RLS; VAPID key is
// the public half). Env vars override, but the site must never break just
// because a hosting project is missing them.
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://akrbfwmqhnbopqlvawhw.supabase.co';

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrcmJmd21xaG5ib3BxbHZhd2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MjgwMzksImV4cCI6MjA4MTIwNDAzOX0.-rJYbnfNV-0vwCqKpFcCQKUG3sskZZgDCi7zsWuTPk8';

export const VAPID_PUBLIC_KEY =
  import.meta.env.VITE_VAPID_PUBLIC_KEY ||
  'BOKhMdTEypRqBYtH3PYoHuEUY8FcE3BmVA-Kn7gcpnBotk4ft5h10ZwsDIGScWFJvYvcg_NjITN4uepqIKmWITs';

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/config/publicConfig';

// On the live site, database reads (PostgREST, /rest/v1) go through our own
// domain (/sbapi/rest/v1, a Vercel rewrite to Supabase). Googlebot does not
// reliably fetch cross-origin API calls while rendering, so pages fell back to
// "Article not found" and were flagged as soft 404s. Auth, realtime, storage
// and edge functions still talk to Supabase directly.
const PROXY_HOSTS = new Set(['kuroeduconsultancy.com', 'www.kuroeduconsultancy.com']);
const REST_PREFIX = `${SUPABASE_URL}/rest/v1/`;

const proxiedFetch = (input, init) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input?.url;
  if (
    typeof window !== 'undefined'
    && PROXY_HOSTS.has(window.location.hostname)
    && typeof url === 'string'
    && url.startsWith(REST_PREFIX)
  ) {
    const proxied = `${window.location.origin}/sbapi/rest/v1/${url.slice(REST_PREFIX.length)}`;
    // Safety net: if the proxy is down or misrouted (network error, 5xx, or the
    // SPA's HTML instead of JSON), retry the same request directly.
    return fetch(input instanceof Request ? new Request(proxied, input.clone()) : proxied, init)
      .then((res) => {
        const html = (res.headers.get('content-type') || '').includes('text/html');
        return res.status >= 500 || html ? fetch(input, init) : res;
      })
      .catch(() => fetch(input, init));
  }
  return fetch(input, init);
};

const customSupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: { fetch: proxiedFetch },
});

export default customSupabaseClient;

export {
    customSupabaseClient,
    customSupabaseClient as supabase,
};

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { isPrivileged } from '../_shared/security.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const get = (html: string, pattern: RegExp): string => {
  const m = html.match(pattern);
  return m ? decodeHtmlEntities(m[1].trim()) : '';
};

const decodeHtmlEntities = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');

const stripTags = (s: string) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const extractTitle = (html: string): string =>
  get(html, /property="og:title"\s+content="([^"]+)"/i) ||
  get(html, /content="([^"]+)"\s+property="og:title"/i) ||
  get(html, /<title[^>]*>([^<]+)<\/title>/i) ||
  get(html, /<h1[^>]*>([^<]+)<\/h1>/i);

const extractDescription = (html: string): string =>
  get(html, /property="og:description"\s+content="([^"]+)"/i) ||
  get(html, /content="([^"]+)"\s+property="og:description"/i) ||
  get(html, /name="description"\s+content="([^"]+)"/i) ||
  get(html, /content="([^"]+)"\s+name="description"/i);

const extractProvider = (html: string): string =>
  get(html, /property="og:site_name"\s+content="([^"]+)"/i) ||
  get(html, /content="([^"]+)"\s+property="og:site_name"/i);

const extractDeadline = (text: string): string => {
  const patterns = [
    /(?:deadline|apply\s+by|closes?\s+(?:on)?|due\s+(?:date)?|applications?\s+(?:close|due))[\s:–-]*(\d{1,2}[\s/.-]\w+[\s/.-]\d{2,4})/i,
    /(?:deadline|apply\s+by|closes?\s+(?:on)?|due\s+(?:date)?)[\s:–-]*(\w+\s+\d{1,2},?\s+\d{4})/i,
    /(?:deadline|apply\s+by|closes?\s+(?:on)?)[\s:–-]*(\d{4}-\d{2}-\d{2})/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const parsed = new Date(m[1]);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().slice(0, 10);
      }
    }
  }
  return '';
};

const extractAmount = (text: string): string => {
  const patterns = [
    /(?:fully\s+funded|full\s+(?:tuition|scholarship))/i,
    /(?:stipend|award|grant|funding|scholarship\s+value)[^€$£\d]*([€$£]\s*[\d,]+(?:\s*\/\s*(?:month|year|annum))?)/i,
    /([€$£]\s*[\d,]+(?:\s*[-–]\s*[€$£]?\s*[\d,]+)?(?:\s*\/\s*(?:month|year|annum|semester))?)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1] || m[0];
  }
  return '';
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    // Security (2026-11-09): admin-only, and no fetching of internal/private hosts (SSRF)
    if (!(await isPrivileged(req))) {
      return new Response(JSON.stringify({ error: 'Admin only' }), { status: 403, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }
    const { url } = await req.json();
    let host = '';
    try { const u = new URL(url); host = u.hostname.toLowerCase(); if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new Error(); } catch { host = ''; }
    const privateHost = !host || host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')
      || /^(127\.|10\.|192\.168\.|169\.254\.|0\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host) || host.includes(':') || host.endsWith('.supabase.co');
    if (privateHost) {
      return new Response(JSON.stringify({ error: 'URL not allowed' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }
    if (!url || !url.startsWith('http')) {
      return new Response(JSON.stringify({ error: 'Invalid URL' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; KuroBot/1.0)' },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

    const html = await res.text();
    const text = stripTags(html).toLowerCase();
    const textRaw = stripTags(html);

    const title       = extractTitle(html);
    const description = extractDescription(html);
    const provider    = extractProvider(html);
    const deadline    = extractDeadline(textRaw);
    const amount      = extractAmount(textRaw);

    return new Response(
      JSON.stringify({ title, description, provider, deadline, amount }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  }
});

#!/usr/bin/env node
// Tells IndexNow search engines (Bing, Yandex, Seznam, Naver...) about every URL
// in the sitemap, so new and updated pages are crawled quickly. Runs at the end
// of the build, only for Vercel production deploys. Never fails the build.
// The key file public/<KEY>.txt proves we own the site.
import fs from 'fs';
import path from 'path';

const KEY = 'c1403993c49b51a088edcfba0133077a';
const HOST = 'kuroeduconsultancy.com';

if (process.env.VERCEL_ENV !== 'production') {
  console.log('indexnow: skipped (not a production deploy)');
  process.exit(0);
}

try {
  const sitemap = fs.readFileSync(path.join(process.cwd(), 'dist', 'sitemap.xml'), 'utf8');
  const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => u.startsWith(`https://${HOST}`));
  if (!urlList.length) throw new Error('no URLs in sitemap');
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
    signal: AbortSignal.timeout(15000),
  });
  console.log(`indexnow: submitted ${urlList.length} URLs -> HTTP ${res.status}`);
} catch (err) {
  console.warn(`indexnow: not submitted (${err.message})`);
}

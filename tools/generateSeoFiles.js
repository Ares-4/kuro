#!/usr/bin/env node
// Writes dist/sitemap.xml and dist/robots.txt from the same route list the
// prerender script uses, so they always agree on what's public.
import fs from 'fs';
import path from 'path';
import { getRoutes, EXCLUDED_PREFIXES, SITE_ORIGIN } from './seoRoutes.js';

const DIST_DIR = path.join(process.cwd(), 'dist');

function escapeXml(value) {
  return value.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
}

function buildSitemap(routes) {
  const urls = routes.map(({ path: routePath, lastmod }) => {
    const loc = escapeXml(`${SITE_ORIGIN}${routePath}`);
    const lastmodTag = lastmod ? `\n    <lastmod>${new Date(lastmod).toISOString().slice(0, 10)}</lastmod>` : '';
    return `  <url>\n    <loc>${loc}</loc>${lastmodTag}\n  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function buildRobotsTxt() {
  const disallowLines = EXCLUDED_PREFIXES.map((prefix) => `Disallow: ${prefix}`).join('\n');
  return `User-agent: *\nAllow: /\n${disallowLines}\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`;
}

async function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error('dist/ not found — run vite build first.');
    process.exit(1);
  }

  const routes = await getRoutes();
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), buildSitemap(routes), 'utf8');
  fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), buildRobotsTxt(), 'utf8');
  console.log(`wrote sitemap.xml (${routes.length} urls) and robots.txt`);
}

main();

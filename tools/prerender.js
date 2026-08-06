#!/usr/bin/env node
// Snapshots each real route from the already-built CSR app into a static
// dist/<route>/index.html. Vercel serves these directly for exact-path
// matches, falling back to the existing SPA rewrite for everything else —
// no vercel.json change needed. A route that fails to prerender is skipped,
// not fatal: it just keeps behaving like a normal client-rendered page.
import fs from 'fs';
import path from 'path';
import http from 'http';
import handler from 'serve-handler';
import { chromium } from 'playwright-core';
import { getRoutes } from './seoRoutes.js';

// Vercel's build container has no system Chromium libs (libnspr4.so etc.),
// so a normal Playwright-downloaded browser fails to launch there — swap in
// @sparticuz/chromium's statically-linked, serverless-safe binary when
// actually building on Vercel. Locally, just use the dev machine's own
// installed Chrome — nothing to download, nothing to keep in sync.
async function launchBrowser() {
  if (process.env.VERCEL) {
    const sparticuzChromium = (await import('@sparticuz/chromium')).default;
    return chromium.launch({
      executablePath: await sparticuzChromium.executablePath(),
      args: sparticuzChromium.args,
      headless: true,
    });
  }
  return chromium.launch({ channel: 'chrome' });
}

const DIST_DIR = path.join(process.cwd(), 'dist');
const PORT = 4321;
const CONCURRENCY = 5;

function startServer() {
  return new Promise((resolve) => {
    const serveOptions = {
      public: DIST_DIR,
      cleanUrls: true,
      // Mirrors vercel.json's catch-all rewrite: unknown deep paths (every
      // route this script is about to create) must fall back to the SPA
      // shell, or serve-handler 404s them before the app ever gets to render.
      rewrites: [{ source: '**', destination: '/index.html' }],
    };
    const server = http.createServer((req, res) => handler(req, res, serveOptions));
    server.listen(PORT, () => resolve(server));
  });
}

async function prerenderRoute(browser, route, attempt = 1) {
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await page.goto(`http://localhost:${PORT}${route.path}`, { waitUntil: 'networkidle', timeout: 30000 });
    const html = await page.content();

    const outDir = route.path === '/' ? DIST_DIR : path.join(DIST_DIR, route.path);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
    console.log(`prerendered ${route.path}`);
  } catch (error) {
    await context.close().catch(() => {});
    if (attempt < 2) return prerenderRoute(browser, route, attempt + 1);
    console.warn(`skipped ${route.path}: ${error.message}`);
    return;
  }
  await context.close().catch(() => {});
}

async function runPool(items, size, worker) {
  let cursor = 0;
  async function next() {
    if (cursor >= items.length) return;
    const item = items[cursor++];
    await worker(item);
    await next();
  }
  await Promise.all(Array.from({ length: size }, next));
}

async function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error('dist/ not found — run vite build first.');
    process.exit(1);
  }

  const routes = await getRoutes();
  console.log(`prerendering ${routes.length} routes...`);

  const server = await startServer();
  const browser = await launchBrowser();

  try {
    await runPool(routes, CONCURRENCY, (route) => prerenderRoute(browser, route));
  } finally {
    await browser.close();
    server.close();
  }
}

main();

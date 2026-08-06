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
// sparticuz/chromium's single-process build disconnected on nearly every
// route on Vercel even at concurrency 3 (fine locally with a normal system
// Chrome). Worse: each disconnect had multiple in-flight workers race to
// relaunch a replacement browser, and only the last one ever got saved to
// browserHolder — the others leaked as orphaned Chromium processes that
// piled up over 100+ routes and hung the build. Serial execution removes
// the race entirely (only one route in flight, so only one relaunch ever
// happens at a time) at the cost of some wall-clock time, which is cheap
// against Vercel's 45-minute cap.
const CONCURRENCY = 1;

// The real cause of the build timing out: third-party scripts (chat widget,
// reviews widget, analytics, Stripe) never stop chattering, so `networkidle`
// almost never fires and most routes hit the 30s timeout. None of that adds
// anything to a crawler snapshot — block it. Images/fonts are blocked too;
// only the DOM/meta-tags end up in the saved HTML, pixels don't matter here.
const BLOCKED_HOSTS = [
  'tawk.to', 'trustpilot.com', 'googletagmanager.com', 'google-analytics.com',
  'js.stripe.com', 'unsplash.com',
];
const BLOCKED_RESOURCE_TYPES = new Set(['image', 'media', 'font']);

async function blockNonEssentialRequests(context) {
  await context.route('**/*', (route) => {
    const request = route.request();
    const url = request.url();
    if (url.includes('/_vercel/speed-insights/')) return route.abort();
    if (BLOCKED_RESOURCE_TYPES.has(request.resourceType())) return route.abort();
    if (BLOCKED_HOSTS.some((host) => url.includes(host))) return route.abort();
    return route.continue();
  });
}

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

// browserHolder is a mutable { current } box, not a raw browser reference —
// if the browser process itself dies mid-run (as sparticuz's chromium did
// under concurrency on Vercel's build container), we relaunch it in place
// so the rest of the routes still get prerendered instead of the one crash
// taking down the whole build (and, before this fix, the whole process:
// newContext() used to be called outside the try/catch here).
async function prerenderRoute(browserHolder, route, attempt = 1) {
  let context;
  try {
    context = await browserHolder.current.newContext();
    await blockNonEssentialRequests(context);
    const page = await context.newPage();
    await page.goto(`http://localhost:${PORT}${route.path}`, { waitUntil: 'networkidle', timeout: 15000 });
    const html = await page.content();

    const outDir = route.path === '/' ? DIST_DIR : path.join(DIST_DIR, route.path);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
    console.log(`prerendered ${route.path}`);
  } catch (error) {
    if (context) await context.close().catch(() => {});
    if (!browserHolder.current.isConnected()) {
      console.warn(`browser disconnected, relaunching (was processing ${route.path})`);
      browserHolder.current = await launchBrowser();
      browserHolder.all.push(browserHolder.current);
    }
    if (attempt < 2) return prerenderRoute(browserHolder, route, attempt + 1);
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
  const firstBrowser = await launchBrowser();
  const browserHolder = { current: firstBrowser, all: [firstBrowser] };

  try {
    await runPool(routes, CONCURRENCY, (route) => prerenderRoute(browserHolder, route));
  } finally {
    // Every browser this run ever launched, not just the current one — a
    // relaunch replaces browserHolder.current but the previous instance
    // still needs closing explicitly.
    await Promise.all(browserHolder.all.map((b) => b.close().catch(() => {})));
    server.closeAllConnections?.();
    server.close();
  }
}

main();

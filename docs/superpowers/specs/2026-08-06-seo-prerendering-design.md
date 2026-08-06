# SEO traffic engine — Phase 1: prerendering + sitemap + robots.txt

## Context
Goal: drive significant organic search traffic via programmatic SEO. This is phased:
1. **Prerendering infrastructure + sitemap/robots.txt** (this doc)
2. Scholarship detail pages
3. University detail pages
4. Long-tail combo pages (country × field/program)

Phase 1 is foundational — phases 2-4 add routes to prerender, they don't need new infrastructure.

## Problem
This app is a 100% client-rendered Vite SPA (`vercel.json` rewrites every path to `/index.html`; React Router + Supabase-in-`useEffect` does the rest). There is currently no `sitemap.xml`, no `robots.txt`, and pages like `BlogDetailPage` are invisible to any crawler that doesn't execute JS. Rewriting the app's data-fetching to a build-time-loader/SSG framework (e.g. vite-react-ssg) would touch every page component — too large a lift for the payoff.

## Approach
A post-build script that treats the already-working CSR app as a black box:
1. Run the normal `vite build` (unchanged).
2. Serve the resulting `dist/` locally.
3. Launch headless Chromium (Playwright), visit every real route, wait for it to finish loading (network-idle), and save the fully-rendered DOM as `dist/<route>/index.html`.
4. Vercel serves these static files directly for exact-path matches — the existing SPA-fallback rewrite in `vercel.json` only applies to routes without a prerendered file, so no `vercel.json` change is needed.

Because the snapshot is taken from a fully-loaded page, the original `<script>`/`<link>` tags are still present in the captured HTML, so the page still hydrates into a normal interactive SPA for real visitors — this only changes what a crawler sees on first load.

`react-helmet` already updates the real `<head>` client-side (used on `CourseDetailPage`, `BlogDetailPage`, `DynamicPage`, etc. via the existing `SEO.jsx` component), so per-page `<title>`/meta/JSON-LD are captured automatically — no changes needed there either.

## Route list
Built at build time by querying Supabase (same anon client used everywhere else):
- Static: `/`, `/about`, `/destinations`, `/services`, `/process`, `/why-kuro`, `/faqs`, `/eligibility`, `/readiness-check`, `/resources`, `/contact`, `/scholarships`, `/deadlines`, `/privacy-policy`, `/terms-of-service`.
- Dynamic: `/destinations/:country` for every active row in `destinations`; `/courses/:id` for every active row in `programs`; `/blog/:slug` for every published row in `blog_posts`; `/page/:slug` for every published row in `dynamic_pages`.

The route-list builder is a small exported function so phases 2-4 can extend it (add scholarships/universities/combo routes) without touching the prerender/sitemap/robots mechanics.

Excluded (not prerendered, not in sitemap, disallowed in robots.txt): `/admin*`, `/dashboard*`, `/login`, `/signup`, `/forgot-password`, `/admin-login`, `/payment-success` — private or non-indexable app areas.

## Failure handling
If a single route times out or errors during prerendering, log a warning and skip it — the build still succeeds, and that one route just falls back to normal client-side rendering via the existing catch-all rewrite (no regression, just no prerender boost for that page). A handful of concurrent browser tabs (not one browser per page) keeps this fast as the route count grows in later phases.

## Sitemap + robots.txt
Generated from the same route list in the same build step:
- `dist/sitemap.xml` — every included route, absolute URLs under `https://kuroeduconsultancy.com`, `<lastmod>` from `updated_at`/`created_at` where the source table has it.
- `public/robots.txt` (static, copied by Vite as-is) — `Allow: /`, explicit `Disallow` for the private paths above, `Sitemap: https://kuroeduconsultancy.com/sitemap.xml`.

## Out of scope for this phase
- Scholarship/university/combo page content (phases 2-4).
- Redirecting the `*.vercel.app` alias to the custom domain (worth doing separately to avoid duplicate-content signals across two hosts, but unrelated to prerendering).
- Submitting the sitemap to Google Search Console (manual, one-time, on you once this ships).

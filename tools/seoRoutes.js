// Shared route list for the prerender + sitemap.xml + robots.txt build steps.
// Extending later phases (scholarship/university/combo pages) means adding a
// query here — the prerender/sitemap scripts don't need to change.
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://akrbfwmqhnbopqlvawhw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrcmJmd21xaG5ib3BxbHZhd2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MjgwMzksImV4cCI6MjA4MTIwNDAzOX0.-rJYbnfNV-0vwCqKpFcCQKUG3sskZZgDCi7zsWuTPk8';

export const SITE_ORIGIN = 'https://kuroeduconsultancy.com';

export const STATIC_ROUTES = [
  '/', '/about', '/destinations', '/services', '/process', '/why-kuro',
  '/faqs', '/eligibility', '/readiness-check', '/resources', '/contact',
  '/scholarships', '/deadlines', '/privacy-policy', '/terms-of-service',
];

// Not prerendered, not in the sitemap, disallowed in robots.txt.
export const EXCLUDED_PREFIXES = [
  '/admin', '/dashboard', '/login', '/signup', '/forgot-password',
  '/admin-login', '/payment-success',
];

export async function getRoutes() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const routes = STATIC_ROUTES.map((path) => ({ path, lastmod: null }));

  const [destinations, programs, blogPosts, dynamicPages] = await Promise.all([
    supabase.from('destinations').select('slug, created_at').eq('is_active', true),
    supabase.from('programs').select('id, updated_at').eq('is_active', true),
    supabase.from('blog_posts').select('slug, updated_at').eq('status', 'published'),
    supabase.from('dynamic_pages').select('slug, updated_at').eq('is_published', true),
  ]);

  for (const row of destinations.data || []) {
    routes.push({ path: `/destinations/${row.slug}`, lastmod: row.created_at });
  }
  for (const row of programs.data || []) {
    routes.push({ path: `/courses/${row.id}`, lastmod: row.updated_at });
  }
  for (const row of blogPosts.data || []) {
    routes.push({ path: `/blog/${row.slug}`, lastmod: row.updated_at });
  }
  for (const row of dynamicPages.data || []) {
    routes.push({ path: `/page/${row.slug}`, lastmod: row.updated_at });
  }

  return routes;
}

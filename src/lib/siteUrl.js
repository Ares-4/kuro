// Public site address. Never build canonical / og:url from window.location:
// pages are prerendered on http://localhost:4321, and that origin would be
// baked into the static HTML Google reads.
export const SITE_URL = 'https://kuroeduconsultancy.com';

/** Canonical URL for a path: fixed host, no query string or hash, no trailing slash (matches sitemap.xml). */
export const canonicalUrl = (pathname = '/') => {
  const clean = (pathname || '/').split(/[?#]/)[0].replace(/\/+$/, '');
  return `${SITE_URL}${clean || '/'}`;
};

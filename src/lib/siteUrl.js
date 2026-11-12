// Public site address. Never build canonical / og:url from window.location:
// pages are prerendered on http://localhost:4321, and that origin would be
// baked into the static HTML Google reads.
export const SITE_URL = 'https://kuroeduconsultancy.com';

/** Default social share image (1200x630, built by tools/brand/build-images.mjs). */
export const DEFAULT_SHARE_IMAGE = `${SITE_URL}/og-image.png`;

/** Canonical URL for a path: fixed host, no query string or hash, no trailing slash (matches sitemap.xml). */
export const canonicalUrl = (pathname = '/') => {
  const clean = (pathname || '/').split(/[?#]/)[0].replace(/\/+$/, '');
  return `${SITE_URL}${clean || '/'}`;
};

// schema.org JSON-LD builders. Pass the result to <SEO schema={...}> (an object
// or an array of objects). The organisation itself is declared once in
// index.html under ORG_ID; everything else references it by @id.
import { SITE_URL, canonicalUrl } from '@/lib/siteUrl';

export const ORG_ID = `${SITE_URL}/#organization`;
const ORG_REF = { '@id': ORG_ID };

/** BreadcrumbList from [name, path] pairs, starting after Home (added automatically). */
export const breadcrumbs = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [['Home', '/'], ...items].map(([name, path], i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name,
    item: canonicalUrl(path),
  })),
});

export const blogPosting = (post, path) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: post.title,
  ...(post.excerpt ? { description: post.excerpt } : {}),
  ...(post.featured_image ? { image: [post.featured_image] } : {}),
  datePublished: post.published_at || post.created_at,
  dateModified: post.updated_at || post.published_at || post.created_at,
  author: { '@type': 'Organization', ...ORG_REF, name: 'Kuro Educational Consultancy', url: SITE_URL },
  publisher: ORG_REF,
  mainEntityOfPage: canonicalUrl(path),
  ...(post.categories?.length ? { articleSection: post.categories[0] } : {}),
  ...(post.tags?.length ? { keywords: post.tags.join(', ') } : {}),
});

export const collegeOrUniversity = (u, path) => ({
  '@context': 'https://schema.org',
  '@type': 'CollegeOrUniversity',
  name: u.name,
  url: u.website || canonicalUrl(path),
  ...(u.description ? { description: u.description.slice(0, 300) } : {}),
  ...(u.image_url ? { image: u.image_url } : {}),
  ...(u.destinations?.name ? { address: { '@type': 'PostalAddress', addressCountry: u.destinations.name } } : {}),
});

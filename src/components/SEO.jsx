import React from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import { canonicalUrl, DEFAULT_SHARE_IMAGE } from '@/lib/siteUrl';

const SEO = ({ title, description, image, url, schema }) => {
  const siteTitle = "Kuro Education Consultancy";
  const fullTitle = !title ? siteTitle : title.includes(siteTitle) ? title : `${title} | ${siteTitle}`;
  const metaDescription = description || "Expert admissions, visa, and relocation support for students from Africa to EU, Australia, USA, Canada, UK and beyond.";
  const metaImage = image || DEFAULT_SHARE_IMAGE;
  const { pathname } = useLocation();
  const metaUrl = url || canonicalUrl(pathname);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={metaUrl} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={metaUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
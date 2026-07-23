import React from 'react';
import { Helmet } from 'react-helmet';

const SEO = ({ title, description, image, url, schema }) => {
  const siteTitle = "Kuro Education Consultancy";
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const metaDescription = description || "Expert admissions, visa, and relocation support for students from Africa to EU, Australia, USA, Canada, UK and beyond.";
  const metaImage = image || "https://horizons-cdn.hostinger.com/004129ab-b5e0-4c13-bfb3-42b2e547cc84/17af830489377c0bbddafc566e44e4f2.png";
  const metaUrl = url || window.location.href;

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
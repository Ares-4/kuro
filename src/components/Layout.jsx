import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { canonicalUrl, DEFAULT_SHARE_IMAGE } from '@/lib/siteUrl';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import PromoBanners from './layout/PromoBanners';
import FlightPaths from './FlightPaths';
import WhatsAppButton, { WhatsAppProvider } from './WhatsAppButton';

const Layout = () => {
  const { pathname } = useLocation();
  const canonical = canonicalUrl(pathname);
  return (
    <WhatsAppProvider>
    <div className="flex flex-col min-h-dvh relative" style={{ background: 'var(--ink)' }}>
      {/* Default canonical/og:url for every public page; pages using <SEO> set the same value. */}
      <Helmet>
        <link rel="canonical" href={canonical} />
        <meta property="og:url" content={canonical} />
        {/* Default share preview; pages with their own image (SEO image prop) override it. */}
        <meta property="og:image" content={DEFAULT_SHARE_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Kuro Educational Consultancy: study in Europe from Southern Africa" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={DEFAULT_SHARE_IMAGE} />
      </Helmet>
      {/* Aurora — fixed behind all public pages */}
      <div className="aurora" aria-hidden="true">
        <div className="aurora-blob one" />
        <div className="aurora-blob two" />
        <div className="aurora-blob three" />
      </div>
      <div className="grid-overlay" aria-hidden="true" />
      <FlightPaths />

      <Navbar />

      <div className="pt-20 relative z-10">
        <PromoBanners />
      </div>

      <main className="flex-grow relative z-10">
        <Outlet />
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
    </WhatsAppProvider>
  );
};

export default Layout;

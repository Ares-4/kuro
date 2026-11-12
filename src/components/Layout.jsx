import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { canonicalUrl } from '@/lib/siteUrl';
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

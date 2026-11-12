import React from 'react';
import { useLocation } from 'react-router-dom';
import PromoBanner from '@/components/PromoBanner';

const PromoBanners = () => {
  const { pathname } = useLocation();
  // The homepage has its own readiness-check calls to action; the banner there
  // pushed the hero headline halfway down the screen on phones.
  const isHome = pathname === '/';
  return (
    // empty:hidden: no blank band above the page when no banner is showing
    <div className="container mx-auto px-4 py-8 space-y-8 empty:hidden">
      {/* Readiness Check Banner */}
      {!isHome && <PromoBanner variant="readiness" />}

      {/* Guide Download Banner */}
      <PromoBanner variant="guide" />
    </div>
  );
};

export default PromoBanners;

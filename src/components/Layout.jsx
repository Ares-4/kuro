import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';

// IMPORTANT:
// Create this component (or tell me what your existing banner component is called)
// It will read promo_banners from site_settings and decide what to show based on pathname.
import PromoBanners from './layout/PromoBanners';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-50">
      <Navbar />

      {/* Promo banners must live OUTSIDE page routes so they work globally */}
      <div className="pt-20">
        <PromoBanners />
      </div>

      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
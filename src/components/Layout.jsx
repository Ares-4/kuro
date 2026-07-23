import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import PromoBanners from './layout/PromoBanners';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-dvh relative" style={{ background: 'var(--ink)' }}>
      {/* Aurora — fixed behind all public pages */}
      <div className="aurora" aria-hidden="true">
        <div className="aurora-blob one" />
        <div className="aurora-blob two" />
        <div className="aurora-blob three" />
      </div>
      <div className="grid-overlay" aria-hidden="true" />

      <Navbar />

      <div className="pt-20 relative z-10">
        <PromoBanners />
      </div>

      <main className="flex-grow relative z-10">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Layout;

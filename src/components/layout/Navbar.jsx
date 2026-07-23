import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, GraduationCap, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { usePublicSiteSettings } from '@/contexts/PublicSiteSettingsContext';
import GlobalSearch from '@/components/GlobalSearch';

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Destinations', path: '/destinations' },
  { label: 'Services', path: '/services' },
  { label: 'Process', path: '/process' },
  { label: 'Why Kuro', path: '/why-kuro' },
  { label: 'FAQs', path: '/faqs' },
  { label: 'Contact', path: '/contact' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const location = useLocation();
  const { user } = useAuth();
  const { identity, systemSettings, loading } = usePublicSiteSettings();

  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      setScrolled(scrollTop > 20);
      setScrollProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const companyName = identity?.site_name || systemSettings?.portal_branding?.company_name || 'KURO EDU';
  const logoUrl = identity?.logo_url || systemSettings?.portal_branding?.logo_url || '';

  if (loading) {
    return <div className="fixed w-full z-50 h-16 md:h-18 bg-[hsl(224_42%_5%)]" />;
  }

  return (
    <>
      {/* Scroll progress */}
      <div
        className="fixed top-0 left-0 h-[2px] bg-primary z-[60] transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[hsl(224_42%_5%)]/95 backdrop-blur-md border-b border-border/60 shadow-[0_1px_20px_rgba(0,0,0,0.4)]'
          : 'bg-transparent border-b border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 z-50 group">
              {logoUrl ? (
                <img src={logoUrl} alt={companyName} className="h-8 w-auto md:h-9 object-contain" />
              ) : (
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                  <GraduationCap className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
              )}
              <div className="flex flex-col leading-none">
                <span className="text-base md:text-lg font-bold text-white tracking-tight">{companyName}</span>
                <span className="hidden sm:block text-[9px] text-primary/70 font-semibold tracking-[0.18em] uppercase">Consultancy</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden xl:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-3.5 py-2 text-sm font-medium transition-colors rounded-md group ${
                    isActive(item.path)
                      ? 'text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                  {isActive(item.path) && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-primary rounded-full"
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop actions */}
            <div className="hidden xl:flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                aria-label="Search"
              >
                <Search className="w-4.5 h-4.5" />
              </button>
              {user ? (
                <Button size="sm" variant="glow" asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button size="sm" variant="ghost" asChild>
                    <Link to="/login">Sign in</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to="/signup">Get started</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile actions */}
            <div className="xl:hidden flex items-center gap-2">
              <button onClick={() => setIsSearchOpen(true)} className="p-2 text-slate-400 hover:text-white rounded-md transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-slate-400 hover:text-white rounded-md transition-colors"
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={isOpen ? 'close' : 'open'}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </motion.div>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="xl:hidden bg-[hsl(224_36%_7%)] border-b border-border/60 shadow-xl"
            >
              <div className="px-4 pt-3 pb-5 space-y-1 max-h-[calc(100dvh-4rem)] overflow-y-auto">
                {NAV_ITEMS.map((item, i) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.2 }}
                  >
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.path)
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                <div className="pt-3 mt-3 border-t border-border/60 flex flex-col gap-2">
                  {user ? (
                    <Button asChild className="w-full">
                      <Link to="/dashboard">Dashboard</Link>
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" asChild className="w-full">
                        <Link to="/login">Sign in</Link>
                      </Button>
                      <Button asChild className="w-full">
                        <Link to="/signup">Get started</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;

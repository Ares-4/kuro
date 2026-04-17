import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap, Search, Phone } from 'lucide-react';
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
  { label: 'Contact', path: '/contact' }
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { identity, systemSettings, loading } = usePublicSiteSettings();

  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  const portalBranding = systemSettings?.portal_branding || {};
  const companyName = identity?.site_name || portalBranding?.company_name || 'KURO EDU';
  const logoUrl = identity?.logo_url || portalBranding?.logo_url || '';

  if (loading) {
     return <div className="fixed w-full z-50 bg-slate-900/95 h-20 border-b border-slate-800" />;
  }

  return (
    <>
      <nav className="fixed w-full z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center gap-2 md:gap-3 z-50">
              {logoUrl ? (
                <img src={logoUrl} alt={companyName} className="h-8 w-auto md:h-10 object-contain" />
              ) : (
                <GraduationCap className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              )}
              <div className="flex flex-col">
                <span className="text-lg md:text-xl font-bold text-white tracking-tight">{companyName}</span>
                <span className="hidden sm:inline-block text-[10px] text-blue-400 font-medium tracking-wider">CONSULTANCY</span>
              </div>
            </Link>

            <div className="hidden xl:flex items-center gap-6">
              <div className="flex items-baseline gap-5">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`text-sm font-medium transition-colors hover:text-blue-400 ${
                      isActive(item.path) ? 'text-primary' : 'text-slate-300'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-3">
                 <button onClick={() => setIsSearchOpen(true)} className="text-slate-300 hover:text-white p-2">
                   <Search className="w-5 h-5" />
                 </button>
                 {user ? (
                  <Link to="/dashboard">
                    <Button className="bg-primary hover:bg-primary/90">Dashboard</Button>
                  </Link>
                ) : (
                  <Link to="/login">
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">Login</Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="xl:hidden flex items-center gap-4">
              <button onClick={() => setIsSearchOpen(true)} className="text-slate-300">
                <Search className="w-5 h-5" />
              </button>
              <button onClick={() => setIsOpen(!isOpen)} className="text-slate-300">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`xl:hidden fixed inset-x-0 top-[64px] bg-slate-900 border-b border-slate-800 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 py-6 space-y-4 max-h-[calc(100vh-64px)] overflow-y-auto">
            <nav className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-3 rounded-xl text-base font-medium ${
                    isActive(item.path) ? 'bg-blue-900/20 text-blue-400' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="pt-4 border-t border-slate-800">
               {user ? (
                <Link to="/dashboard"><Button className="w-full bg-primary">Dashboard</Button></Link>
              ) : (
                <Link to="/login"><Button className="w-full bg-primary">Login</Button></Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;
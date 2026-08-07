import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, MapPin, GraduationCap } from 'lucide-react';
import SEO from '@/components/SEO';

const QUICK_LINKS = [
  { to: '/destinations', label: 'Destinations', icon: MapPin },
  { to: '/scholarships', label: 'Scholarships', icon: GraduationCap },
  { to: '/universities', label: 'Universities', icon: Compass },
];

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6 py-24">
      <SEO
        title="Page Not Found"
        description="The page you're looking for doesn't exist or has moved."
      />
      <meta name="robots" content="noindex" />

      <div className="max-w-md w-full text-center">
        <p className="text-7xl font-bold text-blue-500/80 mb-2">404</p>
        <h1 className="text-2xl font-semibold text-white mb-3">Page not found</h1>
        <p className="text-slate-400 mb-8">
          That page doesn't exist or moved. Check the address, or jump back to somewhere useful.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 transition-colors"
        >
          <Home className="w-4 h-4" />
          Back to home
        </Link>

        <div className="mt-10 pt-8 border-t border-slate-800">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-4">Or try one of these</p>
          <div className="flex flex-wrap justify-center gap-3">
            {QUICK_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-300 text-sm px-3.5 py-2 transition-colors"
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

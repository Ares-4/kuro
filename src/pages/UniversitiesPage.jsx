import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import SEO from '@/components/SEO';
import { Building2, MapPin, Star, Loader2, Search } from 'lucide-react';
import UniversityMark from '@/components/UniversityMark';

const UniversitiesPage = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('All');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('universities')
      .select('*, destinations(name, slug)')
      .eq('is_active', true)
      .order('name');
    setUniversities(data || []);
    setLoading(false);
  };

  const countries = ['All', ...new Set(universities.map(u => u.destinations?.name).filter(Boolean))];

  const filtered = universities.filter(u => {
    if (country !== 'All' && u.destinations?.name !== country) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <SEO title="Universities" description="Browse partner universities and institutions across our study-abroad destinations." />
      <div className="text-slate-50">
        <div className="relative border-b border-white/5 pt-28 pb-12 px-4">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(37,99,235,0.18), transparent 65%)' }} />
          <div style={{ width: 'var(--container-narrow)', marginInline: 'auto', padding: '0 1rem' }} className="text-center relative z-10">
            <span className="eyebrow">Partner institutions</span>
            <h1 className="font-display font-bold text-white mt-4 mb-4"
              style={{ fontSize: 'var(--fs-4xl)', letterSpacing: '-0.03em', lineHeight: 1.04 }}>
              Find your <span style={{ color: 'var(--blue-400)' }}>university</span>
            </h1>
            <p className="text-slate-300 max-w-2xl mx-auto" style={{ fontSize: 'var(--fs-lg)' }}>
              Explore universities Kuro works with across Europe and beyond.
            </p>
          </div>
        </div>

        <div className="sticky top-0 z-10 backdrop-blur border-b border-white/5 py-3 px-4" style={{ background: 'rgba(5,6,10,0.92)' }}>
          <div style={{ width: 'var(--container)', marginInline: 'auto' }} className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                className="pl-8 pr-3 h-8 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-600 w-40" />
            </div>
            <div className="flex gap-1 flex-wrap">
              {countries.map(c => (
                <button key={c} onClick={() => setCountry(c)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${country === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ width: 'var(--container)', marginInline: 'auto', padding: '2.5rem 1rem' }}>
          {loading && <div className="text-center py-20"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-500" /></div>}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-20 text-slate-500">
              <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No universities match your filters.</p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(u => (
              <Link key={u.id} to={`/universities/${u.id}`}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 transition-colors flex flex-col gap-3">
                <UniversityMark name={u.name} imageUrl={u.image_url} className="aspect-video rounded-xl" />
                <h3 className="font-semibold text-white text-sm leading-snug">{u.name}</h3>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  {u.destinations?.name && (
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {u.destinations.name}</span>
                  )}
                  {u.ranking && (
                    <span className="flex items-center gap-1 text-amber-400"><Star className="w-3 h-3" /> #{u.ranking}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default UniversitiesPage;

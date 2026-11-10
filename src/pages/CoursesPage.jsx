import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { GraduationCap, MapPin, Clock, Loader2, Search, Wallet } from 'lucide-react';
import SEO from '@/components/SEO';
import { supabase } from '@/lib/customSupabaseClient';
import { formatCurrency, formatDuration } from '@/lib/utils';

// Public list of every active programme, so students (and search engines) can
// reach each /courses/:id page directly. Filters sync to ?country= & ?level=.

const titleCase = (s) => String(s || '').toLowerCase().replace(/\b\p{L}/gu, (c) => c.toUpperCase());
const shortUni = (s) => String(s || '').split(' (')[0];
const feeLabel = (p) => {
  const raw = String(p.tuition_fee ?? '').trim();
  if (!raw || raw === '-') return 'See course page';
  return formatCurrency(raw, p.currency || 'EUR');
};

const CoursesPage = () => {
  const [params, setParams] = useSearchParams();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const country = params.get('country') || 'All';
  const level = params.get('level') || 'All';

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('programs')
      .select('id, program_name, university, country, degree_level, duration, tuition_fee, currency, language')
      .eq('is_active', true)
      .order('program_name')
      .then(({ data }) => {
        if (cancelled) return;
        setPrograms(data || []);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === 'All') next.delete(key); else next.set(key, value);
    setParams(next, { replace: true });
  };

  const countries = useMemo(() => ['All', ...new Set(programs.map((p) => titleCase(p.country)).filter(Boolean))].sort((a, b) => (a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b))), [programs]);
  const levels = useMemo(() => ['All', ...new Set(programs.map((p) => p.degree_level).filter(Boolean))], [programs]);

  const q = search.trim().toLowerCase();
  const filtered = programs.filter((p) => {
    if (country !== 'All' && titleCase(p.country) !== country) return false;
    if (level !== 'All' && p.degree_level !== level) return false;
    if (q && !`${p.program_name} ${p.university}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const chip = (active) => `text-xs px-2.5 py-1 rounded-full border transition-colors ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'}`;

  return (
    <>
      <SEO
        title="Courses"
        description="Browse English-taught bachelor's and master's courses in Poland, Germany, Latvia and more, with tuition fees, duration and entry requirements."
      />
      <div className="text-slate-50">
        <div className="relative border-b border-white/5 pt-28 pb-12 px-4">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(37,99,235,0.18), transparent 65%)' }} />
          <div style={{ width: 'var(--container-narrow)', marginInline: 'auto', padding: '0 1rem' }} className="text-center relative z-10">
            <span className="eyebrow">2027 intake</span>
            <h1 className="font-display font-bold text-white mt-4 mb-4" style={{ fontSize: 'var(--fs-4xl)', letterSpacing: '-0.03em', lineHeight: 1.04 }}>
              Find your <span style={{ color: 'var(--blue-400)' }}>course</span>
            </h1>
            <p className="text-slate-300 max-w-2xl mx-auto" style={{ fontSize: 'var(--fs-lg)' }}>
              {programs.length ? `${programs.length} English-taught programmes` : 'English-taught programmes'} at universities we work with, with fees and entry requirements.
            </p>
          </div>
        </div>

        <div className="sticky top-0 z-10 backdrop-blur border-b border-white/5 py-3 px-4" style={{ background: 'rgba(5,6,10,0.92)' }}>
          <div style={{ width: 'var(--container)', marginInline: 'auto' }} className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses…" aria-label="Search courses"
                className="pl-8 pr-3 h-8 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-600 w-48" />
            </div>
            <div className="flex gap-1 flex-wrap">
              {countries.map((c) => <button key={c} onClick={() => setFilter('country', c)} className={chip(country === c)}>{c}</button>)}
            </div>
            {levels.length > 2 && (
              <div className="flex gap-1 flex-wrap">
                {levels.map((l) => <button key={l} onClick={() => setFilter('level', l)} className={chip(level === l)}>{l === 'All' ? 'All levels' : l}</button>)}
              </div>
            )}
          </div>
        </div>

        <div style={{ width: 'var(--container)', marginInline: 'auto', padding: '2.5rem 1rem' }}>
          {loading && <div className="text-center py-20"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-500" /></div>}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-20 text-slate-500">
              <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No courses match your filters.</p>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <p className="text-xs text-slate-500 mb-4">{filtered.length} course{filtered.length === 1 ? '' : 's'}</p>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <Link key={p.id} to={`/courses/${p.id}`}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 transition-colors flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold text-white text-base leading-snug">{p.program_name}</h2>
                  {p.degree_level && <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-full bg-blue-950/60 text-blue-300 border border-blue-900">{p.degree_level}</span>}
                </div>
                <p className="text-sm text-slate-400">{shortUni(p.university)}</p>
                <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-400">
                  {p.country && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {titleCase(p.country)}</span>}
                  {p.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDuration(p.duration)}</span>}
                  <span className="flex items-center gap-1"><Wallet className="w-3 h-3" /> {feeLabel(p)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default CoursesPage;

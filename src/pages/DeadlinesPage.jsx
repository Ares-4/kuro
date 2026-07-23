import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import SEO from '@/components/SEO';
import { CalendarClock, Pin, PinOff, Loader2, ExternalLink, Bell } from 'lucide-react';
import AddToCalendarButton from '@/components/AddToCalendarButton';

const COUNTRIES = ['All','Poland','UK','Canada','Australia','USA','Germany','Lithuania','Latvia','Hungary','Malta','Cyprus','Austria'];

const TYPE_COLORS = {
  application_deadline: 'text-blue-400 bg-blue-900/20 border-blue-800/40',
  enrollment_deadline: 'text-purple-400 bg-purple-900/20 border-purple-800/40',
  scholarship_deadline: 'text-green-400 bg-green-900/20 border-green-800/40',
  document_deadline: 'text-amber-400 bg-amber-900/20 border-amber-800/40',
  other: 'text-slate-400 bg-slate-800 border-slate-700',
};

const TYPE_LABELS = {
  application_deadline: 'Application',
  enrollment_deadline: 'Enrollment',
  scholarship_deadline: 'Scholarship',
  document_deadline: 'Documents',
  other: 'Other',
};

const CountdownDisplay = ({ date }) => {
  const [diff, setDiff] = useState(null);

  const calc = useCallback(() => {
    const ms = new Date(date) - new Date();
    if (ms <= 0) { setDiff(null); return; }
    const days    = Math.floor(ms / 86400000);
    const hours   = Math.floor((ms % 86400000) / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    setDiff({ days, hours, minutes });
  }, [date]);

  useEffect(() => {
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, [calc]);

  if (!diff) return <span className="text-red-400 text-xs font-medium">Deadline passed</span>;

  return (
    <div className="flex items-center gap-1 text-xs">
      {diff.days > 0 && <><span className="font-bold text-white">{diff.days}</span><span className="text-slate-500">d </span></>}
      <span className="font-bold text-white">{String(diff.hours).padStart(2,'0')}</span><span className="text-slate-500">h </span>
      <span className="font-bold text-white">{String(diff.minutes).padStart(2,'0')}</span><span className="text-slate-500">m</span>
    </div>
  );
};

const DeadlineCard = ({ d, pinned, onPin }) => {
  const days = Math.ceil((new Date(d.deadline_date) - new Date()) / 86400000);
  const urgent = days > 0 && days <= 14;
  const passed = days <= 0;

  return (
    <div className={`rounded-xl border p-4 transition-colors ${passed ? 'opacity-40' : ''} ${urgent ? 'border-amber-700/50 bg-amber-950/10' : 'border-slate-800 bg-slate-900/50'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${TYPE_COLORS[d.type] || TYPE_COLORS.other}`}>
              {TYPE_LABELS[d.type] || d.type}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">{d.country}</span>
            {pinned && <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-900/20 border border-yellow-700/30 text-yellow-400">Pinned</span>}
          </div>
          <h3 className="font-semibold text-white text-sm leading-snug">{d.university_name}</h3>
          {d.program_name && <p className="text-xs text-slate-400 mt-0.5">{d.program_name} · {d.intake_season} {d.intake_year}</p>}
        </div>
        <button onClick={() => onPin(d.id)}
          className={`p-1.5 rounded-lg transition-colors ${pinned ? 'text-yellow-400 hover:text-slate-400' : 'text-slate-600 hover:text-yellow-400'}`}>
          {pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
        <div>
          {!passed ? (
            <CountdownDisplay date={d.deadline_date} />
          ) : (
            <span className="text-xs text-slate-600">
              {new Date(d.deadline_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
          {!passed && (
            <p className="text-[10px] text-slate-600 mt-0.5">
              {new Date(d.deadline_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!passed && (
            <AddToCalendarButton
              title={`Deadline: ${d.university_name}${d.program_name ? ` — ${d.program_name}` : ''}`}
              description={[d.notes, d.country, `${d.intake_season} ${d.intake_year}`].filter(Boolean).join(' · ')}
              date={d.deadline_date}
              url={d.link}
            />
          )}
          {d.link && (
            <a href={d.link} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
              Details <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
      {d.notes && <p className="text-xs text-slate-500 mt-2 leading-relaxed">{d.notes}</p>}
    </div>
  );
};

const DeadlinesPage = () => {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState('All');
  const [pinned, setPinned] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('kuro_pinned_deadlines') || '[]')); }
    catch { return new Set(); }
  });
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  useEffect(() => {
    supabase.from('university_deadlines').select('*').eq('is_active', true)
      .order('deadline_date', { ascending: true, nullsLast: true })
      .then(({ data, error }) => {
        if (error) console.warn('university_deadlines:', error.message);
        setDeadlines(data || []);
        setLoading(false);
      });
  }, []);

  const togglePin = (id) => {
    setPinned(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem('kuro_pinned_deadlines', JSON.stringify([...next]));
      return next;
    });
  };

  const filtered = deadlines.filter(d => {
    if (country !== 'All' && d.country !== country) return false;
    if (showPinnedOnly && !pinned.has(d.id)) return false;
    return true;
  });

  const upcoming = filtered.filter(d => new Date(d.deadline_date) > new Date());
  const past     = filtered.filter(d => new Date(d.deadline_date) <= new Date());

  return (
    <>
      <SEO title="Application deadlines" description="Track university application deadlines with live countdowns. Pin the ones that matter to you." />
      <div className="text-slate-50">

        {/* Hero */}
        <div className="relative border-b border-white/5 pt-28 pb-12 px-4">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(245,158,11,0.12), transparent 65%)' }} />
          <div style={{ width: 'var(--container-narrow)', marginInline: 'auto', padding: '0 1rem' }} className="text-center relative z-10">
            <span className="eyebrow" style={{ color: 'var(--amber-400)' }}>Live countdowns</span>
            <h1 className="font-display font-bold text-white mt-4 mb-4"
              style={{ fontSize: 'var(--fs-4xl)', letterSpacing: '-0.03em', lineHeight: 1.04 }}>
              Application <span style={{ color: 'var(--amber-400)' }}>deadlines</span>
            </h1>
            <p className="text-slate-300 max-w-2xl mx-auto" style={{ fontSize: 'var(--fs-lg)' }}>
              Never miss a deadline. Pin the ones relevant to you — they're saved locally in your browser.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="sticky top-0 z-10 backdrop-blur border-b border-white/5 py-3 px-4"
          style={{ background: 'rgba(5,6,10,0.92)' }}>
          <div style={{ width: 'var(--container)', marginInline: 'auto' }} className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-1 flex-wrap">
              {COUNTRIES.map(c => (
                <button key={c} onClick={() => setCountry(c)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${country === c ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'}`}>
                  {c}
                </button>
              ))}
            </div>
            <button onClick={() => setShowPinnedOnly(v => !v)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${showPinnedOnly ? 'bg-yellow-600 text-white border-yellow-600' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-yellow-600 hover:text-yellow-400'}`}>
              <Pin className="w-3 h-3" /> {showPinnedOnly ? 'All deadlines' : `Pinned (${pinned.size})`}
            </button>
          </div>
        </div>

        <div style={{ width: 'var(--container)', marginInline: 'auto', padding: '2.5rem 1rem' }} className="space-y-10">
          {loading && <div className="text-center py-20"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-500" /></div>}

          {!loading && upcoming.length === 0 && past.length === 0 && (
            <div className="text-center py-20 text-slate-500">
              <CalendarClock className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No deadlines found.</p>
            </div>
          )}

          {upcoming.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" /> Upcoming deadlines
                <span className="text-xs text-slate-500 font-normal ml-1">({upcoming.length})</span>
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {upcoming.map(d => <DeadlineCard key={d.id} d={d} pinned={pinned.has(d.id)} onPin={togglePin} />)}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-500 mb-3">Past deadlines</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {past.map(d => <DeadlineCard key={d.id} d={d} pinned={pinned.has(d.id)} onPin={togglePin} />)}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
};

export default DeadlinesPage;

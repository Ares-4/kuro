import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';
import { GraduationCap, ExternalLink, CalendarDays, Loader2, Bell, BellOff, Search } from 'lucide-react';
import AddToCalendarButton from '@/components/AddToCalendarButton';

const COUNTRIES = ['All','Poland','UK','Canada','Australia','USA','Germany','Lithuania','Latvia','Hungary','Malta','Cyprus','Austria'];
const LEVELS    = ['All','Undergraduate','Masters','PhD','Any level'];

const daysLeft = (date) => {
  if (!date) return null;
  return Math.ceil((new Date(date) - new Date()) / 86400000);
};

const DeadlineBadge = ({ date }) => {
  const days = daysLeft(date);
  if (days === null) return <span className="text-xs text-slate-500">Open deadline</span>;
  if (days <= 0) return <span className="text-xs text-red-400 font-medium">Expired</span>;
  if (days <= 14) return <span className="text-xs text-amber-400 font-medium">{days} days left</span>;
  return <span className="text-xs text-slate-400">{new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>;
};

const ScholarshipCard = ({ s, subscribed, onToggle }) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 transition-colors flex flex-col gap-3">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white text-sm leading-snug">{s.title}</h3>
        <p className="text-xs text-slate-400 mt-0.5">{s.provider}</p>
      </div>
      {s.amount && (
        <span className="shrink-0 text-xs font-bold text-green-400 bg-green-900/20 border border-green-800/40 px-2 py-1 rounded-lg whitespace-nowrap">
          {s.amount}
        </span>
      )}
    </div>

    {s.description && (
      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{s.description}</p>
    )}

    <div className="flex flex-wrap gap-1">
      {(s.countries || []).map(c => (
        <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{c}</span>
      ))}
      {(s.levels || []).map(l => (
        <span key={l} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-400 border border-blue-800">{l}</span>
      ))}
    </div>

    <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-800">
      <div className="flex items-center gap-1.5 text-slate-400">
        <CalendarDays className="w-3.5 h-3.5" />
        <DeadlineBadge date={s.deadline} />
      </div>
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {s.deadline && daysLeft(s.deadline) > 0 && (
          <AddToCalendarButton
            title={`Scholarship deadline: ${s.title}`}
            description={[s.provider, s.description].filter(Boolean).join(' — ')}
            date={s.deadline}
            url={s.link}
          />
        )}
        <button onClick={() => onToggle(s.id)}
          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
            subscribed
              ? 'bg-blue-900/30 border-blue-700 text-blue-400 hover:bg-red-900/20 hover:border-red-700 hover:text-red-400'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-blue-600 hover:text-blue-400'
          }`}>
          {subscribed ? <BellOff className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
          {subscribed ? 'Unsubscribe' : 'Alert me'}
        </button>
        {s.link && (
          <a href={s.link} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-blue-700 bg-blue-900/20 text-blue-400 hover:bg-blue-900/40 transition-colors">
            Apply <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  </div>
);

const ScholarshipsPage = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState('All');
  const [level, setLevel] = useState('All');
  const [search, setSearch] = useState('');
  const [subscriptions, setSubscriptions] = useState(new Set());
  const [user, setUser] = useState(null);
  const [subEmail, setSubEmail] = useState('');
  const [showEmailPrompt, setShowEmailPrompt] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('scholarships').select('*').eq('is_active', true).order('deadline', { ascending: true, nullsLast: true });
    setScholarships(data || []);
    setLoading(false);
  };

  const handleToggle = async (scholarshipId) => {
    if (!user && !subEmail) {
      setShowEmailPrompt(scholarshipId);
      return;
    }
    const email = user?.email || subEmail;
    if (subscriptions.has(scholarshipId)) {
      await supabase.from('scholarship_subscriptions').delete().eq('scholarship_id', scholarshipId).eq('email', email);
      setSubscriptions(prev => { const s = new Set(prev); s.delete(scholarshipId); return s; });
    } else {
      await supabase.from('scholarship_subscriptions').upsert({ scholarship_id: scholarshipId, email, user_id: user?.id || null }, { onConflict: 'scholarship_id,email' });
      setSubscriptions(prev => new Set([...prev, scholarshipId]));
    }
    setShowEmailPrompt(null);
  };

  const filtered = scholarships.filter(s => {
    if (country !== 'All' && !(s.countries || []).includes(country)) return false;
    if (level !== 'All' && !(s.levels || []).includes(level) && !s.levels?.includes('Any level')) return false;
    if (search && !s.title.toLowerCase().includes(search.toLowerCase()) && !s.provider?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <SEO title="Scholarships" description="Browse scholarships and funding opportunities for international students. Filter by country and study level." />
      <div className="text-slate-50">

        {/* Hero */}
        <div className="relative border-b border-white/5 pt-28 pb-12 px-4">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(37,99,235,0.18), transparent 65%)' }} />
          <div style={{ width: 'var(--container-narrow)', marginInline: 'auto', padding: '0 1rem' }} className="text-center relative z-10">
            <span className="eyebrow">Updated regularly</span>
            <h1 className="font-display font-bold text-white mt-4 mb-4"
              style={{ fontSize: 'var(--fs-4xl)', letterSpacing: '-0.03em', lineHeight: 1.04 }}>
              Scholarship <span style={{ color: 'var(--blue-400)' }}>opportunities</span>
            </h1>
            <p className="text-slate-300 max-w-2xl mx-auto" style={{ fontSize: 'var(--fs-lg)' }}>
              Funding opportunities for international students. Subscribe to get alerted before deadlines close.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="sticky top-0 z-10 backdrop-blur border-b border-white/5 py-3 px-4"
          style={{ background: 'rgba(5,6,10,0.92)' }}>
          <div style={{ width: 'var(--container)', marginInline: 'auto' }} className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                className="pl-8 pr-3 h-8 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-600 w-40" />
            </div>
            <div className="flex gap-1 flex-wrap">
              {COUNTRIES.map(c => (
                <button key={c} onClick={() => setCountry(c)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${country === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'}`}>
                  {c}
                </button>
              ))}
            </div>
            <div className="flex gap-1 flex-wrap">
              {LEVELS.map(l => (
                <button key={l} onClick={() => setLevel(l)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${level === l ? 'bg-purple-700 text-white border-purple-700' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ width: 'var(--container)', marginInline: 'auto', padding: '2.5rem 1rem' }}>
          {loading && <div className="text-center py-20"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-500" /></div>}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-20 text-slate-500">
              <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No scholarships match your filters.</p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(s => (
              <ScholarshipCard key={s.id} s={s} subscribed={subscriptions.has(s.id)} onToggle={handleToggle} />
            ))}
          </div>

          {/* Email prompt modal */}
          {showEmailPrompt && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm space-y-4">
                <h3 className="font-bold text-white">Get scholarship alerts</h3>
                <p className="text-sm text-slate-400">Enter your email to be notified when this scholarship deadline approaches.</p>
                <input value={subEmail} onChange={e => setSubEmail(e.target.value)} type="email" placeholder="your@email.com"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-600" />
                <div className="flex gap-2">
                  <Button onClick={() => handleToggle(showEmailPrompt)} disabled={!subEmail} className="flex-1 bg-blue-600 hover:bg-blue-700">Subscribe</Button>
                  <Button variant="ghost" onClick={() => setShowEmailPrompt(null)} className="text-slate-400">Cancel</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ScholarshipsPage;

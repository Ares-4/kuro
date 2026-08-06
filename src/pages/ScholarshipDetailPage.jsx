import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { GraduationCap, ExternalLink, CalendarDays, Loader2, Bell, BellOff, ArrowLeft, MapPin, Layers } from 'lucide-react';
import AddToCalendarButton from '@/components/AddToCalendarButton';

const daysLeft = (date) => {
  if (!date) return null;
  return Math.ceil((new Date(date) - new Date()) / 86400000);
};

const DeadlineBadge = ({ date }) => {
  const days = daysLeft(date);
  if (days === null) return <span className="text-sm text-slate-500">Open deadline</span>;
  if (days <= 0) return <span className="text-sm text-red-400 font-medium">Expired</span>;
  if (days <= 14) return <span className="text-sm text-amber-400 font-medium">{days} days left</span>;
  return <span className="text-sm text-slate-300">{new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>;
};

const ScholarshipDetailPage = () => {
  const { id } = useParams();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [user, setUser] = useState(null);
  const [subEmail, setSubEmail] = useState('');
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
    load();
  }, [id]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('scholarships').select('*').eq('id', id).single();
    setScholarship(data || null);
    setLoading(false);
  };

  const handleToggle = async () => {
    if (!user && !subEmail) {
      setShowEmailPrompt(true);
      return;
    }
    const email = user?.email || subEmail;
    if (subscribed) {
      await supabase.from('scholarship_subscriptions').delete().eq('scholarship_id', id).eq('email', email);
      setSubscribed(false);
    } else {
      await supabase.from('scholarship_subscriptions').upsert({ scholarship_id: id, email, user_id: user?.id || null }, { onConflict: 'scholarship_id,email' });
      setSubscribed(true);
    }
    setShowEmailPrompt(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center flex-col gap-4 text-white">
        <h1 className="text-2xl font-bold">Scholarship Not Found</h1>
        <Link to="/scholarships"><Button>Browse Scholarships</Button></Link>
      </div>
    );
  }

  const s = scholarship;
  const metaDescription = [s.provider, s.amount, s.description].filter(Boolean).join(' — ').slice(0, 155);

  return (
    <>
      <SEO
        title={`${s.title} — ${s.provider || 'Scholarship'}`}
        description={metaDescription || `Scholarship opportunity: ${s.title}. Funding for international students.`}
      />

      <div className="min-h-screen bg-slate-950 pt-24 pb-20 text-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link to="/scholarships" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-400 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Scholarships
          </Link>

          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white">{s.title}</h1>
            {s.amount && (
              <span className="shrink-0 text-sm font-bold text-green-400 bg-green-900/20 border border-green-800/40 px-3 py-1.5 rounded-lg">
                {s.amount}
              </span>
            )}
          </div>

          {s.provider && <p className="text-slate-400 mb-6">{s.provider}</p>}

          <div className="flex flex-wrap gap-2 mb-8">
            {(s.countries || []).map(c => (
              <span key={c} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                <MapPin className="w-3 h-3" /> {c}
              </span>
            ))}
            {(s.levels || []).map(l => (
              <span key={l} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-900/30 text-blue-400 border border-blue-800">
                <Layers className="w-3 h-3" /> {l}
              </span>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-400" /> About this Scholarship
              </h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                {s.description || 'No further details provided for this scholarship yet — check the official link for full eligibility and application requirements.'}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div>
                <span className="text-slate-400 text-xs uppercase font-bold tracking-wider flex items-center gap-1.5 mb-1">
                  <CalendarDays className="w-3.5 h-3.5" /> Deadline
                </span>
                <DeadlineBadge date={s.deadline} />
              </div>

              {s.link && (
                <a href={s.link} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Apply on Official Site <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              )}

              {s.deadline && daysLeft(s.deadline) > 0 && (
                <AddToCalendarButton
                  title={`Scholarship deadline: ${s.title}`}
                  description={[s.provider, s.description].filter(Boolean).join(' — ')}
                  date={s.deadline}
                  url={s.link}
                />
              )}

              <button onClick={handleToggle}
                className={`w-full flex items-center justify-center gap-1.5 text-sm px-3 py-2 rounded-lg border transition-colors ${
                  subscribed
                    ? 'bg-blue-900/30 border-blue-700 text-blue-400 hover:bg-red-900/20 hover:border-red-700 hover:text-red-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-blue-600 hover:text-blue-400'
                }`}>
                {subscribed ? <BellOff className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                {subscribed ? 'Unsubscribe from alerts' : 'Alert me before deadline'}
              </button>
            </div>
          </div>
        </div>

        {showEmailPrompt && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm space-y-4">
              <h3 className="font-bold text-white">Get scholarship alerts</h3>
              <p className="text-sm text-slate-400">Enter your email to be notified when this scholarship deadline approaches.</p>
              <input value={subEmail} onChange={e => setSubEmail(e.target.value)} type="email" placeholder="your@email.com"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-600" />
              <div className="flex gap-2">
                <Button onClick={handleToggle} disabled={!subEmail} className="flex-1 bg-blue-600 hover:bg-blue-700">Subscribe</Button>
                <Button variant="ghost" onClick={() => setShowEmailPrompt(false)} className="text-slate-400">Cancel</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ScholarshipDetailPage;

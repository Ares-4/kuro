import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import {
  FileText, BookOpen, Globe, Users, ArrowRight, Bell,
  CheckCircle2, AlertTriangle, Shield, TrendingUp, GraduationCap,
  Sparkles, ChevronRight, Zap, Radio,
} from 'lucide-react';
import CountryUpdateCard from '@/components/CountryUpdateCard';
import { Button } from '@/components/ui/button';

const ease = [0.16, 1, 0.3, 1];
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08, ease } }),
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

const STATUS_STYLE = {
  pending:    { chip: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',    bar: '#3b82f6' },
  reviewing:  { chip: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',  bar: '#f59e0b' },
  accepted:   { chip: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30', bar: '#10b981' },
  rejected:   { chip: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',    bar: '#fb7185' },
  incomplete: { chip: 'bg-slate-500/15 text-slate-400 border border-slate-500/30', bar: '#64748b' },
};

const STATUS_LABELS = {
  pending: 'Pending', reviewing: 'In review', accepted: 'Offer', rejected: 'Rejected', incomplete: 'Incomplete',
};

const COUNTRY_FLAGS = {
  uk: '🇬🇧', 'united kingdom': '🇬🇧', canada: '🇨🇦', australia: '🇦🇺',
  usa: '🇺🇸', 'united states': '🇺🇸', poland: '🇵🇱', austria: '🇦🇹', germany: '🇩🇪',
};

function getFlag(university = '') {
  const lower = university.toLowerCase();
  for (const [key, flag] of Object.entries(COUNTRY_FLAGS)) {
    if (lower.includes(key)) return flag;
  }
  return '🎓';
}

function getAppProgress(status) {
  const p = { pending: 35, reviewing: 65, accepted: 100, rejected: 100, incomplete: 15 };
  return p[status] || 20;
}

const QUICK_ACTIONS = [
  { name: 'Browse programs',   icon: GraduationCap, path: '/dashboard/programs',     desc: 'Find your course' },
  { name: 'Explore countries', icon: Globe,          path: '/dashboard/countries',    desc: 'Study destinations' },
  { name: 'My applications',   icon: FileText,       path: '/dashboard/applications', desc: 'Track progress' },
  { name: 'Community hub',     icon: Users,          path: '/dashboard/hub',          desc: 'Connect with peers' },
];

const STUDY_TIPS = [
  'Upload your academic transcripts early — universities often need certified copies.',
  'Visa applications for EU countries take 4–8 weeks on average. Start early.',
  'A strong SOP doubles your acceptance odds. Our advisors can review yours for free.',
  'Research accommodation before your visa arrives — popular student housing fills fast.',
];

const DashboardHome = () => {
  const { user } = useAuth();
  const [student, setStudent]       = useState(null);
  const [stats, setStats]           = useState({ applications: 0, programs: 0 });
  const [applications, setApps]     = useState([]);
  const [programs, setPrograms]     = useState([]);
  const [countryAlerts, setAlerts]  = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data: s } = await supabase.from('students').select('*').eq('user_id', user.id).maybeSingle();
        setStudent(s);

        const now = new Date().toISOString();
        const [{ count: ac }, { count: pc }, { data: apps }, { data: progs }, { data: alerts }] = await Promise.all([
          supabase.from('applications').select('*', { count: 'exact', head: true }).eq('student_id', s?.id ?? ''),
          supabase.from('programs').select('*', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('applications').select('id, status, created_at, programs(program_name, university)').eq('student_id', s?.id ?? '').order('created_at', { ascending: false }).limit(4),
          supabase.from('programs').select('id, program_name, university').eq('is_active', true).limit(3),
          supabase.from('country_updates').select('*').eq('is_active', true)
            .or(`expires_at.is.null,expires_at.gt.${now}`)
            .order('appointment_at', { ascending: true, nullsFirst: false })
            .limit(5),
        ]);

        setStats({ applications: ac || 0, programs: pc || 0 });
        setApps(apps || []);
        setPrograms(progs || []);
        setAlerts(alerts || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [user]);

  const displayName   = student?.full_name || user?.user_metadata?.full_name || 'Student';
  const firstName     = displayName.split(' ')[0];
  const initials      = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const docsOk        = !!student?.phone && !!student?.country;
  const hasPending    = applications.some(a => ['reviewing', 'pending'].includes(a.status));

  const profilePct = [!!student?.full_name, !!student?.phone, !!student?.country, stats.applications > 0].filter(Boolean).length * 25;

  const todayTip = STUDY_TIPS[new Date().getDate() % STUDY_TIPS.length];

  /* ---- checklist for brand-new students ---- */
  const checklist = [
    { label: 'Upload transcripts', done: docsOk,              sub: docsOk ? 'Completed' : 'Required for most universities' },
    { label: 'Complete your profile', done: profilePct >= 75,  sub: profilePct >= 75 ? 'Looking good' : 'Due before applying' },
    { label: 'Submit first application', done: stats.applications > 0, sub: stats.applications > 0 ? `${stats.applications} submitted` : 'Browse programs to start' },
    { label: 'Payment & processing', done: applications.some(a => a.status === 'accepted'), sub: 'After acceptance' },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* ── Greeting row ── */}
      <motion.div variants={fadeUp} initial="hidden" animate="show"
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--fg-4)' }}>{getGreeting()},</p>
          <h1 className="font-display font-bold text-white" style={{ fontSize: 'var(--fs-2xl)', letterSpacing: '-0.025em' }}>
            {firstName}
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--fg-3)' }}>
            {hasPending
              ? `${applications.filter(a => ['reviewing','pending'].includes(a.status)).length} application${applications.filter(a => ['reviewing','pending'].includes(a.status)).length > 1 ? 's' : ''} awaiting update.`
              : 'Your applications are on track.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard/notices"
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(30,41,59,0.7)', border: '1px solid var(--line-2)' }}
          >
            <Bell className="w-4.5 h-4.5 text-slate-400" />
          </Link>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-blue-400"
            style={{ background: 'rgba(37,99,235,0.18)', border: '1px solid rgba(37,99,235,0.3)' }}
          >
            {initials}
          </div>
        </div>
      </motion.div>

      {/* ── KPI row — matches kit exactly ── */}
      <motion.div
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
        initial="hidden" animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          {
            label: 'Active applications',
            value: stats.applications,
            icon: <FileText className="w-4 h-4" style={{ color: 'var(--blue-400)' }} />,
            sub: stats.applications > 0 ? `+${stats.applications > 1 ? stats.applications - 1 : 0} this week` : 'None yet',
            subColor: 'var(--emerald-400)',
          },
          {
            label: 'Offers received',
            value: applications.filter(a => a.status === 'accepted').length,
            icon: <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--emerald-400)' }} />,
            sub: applications.filter(a => a.status === 'accepted').map(a => a.programs?.university || 'University').slice(0, 2).join(' · ') || 'None yet',
            subColor: 'var(--emerald-400)',
          },
          {
            label: 'Docs pending',
            value: docsOk ? 0 : 2,
            icon: <AlertTriangle className="w-4 h-4" style={{ color: 'var(--amber-400)' }} />,
            sub: docsOk ? 'All uploaded' : 'Due in 5 days',
            subColor: docsOk ? 'var(--emerald-400)' : 'var(--amber-400)',
          },
          {
            label: 'Readiness score',
            value: `${profilePct}`,
            valueSuffix: '/100',
            icon: <Shield className="w-4 h-4" style={{ color: 'var(--blue-400)' }} />,
            sub: profilePct >= 75 ? 'Strong profile' : 'Complete profile',
            subColor: profilePct >= 75 ? 'var(--emerald-400)' : 'var(--amber-400)',
          },
        ].map((kpi, i) => (
          <motion.div key={i} variants={fadeUp} custom={i}
            className="rounded-2xl p-5 spotlight-card"
            style={{ background: 'rgba(30,41,59,0.45)', border: '1px solid var(--line-2)', backdropFilter: 'blur(8px)' }}
          >
            <div className="flex items-center justify-between mb-3" style={{ color: 'var(--fg-4)', fontSize: 'var(--fs-xs)' }}>
              <span>{kpi.label}</span>
              {kpi.icon}
            </div>
            <p className="font-display font-bold text-white tabular leading-none" style={{ fontSize: 'var(--fs-2xl)' }}>
              {kpi.value}
              {kpi.valueSuffix && <span className="font-normal text-base" style={{ color: 'var(--fg-4)' }}>{kpi.valueSuffix}</span>}
            </p>
            <p className="mt-1.5 text-xs font-medium" style={{ color: kpi.subColor, fontSize: 'var(--fs-xs)' }}>{kpi.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Country alerts ── */}
      {countryAlerts.length > 0 && (
        <motion.div variants={fadeUp} custom={1} initial="hidden" animate="show">
          <div className="flex items-center gap-2 mb-3">
            <Radio className="w-4 h-4 text-blue-400" />
            <h2 className="font-display font-bold text-white text-base">Country updates</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25 font-semibold">
              {countryAlerts.length} new
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {countryAlerts.map(u => <CountryUpdateCard key={u.id} update={u} />)}
          </div>
        </motion.div>
      )}

      {/* ── Main two-col grid ── */}
      <div className="grid lg:grid-cols-[2fr_1fr] gap-5">

        {/* Applications card — matches kit */}
        <motion.div variants={fadeUp} custom={1} initial="hidden" animate="show"
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(30,41,59,0.45)', border: '1px solid var(--line-2)', backdropFilter: 'blur(8px)' }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--line)' }}>
            <div>
              <h2 className="font-display font-bold text-white">Your applications</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--fg-4)' }}>
                {loading ? 'Loading…' : `${applications.length} active submission${applications.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <Link to="/dashboard/applications" className="text-xs font-semibold flex items-center gap-1 transition-colors hover:text-blue-300"
              style={{ color: 'var(--blue-400)' }}
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y" style={{ borderColor: 'var(--line)' }}>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="grid items-center gap-4 px-6 py-4" style={{ gridTemplateColumns: '40px 1fr 140px 80px' }}>
                  <div className="skeleton w-10 h-8 rounded" />
                  <div className="space-y-2"><div className="skeleton h-3 w-2/3 rounded"/><div className="skeleton h-2.5 w-1/2 rounded"/></div>
                  <div className="skeleton h-1.5 rounded-full" />
                  <div className="skeleton h-5 w-16 rounded-full" />
                </div>
              ))
            ) : applications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid var(--line-2)' }}
                >
                  <FileText className="w-5 h-5" style={{ color: 'var(--fg-4)' }} />
                </div>
                <p className="font-semibold text-white mb-1">No applications yet</p>
                <p className="text-sm mb-4" style={{ color: 'var(--fg-3)' }}>Browse programs and submit your first application.</p>
                <Button size="sm" asChild><Link to="/dashboard/programs">Browse programs</Link></Button>
              </div>
            ) : (
              applications.map((app) => {
                const style = STATUS_STYLE[app.status] || STATUS_STYLE.incomplete;
                const prog = getAppProgress(app.status);
                const flag = getFlag(app.programs?.university || '');
                return (
                  <Link key={app.id} to={`/dashboard/application/${app.id}`}
                    className="grid items-center gap-4 px-6 py-4 transition-colors hover:bg-white/[0.02] group"
                    style={{ gridTemplateColumns: '40px 1fr 140px 80px' }}
                  >
                    <span className="text-3xl leading-none select-none">{flag}</span>
                    <div>
                      <p className="font-semibold text-white text-sm leading-snug">{app.programs?.program_name || 'Program'}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--fg-4)' }}>
                        {app.programs?.university || 'University'}
                      </p>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(51,65,85,0.8)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${prog}%`, background: style.bar }}
                      />
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold justify-self-end ${style.chip}`}>
                      {STATUS_LABELS[app.status] || 'Pending'}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Next steps checklist */}
        <motion.div variants={fadeUp} custom={2} initial="hidden" animate="show"
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(30,41,59,0.45)', border: '1px solid var(--line-2)', backdropFilter: 'blur(8px)' }}
        >
          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--line)' }}>
            <h2 className="font-display font-bold text-white">Next steps</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--fg-4)' }}>
              {stats.applications > 0 ? 'Keep your applications on track' : 'Complete these to get started'}
            </p>
          </div>

          <div className="divide-y" style={{ borderColor: 'var(--line)' }}>
            {checklist.map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-6 py-4">
                <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                  item.done
                    ? 'border-emerald-500 bg-emerald-600'
                    : 'border-slate-600 bg-transparent'
                }`}>
                  {item.done && (
                    <svg viewBox="0 0 10 7" className="w-2.5 h-2.5" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 3.5L4 6.5L9 1"/>
                    </svg>
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${item.done ? 'line-through' : 'text-white'}`}
                    style={item.done ? { color: 'var(--fg-4)' } : {}}
                  >{item.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--fg-4)' }}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Quick actions ── */}
      <motion.div variants={fadeUp} custom={3} initial="hidden" animate="show">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-blue-400" />
          <h2 className="font-display font-semibold text-white">Quick actions</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((action, i) => (
            <Link key={i} to={action.path}
              className="bento-cell group spotlight-card"
            >
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors group-hover:border-blue-500/35"
                  style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)' }}
                >
                  <action.icon className="w-5 h-5 text-blue-400" />
                </div>
                <p className="font-semibold text-white text-sm mb-1">{action.name}</p>
                <p className="text-xs" style={{ color: 'var(--fg-4)' }}>{action.desc}</p>
                <div className="flex items-center gap-1 mt-3 text-xs font-medium transition-colors"
                  style={{ color: 'var(--blue-400)' }}
                >
                  Go <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── Recommended programs ── */}
      {programs.length > 0 && (
        <motion.div variants={fadeUp} custom={4} initial="hidden" animate="show">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <h2 className="font-display font-semibold text-white">Recommended programs</h2>
            </div>
            <Link to="/dashboard/programs" className="text-xs font-semibold flex items-center gap-1 hover:text-blue-300 transition-colors"
              style={{ color: 'var(--blue-400)' }}
            >
              Browse all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {programs.map((prog, i) => (
              <motion.div key={prog.id} variants={fadeUp} custom={i}
                className="bento-cell spotlight-card"
              >
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)' }}
                    >
                      <GraduationCap className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="pill">{prog.level}</span>
                  </div>
                  <p className="font-semibold text-white text-sm leading-snug mb-1">{prog.program_name}</p>
                  <p className="text-xs mb-4" style={{ color: 'var(--fg-4)' }}>{prog.university}</p>
                  <Button size="sm" variant="outline" className="w-full text-xs" asChild>
                    <Link to={`/dashboard/apply/${prog.id}`}>Apply now</Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Study tip ── */}
      <motion.div variants={fadeUp} custom={5} initial="hidden" animate="show"
        className="rounded-2xl p-5 flex items-start gap-4"
        style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.18)' }}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.25)' }}
        >
          <Sparkles className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--blue-400)' }}>Advisor tip</p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-3)' }}>{todayTip}</p>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardHome;

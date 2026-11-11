import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { m as motion } from 'framer-motion';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Map,
  Plane,
  Save,
  ShieldAlert,
  WalletCards,
} from 'lucide-react';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';

const COUNTRIES = [
  {
    name: 'Poland',
    slug: 'poland',
    intake: 'October 2027',
    deadline: 'March to July 2027',
    currency: 'EUR',
    tuitionLow: 2200,
    tuitionHigh: 4500,
    monthlyLivingLow: 420,
    monthlyLivingHigh: 650,
    proofMonths: 12,
    proof: 'Lower bank proof than most Western routes',
    speed: 'Medium',
    fit: 'Best for value, EU entry, and students who want English-taught degrees with realistic costs.',
  },
  {
    name: 'Canada',
    slug: 'canada',
    intake: 'September 2027',
    deadline: 'January to May 2027',
    currency: 'CAD',
    tuitionLow: 16000,
    tuitionHigh: 28000,
    monthlyLivingLow: 1200,
    monthlyLivingHigh: 1800,
    proofMonths: 12,
    proof: 'High proof of funds; sponsor story must be clean',
    speed: 'Slow',
    fit: 'Best for students with strong finances, clear study progression, and long-term settlement goals.',
  },
  {
    name: 'United Kingdom',
    slug: 'uk',
    intake: 'September 2027',
    deadline: 'January to June 2027',
    currency: 'GBP',
    tuitionLow: 11500,
    tuitionHigh: 18500,
    monthlyLivingLow: 1023,
    monthlyLivingHigh: 1334,
    proofMonths: 9,
    proof: 'Strict 28-day funds rule',
    speed: 'Fast',
    fit: 'Best for fast admissions, one-year masters, and strong English academic profiles.',
  },
  {
    name: 'Australia',
    slug: 'australia',
    intake: 'July 2027',
    deadline: 'November 2026 to March 2027',
    currency: 'AUD',
    tuitionLow: 22000,
    tuitionHigh: 38000,
    monthlyLivingLow: 2000,
    monthlyLivingHigh: 2600,
    proofMonths: 12,
    proof: 'High financial threshold and genuine student test',
    speed: 'Medium',
    fit: 'Best for students with strong sponsors, health cover readiness, and patient visa planning.',
  },
  {
    name: 'Germany',
    slug: 'germany',
    intake: 'October 2027',
    deadline: 'February to July 2027',
    currency: 'EUR',
    // Public universities charge no tuition, only a semester contribution (~EUR 300-400 per semester)
    tuitionLow: 600,
    tuitionHigh: 800,
    // Blocked account: EUR 992/month (EUR 11,904/year) for 2026 — fixed government figure
    monthlyLivingLow: 992,
    monthlyLivingHigh: 992,
    proofMonths: 12,
    proof: 'Blocked account (Sperrkonto) of EUR 11,904 for the year',
    speed: 'Slow',
    fit: 'Best for strong academic profiles who want tuition-free public universities and can fund the blocked account up front.',
  },
  {
    name: 'Hungary',
    slug: 'hungary',
    intake: 'September 2027',
    deadline: 'January to June 2027',
    currency: 'EUR',
    tuitionLow: 2500,
    tuitionHigh: 7000,
    monthlyLivingLow: 450,
    monthlyLivingHigh: 750,
    proofMonths: 12,
    proof: 'Moderate proof of funds; Stipendium Hungaricum covers fees for scholars',
    speed: 'Medium',
    fit: 'Best for students targeting the fully funded Stipendium Hungaricum, or affordable EU degrees in Budapest, Debrecen and Szeged.',
  },
];

// Planner country name -> country label used in the university_deadlines table
const DEADLINE_COUNTRY = { 'United Kingdom': 'UK' };

const safeStorage = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
  },
};

const TIMELINE = [
  { title: 'Profile audit', window: 'Week 1', detail: 'Grades, study gap, budget, English level, passport, and sponsor strength checked first.' },
  { title: 'Shortlist', window: 'Weeks 1-2', detail: 'Three realistic routes: safe, balanced, and ambitious. No random university list.' },
  { title: 'Document build', window: 'Weeks 2-5', detail: 'SOP, CV, references, translations, certificates, and finance notes prepared together.' },
  { title: 'Applications', window: 'Weeks 4-8', detail: 'Submissions tracked by deadline, offer conditions, deposits, and interview requests.' },
  { title: 'Visa file', window: 'After offer', detail: 'Bank proof, sponsor letter, accommodation, insurance, medical checks, and interview prep.' },
  { title: 'Departure', window: 'Final 30 days', detail: 'Flights, arrival checklist, student account setup, packing, and first-week support.' },
];

const DOCS = [
  { id: 'passport', label: 'Valid passport', stage: 'Profile' },
  { id: 'grades', label: 'Academic transcripts', stage: 'Admissions' },
  { id: 'sop', label: 'Statement of purpose', stage: 'Admissions' },
  { id: 'references', label: 'Reference letters', stage: 'Admissions' },
  { id: 'sponsor', label: 'Sponsor letter', stage: 'Visa' },
  { id: 'bank', label: 'Bank statements', stage: 'Visa' },
  { id: 'housing', label: 'Accommodation plan', stage: 'Visa' },
  { id: 'insurance', label: 'Insurance or health cover', stage: 'Departure' },
];

const PACKAGES = [
  {
    name: 'Starter',
    price: 'EUR 19',
    note: 'Readiness report',
    items: ['Profile score', 'Budget check', 'One destination recommendation', 'Risk flags'],
    to: '/readiness-check',
  },
  {
    name: 'Application build',
    price: 'Custom',
    note: 'For students ready to apply',
    items: ['University shortlist', 'SOP and CV support', 'Application tracking', 'Offer follow-up'],
    to: '/contact',
    featured: true,
  },
  {
    name: 'Visa and departure',
    price: 'Custom',
    note: 'After offer stage',
    items: ['Visa file review', 'Sponsor letter guidance', 'Interview prep', 'Arrival checklist'],
    to: '/contact',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] } }),
};

const formatMoney = (currency, value) => `${currency} ${Math.round(value).toLocaleString('en-GB')}`;

const IntakePlannerPage = () => {
  // Restore the last saved plan so "Save plan" actually means something on return visits
  const savedPlan = useMemo(() => safeStorage.get('kuro_level3_plan', null), []);
  const [country, setCountry] = useState(() =>
    COUNTRIES.some(c => c.name === savedPlan?.country) ? savedPlan.country : COUNTRIES[0].name);
  const [studyLevel, setStudyLevel] = useState(savedPlan?.studyLevel || 'masters');
  const [sponsorBudget, setSponsorBudget] = useState(Number(savedPlan?.sponsorBudget) || 9000);
  const [checkedDocs, setCheckedDocs] = useState(() => new Set(safeStorage.get('kuro_level3_docs', [])));
  const [saved, setSaved] = useState(Boolean(savedPlan));
  const [deadlines, setDeadlines] = useState([]);

  const selected = useMemo(() => COUNTRIES.find(item => item.name === country) || COUNTRIES[0], [country]);

  // Live upcoming deadlines for the selected country (managed in Admin -> Deadlines)
  useEffect(() => {
    let cancelled = false;
    const today = new Date().toISOString().slice(0, 10);
    supabase
      .from('university_deadlines')
      .select('id, university_name, program_name, deadline_date, type, intake_season, intake_year, link')
      .eq('is_active', true)
      .ilike('country', DEADLINE_COUNTRY[selected.name] || selected.name)
      .gte('deadline_date', today)
      .order('deadline_date', { ascending: true })
      .limit(4)
      .then(({ data }) => { if (!cancelled) setDeadlines(data || []); });
    return () => { cancelled = true; };
  }, [selected.name]);

  const plan = useMemo(() => {
    const tuitionMid = (selected.tuitionLow + selected.tuitionHigh) / 2;
    const livingMid = ((selected.monthlyLivingLow + selected.monthlyLivingHigh) / 2) * selected.proofMonths;
    const buffer = selected.currency === 'EUR' ? 1200 : selected.currency === 'GBP' ? 1600 : selected.currency === 'CAD' ? 2500 : 3000;
    const firstYear = tuitionMid + livingMid + buffer;
    const readiness = sponsorBudget >= firstYear ? 'Strong' : sponsorBudget >= firstYear * 0.72 ? 'Watch' : 'Risk';
    const docScore = Math.round((checkedDocs.size / DOCS.length) * 100);
    return { tuitionMid, livingMid, buffer, firstYear, readiness, docScore };
  }, [checkedDocs.size, selected, sponsorBudget]);

  useEffect(() => {
    safeStorage.set('kuro_level3_docs', [...checkedDocs]);
  }, [checkedDocs]);

  const toggleDoc = (id) => {
    setCheckedDocs(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setSaved(false);
  };

  const savePlan = () => {
    setSaved(safeStorage.set('kuro_level3_plan', { country, studyLevel, sponsorBudget, docs: [...checkedDocs], savedAt: new Date().toISOString() }));
  };

  return (
    <>
      <SEO
        title="2027 Intake Planner"
        description="Plan your 2027 study abroad intake: country route, budget readiness, document checklist, deadlines, and next-step actions."
      />

      <main className="relative text-slate-50 pt-24">
        <section className="relative overflow-hidden border-b border-white/5 pb-20">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 45% at 50% 0%, rgba(37,99,235,0.20), transparent 70%)' }} />
          <div style={{ width: 'var(--container)', marginInline: 'auto', padding: '0 1rem' }} className="relative z-10 grid lg:grid-cols-[0.9fr_1fr] gap-12 items-center">
            <motion.div initial="hidden" animate="show" className="space-y-7">
              <motion.span variants={fadeUp} className="eyebrow">2027 intake planning</motion.span>
              <motion.h1 variants={fadeUp} custom={1} className="font-display font-bold text-white" style={{ fontSize: 'var(--fs-4xl)', lineHeight: 1.04 }}>
                Build a real study plan before money moves.
              </motion.h1>
              <motion.p variants={fadeUp} custom={2} className="text-slate-300 max-w-2xl leading-relaxed" style={{ fontSize: 'var(--fs-lg)' }}>
                Choose a route, test the budget, mark documents, save the plan, then move into readiness, deadlines, or consultation without losing context.
              </motion.p>
              <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-3">
                <Button size="xl" asChild><Link to="/readiness-check">Start readiness check <ArrowRight className="w-4 h-4" /></Link></Button>
                <Button size="xl" variant="outline" asChild><Link to="/deadlines">View deadlines</Link></Button>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.15 }} className="glass p-6 md:p-7 rounded-3xl">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs text-blue-300 font-semibold tracking-[0.16em] uppercase">Connected route builder</p>
                  <h2 className="text-2xl font-display font-bold text-white mt-1">{selected.name}</h2>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">
                  <Plane className="w-5 h-5 text-blue-300" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
                {COUNTRIES.map(item => (
                  <button
                    key={item.name}
                    onClick={() => { setCountry(item.name); setSaved(false); }}
                    className={`text-left rounded-xl px-3 py-2 text-sm border transition-colors ${country === item.name ? 'bg-blue-500/15 border-blue-400/50 text-white' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'}`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>

              <div className="grid sm:grid-cols-3 gap-3 mb-5">
                {['foundation', 'bachelors', 'masters'].map(level => (
                  <button key={level} onClick={() => { setStudyLevel(level); setSaved(false); }} className={`rounded-xl border px-3 py-2 text-sm capitalize transition-colors ${studyLevel === level ? 'bg-emerald-500/15 border-emerald-400/40 text-white' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white'}`}>
                    {level}
                  </button>
                ))}
              </div>

              <dl className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4"><dt className="text-xs text-slate-500">Main intake</dt><dd className="font-semibold text-white mt-1">{selected.intake}</dd></div>
                <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4"><dt className="text-xs text-slate-500">Apply by</dt><dd className="font-semibold text-white mt-1">{selected.deadline}</dd></div>
                <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4"><dt className="text-xs text-slate-500">Budget readiness</dt><dd className={`font-semibold mt-1 ${plan.readiness === 'Strong' ? 'text-emerald-300' : plan.readiness === 'Watch' ? 'text-amber-300' : 'text-rose-300'}`}>{plan.readiness}</dd></div>
                <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4"><dt className="text-xs text-slate-500">Documents ready</dt><dd className="font-semibold text-white mt-1">{plan.docScore}%</dd></div>
              </dl>
              <div className="mt-4 rounded-xl bg-blue-500/10 border border-blue-400/20 p-4">
                <p className="text-sm text-slate-200 leading-relaxed">{selected.fit}</p>
                <p className="text-xs text-slate-400 mt-2">Funds note: {selected.proof}</p>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-500 flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5" /> Upcoming {selected.name} deadlines</p>
                  <Link to={`/destinations/${selected.slug}`} className="text-xs text-blue-300 hover:text-blue-200">Full {selected.name} guide →</Link>
                </div>
                {deadlines.length > 0 ? (
                  <ul className="space-y-1.5">
                    {deadlines.map(d => (
                      <li key={d.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-950/50 border border-slate-800 px-3 py-2 text-sm">
                        <span className="text-slate-300 truncate">{d.university_name}{d.program_name ? ` · ${d.program_name}` : ''}</span>
                        <span className="text-white font-medium tabular shrink-0">
                          {new Date(`${d.deadline_date}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500">No dated deadlines listed yet. <Link to="/deadlines" className="text-blue-300 hover:text-blue-200">See all deadlines</Link> or ask Kuro for programme dates.</p>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-20 border-b border-white/5">
          <div style={{ width: 'var(--container)', marginInline: 'auto', padding: '0 1rem' }} className="grid xl:grid-cols-[1fr_0.85fr] gap-8 items-start">
            <div className="bento-cell spotlight-card">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <WalletCards className="w-6 h-6 text-blue-300" />
                  <div>
                    <p className="text-xs text-blue-300 font-semibold tracking-[0.16em] uppercase">Budget calculator</p>
                    <h2 className="text-2xl font-display font-bold text-white">First-year funds estimate</h2>
                  </div>
                </div>

                <label className="block text-sm text-slate-400 mb-3">Sponsor budget in {selected.currency}</label>
                <input
                  type="range"
                  min="1000"
                  max={Math.max(50000, selected.tuitionHigh + selected.monthlyLivingHigh * 12 + 6000)}
                  step="500"
                  value={sponsorBudget}
                  onChange={(e) => { setSponsorBudget(Number(e.target.value)); setSaved(false); }}
                  className="w-full accent-blue-500"
                />
                <div className="flex items-center justify-between text-sm mt-3">
                  <span className="text-white font-semibold tabular">{formatMoney(selected.currency, sponsorBudget)}</span>
                  <span className="text-slate-500">Target: {formatMoney(selected.currency, plan.firstYear)}</span>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 mt-6">
                  <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4"><p className="text-xs text-slate-500">Tuition midpoint</p><p className="text-white font-semibold mt-1 tabular">{formatMoney(selected.currency, plan.tuitionMid)}</p></div>
                  <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4"><p className="text-xs text-slate-500">Living proof</p><p className="text-white font-semibold mt-1 tabular">{formatMoney(selected.currency, plan.livingMid)}</p></div>
                  <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4"><p className="text-xs text-slate-500">Buffer</p><p className="text-white font-semibold mt-1 tabular">{formatMoney(selected.currency, plan.buffer)}</p></div>
                </div>
              </div>
            </div>

            <div className="bento-cell spotlight-card">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <ClipboardCheck className="w-6 h-6 text-emerald-300" />
                  <div>
                    <p className="text-xs text-emerald-300 font-semibold tracking-[0.16em] uppercase">Document room</p>
                    <h2 className="text-2xl font-display font-bold text-white">Mark what is ready</h2>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {DOCS.map(doc => (
                    <button key={doc.id} onClick={() => toggleDoc(doc.id)} className={`text-left rounded-xl border p-3 transition-colors ${checkedDocs.has(doc.id) ? 'bg-emerald-500/12 border-emerald-400/35 text-white' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'}`}>
                      <span className="flex items-center gap-2 text-sm font-medium"><CheckCircle2 className={`w-4 h-4 ${checkedDocs.has(doc.id) ? 'text-emerald-300' : 'text-slate-600'}`} />{doc.label}</span>
                      <span className="block text-xs text-slate-500 mt-1 ml-6">{doc.stage}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 border-b border-white/5">
          <div style={{ width: 'var(--container)', marginInline: 'auto', padding: '0 1rem' }} className="grid lg:grid-cols-[0.72fr_1fr] gap-12">
            <div>
              <span className="eyebrow">Application timeline</span>
              <h2 className="font-display font-bold text-white mt-4 mb-4" style={{ fontSize: 'var(--fs-3xl)' }}>From idea to airport</h2>
              <p className="text-slate-400 leading-relaxed max-w-md">Use this as working order. Deadlines change by university, but this sequence keeps file clean.</p>
              <Button onClick={savePlan} className="mt-7" variant={saved ? 'outline' : 'default'}>
                <Save className="w-4 h-4" /> {saved ? 'Plan saved' : 'Save plan locally'}
              </Button>
            </div>
            <div className="space-y-3">
              {TIMELINE.map((item, index) => (
                <motion.div key={item.title} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} custom={index} className="grid sm:grid-cols-[110px_1fr] gap-4 rounded-2xl bg-slate-950/50 border border-slate-800 p-4">
                  <div className="font-mono text-xs text-blue-300 tabular">{item.window}</div>
                  <div>
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed mt-1">{item.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div style={{ width: 'var(--container)', marginInline: 'auto', padding: '0 1rem' }}>
            <div className="max-w-2xl mb-10">
              <span className="eyebrow">Work with Kuro</span>
              <h2 className="font-display font-bold text-white mt-4" style={{ fontSize: 'var(--fs-3xl)' }}>Pick next action</h2>
            </div>
            <div className="grid lg:grid-cols-3 gap-4">
              {PACKAGES.map(pkg => (
                <article key={pkg.name} className={`rounded-2xl border p-6 flex flex-col ${pkg.featured ? 'bg-blue-500/10 border-blue-400/40 shadow-[0_24px_70px_-42px_rgba(59,130,246,0.9)]' : 'bg-slate-950/50 border-slate-800'}`}>
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-xl font-display font-bold text-white">{pkg.name}</h3>
                      <p className="text-sm text-slate-400 mt-1">{pkg.note}</p>
                    </div>
                    <p className="font-display font-bold text-white text-xl">{pkg.price}</p>
                  </div>
                  <ul className="space-y-3 mb-7 flex-1">
                    {pkg.items.map(item => (
                      <li key={item} className="flex gap-3 text-sm text-slate-300"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />{item}</li>
                    ))}
                  </ul>
                  <Button variant={pkg.featured ? 'default' : 'outline'} asChild><Link to={pkg.to}>Continue <ArrowRight className="w-4 h-4" /></Link></Button>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default IntakePlannerPage;

import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight, ShieldCheck, Plane, FileText, CheckCircle2,
  User, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';
import { getCountryImageUrl } from '@/lib/imageUtils';
import { getPageContent } from '@/lib/contentService';
import { DEFAULT_CONTENT } from '@/lib/defaultContent';
import AdUnit from '@/components/AdUnit';
import { ADSENSE_SLOTS } from '@/config/adsenseSlots';
import { supabase } from '@/lib/customSupabaseClient';
import TestimonialsSection from '@/components/TestimonialsSection';
import CredibilityBlock from '@/components/CredibilityBlock';
import CountUp from '@/components/CountUp';
import AdSlot from '@/components/ads/AdSlot';

/* ---- animation helpers ---- */
const ease = [0.16, 1, 0.3, 1];
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease } }),
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };

function Section({ children, className = '', style }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'} className={className} style={style}>
      {children}
    </motion.div>
  );
}

/* ---- static data ---- */
const PROCESS_STEPS = [
  { step: '01', title: 'Check your readiness', desc: 'Instant profile score for €2.99, or an expert report for €19.', icon: ShieldCheck },
  { step: '02', title: 'Apply with us',    desc: 'We handle docs and university submissions.',  icon: FileText },
  { step: '03', title: 'Get your visa',    desc: 'Country-specific strategy, paperwork to approval.', icon: CheckCircle2 },
  { step: '04', title: 'Fly and study',    desc: 'Relocation and settlement support on arrival.', icon: Plane },
];

const SERVICES = [
  { title: 'Admissions guidance', desc: 'Program shortlisting, SOP coaching, deadline tracking.' },
  { title: 'Visa support',        desc: 'Country-specific visa strategy and full document review.' },
  { title: 'Relocation help',     desc: 'Housing, travel, and pre-departure orientation.' },
  { title: 'Concierge',           desc: 'Dedicated advisor, priority processing, ongoing support.' },
];

// Hero proof card uses only real data: upcoming deadlines from the tracker,
// the latest visa-verification date, and a featured (real) testimonial.
const COUNTRY_CODES = {
  poland: 'PL', germany: 'DE', hungary: 'HU', latvia: 'LV', lithuania: 'LT', austria: 'AT',
  cyprus: 'CY', malta: 'MT', uk: 'UK', 'united kingdom': 'UK', usa: 'US', 'united states': 'US',
  canada: 'CA', australia: 'AU',
};
const codeFor = (country) => COUNTRY_CODES[String(country || '').toLowerCase()] || String(country || '??').slice(0, 2).toUpperCase();
const daysUntil = (iso) => Math.ceil((new Date(`${iso}T23:59:59`) - new Date()) / 86400000);
const shortDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
const monthYear = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

const DEST_GRID = ['Canada', 'UK', 'Austria', 'Australia', 'USA', 'Poland'];

const DEFAULT_METRICS = {
  students_placed: '200+',
  visa_success: '90%+',
  partner_unis: '35+',
};

const HomePage = ({ contentOverride }) => {
  const [content, setContent]       = useState(DEFAULT_CONTENT.home);
  const [teamContent, setTeam]       = useState(DEFAULT_CONTENT.expert_team);
  const [metrics, setMetrics]        = useState(DEFAULT_METRICS);
  const [showTeam, setShowTeam]      = useState(true);
  const [deadlines, setDeadlines]    = useState([]);
  const [story, setStory]            = useState(null);
  const [verifiedOn, setVerifiedOn]  = useState(null);
  const [partners, setPartners]      = useState([]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      supabase.from('university_deadlines').select('id, university_name, program_name, country, deadline_date, intake_season')
        .eq('is_active', true).gte('deadline_date', today).order('deadline_date').limit(3),
      supabase.from('testimonials').select('student_name, program, university, rating').eq('is_featured', true).limit(1),
      supabase.from('destination_visa_info').select('last_verified').not('last_verified', 'is', null)
        .order('last_verified', { ascending: false }).limit(1),
      supabase.from('universities').select('name').eq('is_active', true).order('name'),
    ]).then(([d, t, v, u]) => {
      setDeadlines(d.data || []);
      setStory(t.data?.[0] || null);
      setVerifiedOn(v.data?.[0]?.last_verified || null);
      setPartners((u.data || []).map((x) => x.name).filter(Boolean));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [h, t] = await Promise.all([
          getPageContent('home'),
          getPageContent('expert_team'),
        ]);
        setContent(p => ({ ...p, ...h }));
        setTeam(p => ({ ...p, ...t }));
      } catch (e) { console.error(e); }
    };

    supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['site_metrics', 'show_expert_team_section'])
      .then(({ data }) => {
        (data || []).forEach(row => {
          if (row.key === 'site_metrics' && row.value) setMetrics(prev => ({ ...prev, ...row.value }));
          if (row.key === 'show_expert_team_section' && row.value === false) setShowTeam(false);
        });
      });

    if (contentOverride) {
      const keys = Object.keys(contentOverride);
      if (keys.some(k => k.startsWith('hero_') || k.startsWith('featured_'))) setContent(p => ({ ...p, ...contentOverride }));
      if (keys.some(k => k.startsWith('team_'))) setTeam(p => ({ ...p, ...contentOverride }));
    } else { load(); }
  }, [contentOverride]);

  const schema = {
    "@context": "https://schema.org", "@type": "EducationalOrganization",
    "@id": "https://kuroeduconsultancy.com/#organization",
    "name": "Kuro Educational Consultancy", "url": "https://kuroeduconsultancy.com",
    "founder": { "@type": "Person", "@id": "https://kuroeduconsultancy.com/#founder", "name": "Ronald Kahoka", "sameAs": ["https://www.linkedin.com/in/ronald-kahoka-946178192/"] },
    "contactPoint": { "@type": "ContactPoint", "telephone": "+48783042776", "contactType": "customer service" },
  };

  return (
    <>
      <SEO title={content.meta_title} description={content.meta_description} schema={schema} />

      <div className="relative z-10 bg-transparent">

        {/* ═══════════════════════════════════════════════════════
            HERO — matches marketing-hero.html kit exactly
        ═══════════════════════════════════════════════════════ */}
        <section className="relative min-h-[100dvh] flex flex-col justify-center overflow-hidden pt-20 pb-16">
          {/* Radial halo */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 30% 20%, rgba(37,99,235,.2), transparent 55%), radial-gradient(ellipse at 80% 90%, rgba(124,58,237,.12), transparent 55%)',
            }}
          />

          <div style={{ width: 'var(--container)', marginInline: 'auto', padding: '0 1rem' }}>
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-16 xl:gap-20 items-center">

              {/* Left col */}
              <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-7 min-w-0">
                <motion.div variants={fadeUp}>
                  <span className="eyebrow">Your gateway to global education</span>
                </motion.div>

                <motion.h1
                  variants={fadeUp} custom={1}
                  className="font-display font-bold leading-[1.04] tracking-[-0.03em] text-white"
                  style={{ fontSize: 'var(--fs-4xl)' }}
                >
                  {content.hero_title || <>From Africa to the world —{' '}<span style={{ color: 'var(--blue-400)' }}>admissions handled end‑to‑end.</span></>}
                </motion.h1>

                <motion.p variants={fadeUp} custom={2}
                  className="text-slate-300 leading-relaxed max-w-xl"
                  style={{ fontSize: 'var(--fs-lg)' }}
                >
                  {content.hero_subtitle || 'We guide you through university shortlisting, SOPs, visa paperwork and relocation to top institutions across the EU, Australia, USA, Canada and the UK.'}
                </motion.p>

                <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-3">
                  <Button size="xl" asChild>
                    <Link to="/readiness-check">
                      {content.hero_cta_label || 'Start readiness check'}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button size="xl" variant="outline" asChild>
                    <Link to="/contact">Book a consultation</Link>
                  </Button>
                </motion.div>

                {/* Stats */}
                <motion.div variants={fadeUp} custom={4} className="grid grid-cols-3 gap-8 pt-2">
                  {[
                    { n: metrics.students_placed, lbl: 'Students placed' },
                    { n: metrics.visa_success,    lbl: 'Visa success' },
                    { n: metrics.partner_unis,    lbl: 'Partner universities' },
                  ].map((s, i) => (
                    <div key={i}>
                      <CountUp value={s.n} className="block font-display font-bold text-white tabular leading-none" style={{ fontSize: 'var(--fs-2xl)' }} />
                      <p className="text-slate-400 mt-1" style={{ fontSize: 'var(--fs-xs)' }}>{s.lbl}</p>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right col — live deadlines (real urgency, real data) */}
              <motion.div
                variants={fadeUp} custom={2} initial="hidden" animate="show"
                className="relative min-w-0"
              >
                <div className="glass p-6 sm:p-7 rounded-3xl">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <h3 className="font-display font-bold text-white text-lg">Next application deadlines</h3>
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" /> Live
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mb-5">Miss one and you usually wait for the next intake.</p>

                  <div className="space-y-3">
                    {deadlines.length === 0 && [0, 1, 2].map((i) => (
                      <div key={i} className="h-[74px] rounded-xl bg-slate-950/60 border border-slate-800/80 animate-pulse" />
                    ))}
                    {deadlines.map((d) => {
                      const left = daysUntil(d.deadline_date);
                      const soon = left <= 45;
                      return (
                        <Link
                          key={d.id}
                          to="/deadlines"
                          className="flex items-center justify-between gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-blue-500/40 hover:-translate-y-0.5 transition-all group"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <span className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-bold tracking-wide flex items-center justify-center shrink-0" title={d.country}>{codeFor(d.country)}</span>
                            <div className="min-w-0">
                              <p className="font-semibold text-white text-sm truncate">{d.university_name}</p>
                              <p className="text-slate-400 text-xs mt-0.5 truncate">{d.intake_season || d.program_name}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`text-xs font-bold ${soon ? 'text-amber-300' : 'text-blue-300'}`}>{left} days left</p>
                            <p className="text-slate-500 text-[11px] mt-0.5">Closes {shortDate(d.deadline_date)}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  <Link to="/deadlines" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-300 hover:text-blue-200">
                    See all deadlines <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Proof badge (desktop, bottom right): when visa info was last checked */}
                {verifiedOn && (
                  <div className="hidden lg:block">
                  <motion.div
                    initial={{ opacity: 0, y: -12, x: 12 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    transition={{ delay: 1.1, duration: 0.5, ease }}
                    className="toast-float -bottom-5 -right-5"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">Visa info verified</p>
                      <p className="text-[10px] text-slate-400">Official sources · {monthYear(verifiedOn)}</p>
                    </div>
                  </motion.div>
                  </div>
                )}

                {/* Proof badge (desktop, top left): a real student review */}
                {story && (
                  <div className="hidden lg:block">
                  <motion.div
                    initial={{ opacity: 0, y: 12, x: -12 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    transition={{ delay: 1.4, duration: 0.5, ease }}
                    className="toast-float -top-14 -left-6"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-300 flex items-center justify-center shrink-0">
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{'★'.repeat(Math.max(1, Math.min(5, story.rating || 5)))} {story.student_name?.trim()}</p>
                      <p className="text-[10px] text-slate-400">{[story.program, story.university].filter(Boolean).join(' · ')}</p>
                    </div>
                  </motion.div>
                  </div>
                )}
              </motion.div>

            </div>
          </div>
        </section>

        <AdUnit slotId={ADSENSE_SLOTS.homeTop} />
        <AdSlot page="/" slot="top" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" />

        <CredibilityBlock />
        <section className="relative py-20 border-t border-white/5">
          <Section style={{ width: 'var(--container)', marginInline: 'auto', padding: '0 1rem' }}>
            <div className="grid lg:grid-cols-[0.85fr_1fr] gap-10 items-center">
              <motion.div variants={fadeUp}>
                <span className="eyebrow">2027 intake planning</span>
                <h2 className="font-display font-bold text-white mt-4" style={{ fontSize: 'var(--fs-3xl)', letterSpacing: '-0.03em' }}>
                  Plan intake, budget, deadlines and visa risk in one place
                </h2>
                <p className="text-slate-400 mt-4 leading-relaxed max-w-xl">
                  Compare study routes before applying. See country costs, proof-of-funds notes, document stages and what Kuro handles next.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mt-7">
                  <Button size="lg" asChild><Link to="/intake-planner">Open intake planner <ArrowRight className="w-4 h-4" /></Link></Button>
                  <Button size="lg" variant="outline" asChild><Link to="/deadlines">Track deadlines</Link></Button>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} custom={1} className="grid sm:grid-cols-2 gap-4">
                {[
                  ['Route map', 'Country, intake, cost and fit checked first.'],
                  ['Document room', 'Translations, sponsor proof and missing files flagged.'],
                  ['Visa triage', 'Study gap, funds and refusal risk reviewed early.'],
                  ['Departure desk', 'Flights, arrival checklist and first-week support.'],
                ].map(([title, desc], i) => (
                  <div key={title} className="bento-cell spotlight-card">
                    <div className="relative z-10">
                      <p className="accent-text font-mono text-xs mb-3 opacity-80">{String(i + 1).padStart(2, '0')}</p>
                      <h3 className="font-display font-semibold text-white text-lg mb-2">{title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </Section>
        </section>

        {/* ── How it works ── */}
        <section className="relative py-28 border-t border-white/5">
          <Section style={{ width: 'var(--container)', marginInline: 'auto', padding: '0 1rem' }}>
            <motion.div variants={fadeUp} className="mb-16">
              <span className="eyebrow">The process</span>
              <h2 className="font-display font-bold text-white mt-4" style={{ fontSize: 'var(--fs-3xl)', letterSpacing: '-0.03em' }}>
                Four steps to your dream university
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-0 relative">
              <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-px opacity-60"
                style={{ background: 'linear-gradient(90deg, rgb(96 165 250), rgb(45 212 191), rgb(251 191 36), rgb(167 139 250))' }}
              />
              {PROCESS_STEPS.map((step, i) => (
                <motion.div key={i} variants={fadeUp} custom={i}
                  className={`relative p-8 group ${['accent-blue', 'accent-teal', 'accent-amber', 'accent-violet'][i % 4]}`}>
                  <div className="accent-chip w-16 h-16 rounded-2xl mb-6 flex items-center justify-center transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-[-4deg]">
                    <step.icon className="w-7 h-7" />
                  </div>
                  <span className="accent-text font-mono text-xs font-bold tracking-wider block mb-2 opacity-80">{step.step}</span>
                  <h3 className="font-display font-bold text-white text-lg mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp} className="mt-8">
              <Link to="/process" className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors group">
                View full process guide
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </Section>
        </section>

        {/* ── Services bento ── */}
        <section className="relative py-24 border-t border-white/5">
          <Section style={{ width: 'var(--container)', marginInline: 'auto', padding: '0 1rem' }}>
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
              <motion.div variants={fadeUp}>
                <span className="eyebrow">What we offer</span>
                <h2 className="font-display font-bold text-white mt-4" style={{ fontSize: 'var(--fs-3xl)', letterSpacing: '-0.03em' }}>
                  Everything you need, nothing you don't
                </h2>
              </motion.div>
              <motion.div variants={fadeUp} custom={1} className="shrink-0 mt-2 md:mt-8">
                <Button variant="outline" asChild><Link to="/services">All services</Link></Button>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {SERVICES.map((s, i) => (
                <motion.div
                  key={i} variants={fadeUp} custom={i}
                  className="bento-cell spotlight-card group"
                >
                  <div className="relative z-10 flex items-start gap-5">
                    <div className="accent-text font-mono text-xs font-bold w-8 shrink-0 mt-1 opacity-80">{String(i + 1).padStart(2,'0')}</div>
                    <div>
                      <h3 className="font-display font-semibold text-white text-lg mb-2">{s.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>
        </section>

        {/* ── Destinations ── */}
        <section className="relative py-28 border-t border-white/5">
          <Section style={{ width: 'var(--container)', marginInline: 'auto', padding: '0 1rem' }}>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <span className="eyebrow">Where you'll go</span>
              <h2 className="font-display font-bold text-white mt-4" style={{ fontSize: 'var(--fs-3xl)', letterSpacing: '-0.03em' }}>
                {content.featured_destinations_heading || 'Top study destinations'}
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {DEST_GRID.map((country, i) => (
                <motion.div key={country} variants={fadeUp} custom={i}>
                  <Link
                    to={`/destinations/${country.toLowerCase()}`}
                    className={`group block relative overflow-hidden rounded-2xl ${i === 0 ? 'sm:row-span-2 aspect-[3/4]' : 'aspect-[4/3]'}`}
                  >
                    <img
                      src={getCountryImageUrl(country)}
                      alt={country}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(2,6,23,0.82) 0%, rgba(2,6,23,0.1) 60%, transparent 100%)' }} />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="font-display font-bold text-white text-xl text-shadow-sm">{country}</h3>
                      <div className="flex items-center gap-1.5 mt-1.5 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <span className="text-slate-300 text-sm">Explore universities</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp} className="text-center mt-10">
              <Button size="lg" variant="outline" asChild>
                <Link to="/destinations">View all destinations</Link>
              </Button>
            </motion.div>
          </Section>
        </section>

        {/* ── Student stories ── */}
        <TestimonialsSection />

        {/* ── Expert team ── */}
        {showTeam && <section className="relative py-24 border-t border-white/5">
          <Section style={{ width: 'var(--container)', marginInline: 'auto', padding: '0 1rem' }}>
            <motion.div variants={fadeUp} className="text-center mb-14 max-w-xl mx-auto">
              <span className="eyebrow">The team</span>
              <h2 className="font-display font-bold text-white mt-4" style={{ fontSize: 'var(--fs-3xl)', letterSpacing: '-0.03em' }}>
                {teamContent.team_heading || 'Advisors who have been there'}
              </h2>
              <p className="text-slate-400 mt-4 leading-relaxed">{teamContent.team_intro}</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-5">
              {[1,2,3].map((num, i) => (
                <motion.div key={num} variants={fadeUp} custom={i} className="bento-cell text-center spotlight-card group">
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center border transition-colors group-hover:border-blue-500/35"
                      style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.18)' }}
                    >
                      <User className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="font-display font-semibold text-white text-lg mb-1">{teamContent[`team_member_${num}_name`] || `Advisor ${num}`}</h3>
                    <p className="text-blue-400 text-sm font-medium mb-4">{teamContent[`team_member_${num}_title`] || 'Education Consultant'}</p>
                    <p className="text-slate-400 text-sm leading-relaxed">{teamContent[`team_member_${num}_bio`] || 'Helping African students navigate global admissions with clarity and confidence.'}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp} className="text-center mt-10">
              <Button size="xl" asChild><Link to="/contact">Start your journey</Link></Button>
            </motion.div>
          </Section>
        </section>}

        {/* ── Universities we work with (real list from the catalogue) ── */}
        {partners.length > 0 && (
          <section className="py-12 border-t border-white/5 overflow-hidden">
            <p className="text-center font-mono text-slate-400 font-semibold tracking-[0.18em] uppercase mb-8" style={{ fontSize: 'var(--fs-xs)' }}>
              Universities we work with
            </p>
            <div className="marquee">
              <div className="marquee-track">
                {[...Array(2)].map((_, pass) =>
                  partners.map((uni, i) => (
                    <Link key={`${pass}-${i}`} to="/universities" tabIndex={pass ? -1 : undefined} aria-hidden={pass ? 'true' : undefined}
                      className="text-slate-400 hover:text-slate-200 transition-colors font-semibold text-sm shrink-0">
                      {uni.split(' (')[0]}
                    </Link>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── Final CTA ── */}
        <section className="relative py-32 border-t border-white/5 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 60% 55% at 50% 50%, rgba(37,99,235,0.14), transparent 70%)',
            }}
          />
          <Section style={{ width: 'var(--container-narrow)', marginInline: 'auto', padding: '0 1rem' }}>
            <div className="text-center space-y-6">
              <motion.div variants={fadeUp}>
                <span className="eyebrow">Ready to start?</span>
              </motion.div>
              <motion.h2 variants={fadeUp} custom={1}
                className="font-display font-bold text-white"
                style={{ fontSize: 'var(--fs-4xl)', letterSpacing: '-0.03em', lineHeight: 1.04 }}
              >
                {content.cta_section_title || 'Your study abroad journey starts here'}
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-slate-400 leading-relaxed max-w-lg mx-auto" style={{ fontSize: 'var(--fs-lg)' }}>
                {content.cta_section_subtitle || 'Join 200+ African students who trusted Kuro to get them where they wanted to go.'}
              </motion.p>
              <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button size="xl" asChild><Link to="/signup">{content.cta_button_label || 'Create free account'}</Link></Button>
                <Button size="xl" variant="outline" asChild><Link to="/readiness-check">Check your readiness</Link></Button>
              </motion.div>
              <motion.p variants={fadeUp} custom={4} className="text-sm text-slate-400 pt-4">
                Founded by{' '}
                <a href="https://www.linkedin.com/in/ronald-kahoka-946178192/" target="_blank" rel="noopener noreferrer"
                  className="font-semibold text-slate-200 hover:text-blue-300 underline-offset-4 hover:underline">
                  Ronald Kahoka
                </a>
                {' '}· Harare, Zimbabwe · {metrics.students_placed} students placed
              </motion.p>
            </div>
          </Section>
        </section>

        <AdSlot page="/" slot="bottom" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" />
        <AdUnit slotId={ADSENSE_SLOTS.homeBottom} />
      </div>
    </>
  );
};

export default HomePage;

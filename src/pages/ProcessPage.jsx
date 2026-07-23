import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Search, FileText, CheckCircle, Plane, Home } from 'lucide-react';
import SEO from '@/components/SEO';
import { getPageContent } from '@/lib/contentService';
import { DEFAULT_CONTENT } from '@/lib/defaultContent';
import AdUnit from '@/components/AdUnit';
import { ADSENSE_SLOTS } from '@/config/adsenseSlots';

const fadeUp = { hidden: { opacity: 0, y: 22 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] } }) };

const ProcessPage = ({ contentOverride }) => {
  const [content, setContent] = useState(DEFAULT_CONTENT.process);

  useEffect(() => {
    if (contentOverride) { setContent({ ...DEFAULT_CONTENT.process, ...contentOverride }); return; }
    getPageContent('process').then(data => setContent(data));
  }, [contentOverride]);

  const steps = [
    { id: 1, icon: ClipboardList, title: content.step_1_title, description: content.step_1_description, timeline: "1 week",    outcome: "Eligibility report, country shortlist" },
    { id: 2, icon: Search,        title: content.step_2_title, description: content.step_2_description, timeline: "1–2 weeks", outcome: "University list, requirement checklist" },
    { id: 3, icon: FileText,      title: content.step_3_title, description: content.step_3_description, timeline: "2–4 weeks", outcome: "Submitted applications" },
    { id: 4, icon: CheckCircle,   title: content.step_4_title, description: content.step_4_description, timeline: "4–8 weeks", outcome: "Unconditional offer letter" },
    { id: 5, icon: Plane,         title: content.step_5_title, description: content.step_5_description, timeline: "4–12 weeks", outcome: "Student visa" },
    { id: 6, icon: Home,          title: content.step_6_title, description: content.step_6_description, timeline: "Ongoing",   outcome: "Accommodation, airport pickup" },
  ];

  return (
    <>
      <SEO title={content.meta_title} description={content.meta_description} />
      <div className="text-slate-50">

        {/* Hero */}
        <section className="relative pt-28 pb-16 border-b border-white/5">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(37,99,235,0.18), transparent 65%)' }} />
          <div style={{ width: 'var(--container-narrow)', marginInline: 'auto', padding: '0 1rem' }} className="text-center">
            <motion.span initial="hidden" animate="show" variants={fadeUp} className="eyebrow">How it works</motion.span>
            <motion.h1 initial="hidden" animate="show" variants={fadeUp} custom={1}
              className="font-display font-bold text-white mt-4 mb-5"
              style={{ fontSize: 'var(--fs-4xl)', letterSpacing: '-0.03em', lineHeight: 1.04 }}>
              {content.page_heading}
            </motion.h1>
            <motion.p initial="hidden" animate="show" variants={fadeUp} custom={2}
              className="text-slate-300 max-w-2xl mx-auto" style={{ fontSize: 'var(--fs-lg)' }}>
              {content.page_intro}
            </motion.p>
          </div>
        </section>

        <section className="py-20">
          <div style={{ width: 'var(--container)', marginInline: 'auto', padding: '0 1rem' }}>
            <AdUnit slotId={ADSENSE_SLOTS.processTop} />

            {/* Timeline */}
            <div className="relative mt-8">
              {/* Vertical line */}
              <div className="absolute left-1/2 -translate-x-px top-8 bottom-8 w-px hidden md:block"
                style={{ background: 'linear-gradient(to bottom, rgba(37,99,235,0.5), rgba(139,92,246,0.5))' }} />

              <div className="space-y-10">
                {steps.map((step, i) => (
                  <motion.div key={step.id} initial="hidden" whileInView="show" custom={0}
                    viewport={{ once: true, margin: '-60px' }} variants={fadeUp}
                    className={`flex flex-col md:flex-row gap-6 items-center ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>

                    {/* Card */}
                    <div className="flex-1 w-full">
                      <div className="bento-cell spotlight-card">
                        <div className="relative z-10">
                          <div className={`flex items-center gap-3 mb-4 ${i % 2 === 0 ? 'flex-row-reverse text-right' : ''}`}>
                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-display font-bold text-white shrink-0">
                              {step.id}
                            </div>
                            <h3 className="font-display font-semibold text-white" style={{ fontSize: 'var(--fs-xl)' }}>{step.title}</h3>
                          </div>
                          <p className="text-slate-400 leading-relaxed mb-4 text-sm">{step.description}</p>
                          <div className={`flex gap-6 text-xs ${i % 2 === 0 ? 'justify-end' : ''}`}>
                            <div>
                              <span className="block text-slate-500 uppercase tracking-wider mb-0.5">Timeline</span>
                              <span className="text-blue-400 font-medium">{step.timeline}</span>
                            </div>
                            <div>
                              <span className="block text-slate-500 uppercase tracking-wider mb-0.5">Outcome</span>
                              <span className="text-emerald-400 font-medium">{step.outcome}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Centre icon */}
                    <div className="hidden md:flex w-14 h-14 rounded-2xl z-10 items-center justify-center shrink-0"
                      style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.35)', boxShadow: '0 0 24px rgba(37,99,235,0.25)' }}>
                      <step.icon className="w-6 h-6 text-blue-400" />
                    </div>

                    <div className="flex-1 hidden md:block" />
                  </motion.div>
                ))}
              </div>
            </div>

            <AdUnit slotId={ADSENSE_SLOTS.processBottom} />
          </div>
        </section>

      </div>
    </>
  );
};

export default ProcessPage;

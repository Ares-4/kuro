import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, ShieldCheck } from 'lucide-react';
import SEO from '@/components/SEO';
import AdSlot from '@/components/ads/AdSlot';

const fadeUp = { hidden: { opacity: 0, y: 22 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] } }) };

const AboutPage = () => {
  const teamImage = "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80";

  return (
    <>
      <SEO title="About Kuro Education Consultancy" description="Our mission is to guide international students through the study abroad journey with expert advice and support." />
      <div className="text-slate-50">
        <AdSlot page="/about" slot="top" className="max-w-4xl mx-auto px-4 pt-6" />

        {/* Hero */}
        <section className="relative pt-28 pb-16 border-b border-white/5">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(37,99,235,0.18), transparent 65%)' }} />
          <div style={{ width: 'var(--container-narrow)', marginInline: 'auto', padding: '0 1rem' }} className="text-center">
            <motion.div initial="hidden" animate="show" variants={fadeUp}>
              <span className="eyebrow">Who we are</span>
            </motion.div>
            <motion.h1 initial="hidden" animate="show" variants={fadeUp} custom={1}
              className="font-display font-bold text-white mt-4 mb-6"
              style={{ fontSize: 'var(--fs-4xl)', letterSpacing: '-0.03em', lineHeight: 1.04 }}>
              Our mission
            </motion.h1>
            <motion.p initial="hidden" animate="show" variants={fadeUp} custom={2}
              className="text-slate-300 leading-relaxed max-w-2xl mx-auto"
              style={{ fontSize: 'var(--fs-lg)' }}>
              To bridge the gap between African potential and global educational excellence, providing a trusted pathway for students to realise their ambitions.
            </motion.p>
          </div>
        </section>

        {/* Who we are */}
        <section className="py-24 border-b border-white/5">
          <div style={{ width: 'var(--container)', marginInline: 'auto', padding: '0 1rem' }}
            className="grid md:grid-cols-2 gap-14 items-center">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}
              className="space-y-5">
              <span className="eyebrow">Background</span>
              <h2 className="font-display font-bold text-white" style={{ fontSize: 'var(--fs-3xl)', letterSpacing: '-0.03em' }}>Who we are</h2>
              <p className="text-slate-400 leading-relaxed">
                Kuro Educational Consultancy is a premier education consulting firm headquartered in Harare, Zimbabwe. Founded with the vision of democratising access to international education, we specialise in placing students in top universities across Poland, Cyprus, Lithuania, and other European nations.
              </p>
              <p className="text-slate-400 leading-relaxed">
                We understand the unique challenges African students face — from complex visa procedures to finding affordable tuition. Our team of experienced consultants works tirelessly to simplify this process, ensuring a seamless transition from your home country to your dream campus.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative h-96 rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 40px 80px -20px rgba(0,0,0,0.7)', border: '1px solid rgba(148,163,184,0.1)' }}>
              <img className="w-full h-full object-cover" alt="Kuro team at work" src={teamImage} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(5,6,10,0.4), transparent 60%)' }} />
            </motion.div>
          </div>
        </section>

        {/* Values cards */}
        <section className="py-24">
          <div style={{ width: 'var(--container)', marginInline: 'auto', padding: '0 1rem' }}>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
              className="text-center mb-14">
              <span className="eyebrow">What drives us</span>
              <h2 className="font-display font-bold text-white mt-4" style={{ fontSize: 'var(--fs-3xl)', letterSpacing: '-0.03em' }}>
                Vision, values & community
              </h2>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { icon: Target, color: 'text-blue-400', bg: 'rgba(37,99,235,0.08)', title: 'Our vision', body: 'To become the most trusted educational bridge between Africa and Europe, known for integrity and success.' },
                { icon: ShieldCheck, color: 'text-violet-400', bg: 'rgba(139,92,246,0.08)', title: 'Our values', body: 'Transparency, integrity, and student-centricity are at the core of every consultation we provide.' },
                { icon: Users, color: 'text-emerald-400', bg: 'rgba(52,211,153,0.08)', title: 'Our community', body: 'We build lasting relationships, supporting our students well beyond their acceptance letters.' },
              ].map(({ icon: Icon, color, bg, title, body }, i) => (
                <motion.div key={title} initial="hidden" whileInView="show" custom={i}
                  viewport={{ once: true, margin: '-60px' }} variants={fadeUp}
                  className="bento-cell text-center spotlight-card">
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                      style={{ background: bg, border: '1px solid rgba(148,163,184,0.12)' }}>
                      <Icon className={`w-6 h-6 ${color}`} />
                    </div>
                    <h3 className="font-display font-semibold text-white text-lg mb-3">{title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <AdSlot page="/about" slot="bottom" className="max-w-4xl mx-auto px-4 pb-6" />
      </div>
    </>
  );
};

export default AboutPage;

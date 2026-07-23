import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import SEO from '@/components/SEO';
import { calculateLeadScore } from '@/lib/leadScoringService';
import { getPageContent } from '@/lib/contentService';
import { DEFAULT_CONTENT } from '@/lib/defaultContent';
import AdUnit from '@/components/AdUnit';
import { ADSENSE_SLOTS } from '@/config/adsenseSlots';

const fadeUp = { hidden: { opacity: 0, y: 22 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] } }) };

const CONTACT_ITEMS = [
  { icon: Mail,    color: 'text-blue-400',    bg: 'rgba(37,99,235,0.08)',   label: 'Email us',          value: 'info@kuro.com' },
  { icon: Phone,   color: 'text-emerald-400', bg: 'rgba(52,211,153,0.08)', label: 'WhatsApp / call',   value: '+263 77 123 4567' },
  { icon: MapPin,  color: 'text-violet-400',  bg: 'rgba(139,92,246,0.08)', label: 'Visit us',          value: 'Harare, Zimbabwe' },
];

const ContactPage = ({ contentOverride }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(DEFAULT_CONTENT.contact);
  const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '', message: '' });

  useEffect(() => {
    if (contentOverride) { setContent({ ...DEFAULT_CONTENT.contact, ...contentOverride }); return; }
    getPageContent('contact').then(data => setContent(data));
  }, [contentOverride]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const scoringResult = await calculateLeadScore({ name: formData.name, email: formData.email, whatsapp: formData.whatsapp });
      const { error } = await supabase.from('leads').insert([{
        name: formData.name, email: formData.email, whatsapp: formData.whatsapp,
        goal: 'contact_form_message', intake_form: JSON.stringify({ message: formData.message }),
        source: 'contact', status: 'New',
        score: scoringResult.score, tier: scoringResult.tier, scored_at: scoringResult.scored_at,
      }]);
      if (error) throw error;
      toast({ title: "Message sent", description: content.success_message, className: "bg-green-600 text-white border-none" });
      setFormData({ name: '', email: '', whatsapp: '', message: '' });
    } catch {
      toast({ variant: "destructive", title: "Failed to send", description: "Please try again later." });
    } finally { setLoading(false); }
  };

  return (
    <>
      <SEO title={content.meta_title} description={content.meta_description} />
      <div className="text-slate-50">

        {/* Hero */}
        <section className="relative pt-28 pb-16 border-b border-white/5">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(37,99,235,0.18), transparent 65%)' }} />
          <div style={{ width: 'var(--container-narrow)', marginInline: 'auto', padding: '0 1rem' }} className="text-center">
            <motion.span initial="hidden" animate="show" variants={fadeUp} className="eyebrow">Get in touch</motion.span>
            <motion.h1 initial="hidden" animate="show" variants={fadeUp} custom={1}
              className="font-display font-bold text-white mt-4 mb-4"
              style={{ fontSize: 'var(--fs-4xl)', letterSpacing: '-0.03em', lineHeight: 1.04 }}>
              {content.page_heading}
            </motion.h1>
            <motion.p initial="hidden" animate="show" variants={fadeUp} custom={2}
              className="text-slate-300 max-w-xl mx-auto" style={{ fontSize: 'var(--fs-lg)' }}>
              {content.page_intro}
            </motion.p>
          </div>
        </section>

        <section className="py-20">
          <div style={{ width: 'var(--container)', marginInline: 'auto', padding: '0 1rem' }}>
            <AdUnit slotId={ADSENSE_SLOTS.contactTop} />

            <div className="grid md:grid-cols-2 gap-12 mt-8">
              {/* Contact info */}
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
                className="space-y-8">
                <div className="space-y-4">
                  {CONTACT_ITEMS.map(({ icon: Icon, color, bg, label, value }, i) => (
                    <motion.div key={label} variants={fadeUp} custom={i}
                      className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: bg, border: '1px solid rgba(148,163,184,0.1)' }}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
                        <p className="text-white font-medium">{value}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Form */}
              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="glass p-8 rounded-2xl">
                <h3 className="font-display font-semibold text-white text-xl mb-1">{content.form_title}</h3>
                <p className="text-slate-400 text-sm mb-6">{content.form_subtitle}</p>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Name</label>
                    <Input required name="name" placeholder="Your full name" value={formData.name} onChange={handleChange}
                      className="bg-slate-950/60 border-slate-700/60 focus:border-blue-500" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email</label>
                      <Input required type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange}
                        className="bg-slate-950/60 border-slate-700/60 focus:border-blue-500" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">WhatsApp</label>
                      <Input required name="whatsapp" placeholder="+263..." value={formData.whatsapp} onChange={handleChange}
                        className="bg-slate-950/60 border-slate-700/60 focus:border-blue-500" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Message</label>
                    <Textarea required name="message" placeholder="How can we help you?" value={formData.message} onChange={handleChange}
                      className="bg-slate-950/60 border-slate-700/60 focus:border-blue-500 min-h-[120px]" />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 h-11">
                    {loading ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <Send className="w-4 h-4 mr-2" />}
                    Send message
                  </Button>
                </form>
              </motion.div>
            </div>

            <AdUnit slotId={ADSENSE_SLOTS.contactBottom} />
          </div>
        </section>

      </div>
    </>
  );
};

export default ContactPage;

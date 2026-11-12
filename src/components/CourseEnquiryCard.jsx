import React, { useState } from 'react';
import { Loader2, Send, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/customSupabaseClient';
import { calculateLeadScore } from '@/lib/leadScoringService';
import { notifyAdminOfLead } from '@/lib/pushNotifications';
import { trackLead } from '@/lib/analytics';

// "Ask about this course" for visitors who are not ready to create an account.
// Saves a lead (goal course_enquiry, source course_page) the same way the
// contact form does, alerts admins, and counts as a GA4 generate_lead.

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const CourseEnquiryCard = ({ course, countryName }) => {
  const [form, setForm] = useState({ name: '', email: '', whatsapp: '', message: '', website: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.website) { setStatus('sent'); return; } // honeypot: bots fill hidden fields
    if (form.name.trim().length < 2) { setError('Please enter your name.'); return; }
    if (!isEmail(form.email)) { setError('Please enter a valid email address.'); return; }
    setError('');
    setStatus('sending');
    try {
      const scoring = await calculateLeadScore({ name: form.name, email: form.email, whatsapp: form.whatsapp });
      const { error: insertError } = await supabase.from('leads').insert([{
        name: form.name.trim(),
        email: form.email.trim(),
        whatsapp: form.whatsapp.trim() || null,
        goal: 'course_enquiry',
        source: 'course_page',
        status: 'New',
        target_destination: countryName || null,
        study_level: course.degree_level || null,
        intake_form: JSON.stringify({
          course_id: course.id,
          program: course.program_name,
          university: course.university,
          message: form.message.trim(),
        }),
        score: scoring.score, tier: scoring.tier, scored_at: scoring.scored_at,
      }]);
      if (insertError) throw insertError;
      notifyAdminOfLead('New course enquiry', `${form.name.trim()} asked about ${course.program_name} at ${course.university}.`, '/admin/leads');
      trackLead('course_enquiry', { course_id: course.id });
      setStatus('sent');
    } catch (err) {
      console.error('Course enquiry failed:', err);
      setStatus('error');
      setError('Something went wrong. Please try again, or message us on WhatsApp.');
    }
  };

  if (status === 'sent') {
    return (
      <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-5 text-center">
        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
        <p className="text-white font-semibold">Thanks, we have your question</p>
        <p className="text-slate-400 text-sm mt-1">An advisor will reply by email{form.whatsapp ? ' or WhatsApp' : ''}, usually within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3" noValidate>
      <div>
        <p className="text-white font-semibold">Ask about this course</p>
        <p className="text-slate-400 text-sm mt-0.5">No account needed. An advisor replies within 24 hours.</p>
      </div>
      <label className="sr-only" htmlFor="enq-name">Your name</label>
      <Input id="enq-name" value={form.name} onChange={set('name')} placeholder="Your name" autoComplete="name" className="bg-slate-950/60 border-slate-700 text-white" />
      <label className="sr-only" htmlFor="enq-email">Email</label>
      <Input id="enq-email" type="email" value={form.email} onChange={set('email')} placeholder="Email" autoComplete="email" className="bg-slate-950/60 border-slate-700 text-white" />
      <label className="sr-only" htmlFor="enq-wa">WhatsApp number (optional)</label>
      <Input id="enq-wa" type="tel" value={form.whatsapp} onChange={set('whatsapp')} placeholder="WhatsApp number (optional)" autoComplete="tel" className="bg-slate-950/60 border-slate-700 text-white" />
      <label className="sr-only" htmlFor="enq-msg">Your question (optional)</label>
      <Textarea id="enq-msg" value={form.message} onChange={set('message')} rows={3} placeholder="Your question (optional)" className="bg-slate-950/60 border-slate-700 text-white resize-none" />
      {/* Honeypot: hidden from people, tempting to bots */}
      <input type="text" name="website" value={form.website} onChange={set('website')} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
      <Button type="submit" disabled={status === 'sending'} className="w-full bg-emerald-600 hover:bg-emerald-700">
        {status === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Send question</>}
      </Button>
      <p className="text-xs text-slate-400 text-center">
        We only use your details to reply about this course. <Link to="/privacy-policy" className="underline hover:text-slate-300">Privacy policy</Link>
      </p>
    </form>
  );
};

export default CourseEnquiryCard;

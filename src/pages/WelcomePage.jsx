import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowLeft, ArrowRight, Loader2, CheckCircle2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { STUDY_LEVELS, INTAKES } from '@/lib/studyOptions';
import { trackSignUp } from '@/lib/analytics';

// Required profile step after the first sign-in (Google or email), before the
// dashboard. Collects what an advisor needs to avoid wrong advice, then shows a
// review screen so the student confirms every detail before it is saved.
// Saving sets preferences.onboarded_at, which the DB turns into an admin alert.

const COUNTRIES = [
  'Zimbabwe', 'South Africa', 'Botswana', 'Namibia', 'Zambia', 'Malawi', 'Mozambique',
  'Lesotho', 'Eswatini', 'Kenya', 'Nigeria', 'Ghana', 'Uganda', 'Tanzania', 'Other',
];
const QUALIFICATIONS = [
  'O-level / IGCSE', 'A-level / Matric / NSSC / Grade 12', 'Certificate or Diploma',
  "Bachelor's degree", "Master's degree",
];
const ENGLISH = ['IELTS', 'TOEFL', 'Duolingo English Test', 'Studied in English (school letter)', 'None yet'];
const REFERRALS = ['Google search', 'Facebook', 'Instagram', 'TikTok', 'WhatsApp', 'Friend or family', 'Other'];

const inputCls = 'w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelCls = 'block text-sm font-medium text-slate-300 mb-1.5';

const Field = ({ label, hint, error, children }) => (
  <div>
    <label className={labelCls}>{label}</label>
    {children}
    {hint && !error && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
  </div>
);

const Select = ({ value, onChange, options, placeholder }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
    <option value="">{placeholder}</option>
    {options.map((o) => <option key={o} value={o}>{o}</option>)}
  </select>
);

const ageFrom = (dob) => {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) age -= 1;
  return age;
};

const WelcomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [errors, setErrors] = useState({});
  const [destinations, setDestinations] = useState([]);
  const [studentId, setStudentId] = useState(null);
  const [existingPrefs, setExistingPrefs] = useState({});
  const [confirmed, setConfirmed] = useState(false);
  const [form, setForm] = useState({
    full_name: '', phone: '', country: '', nationality: '', dob: '',
    qualification: '', study_level: '', destination: '', intake: '',
    english_test: '', referral: '',
  });
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [{ data: student }, { data: dests }] = await Promise.all([
        supabase.from('students').select('id, full_name, phone, country, preferences').eq('user_id', user.id).maybeSingle(),
        supabase.from('destinations').select('name').eq('is_active', true).order('name'),
      ]);
      if (cancelled) return;
      const prefs = student?.preferences || {};
      if (prefs.onboarded_at) {
        try { sessionStorage.setItem(`kuro_profile_done_${user.id}`, '1'); } catch { /* ignore */ }
        navigate('/dashboard', { replace: true });
        return;
      }
      const meta = user.user_metadata || {};
      setStudentId(student?.id || null);
      setExistingPrefs(prefs);
      setDestinations((dests || []).map((d) => d.name).filter(Boolean));
      setForm((f) => ({
        ...f,
        full_name: student?.full_name || meta.full_name || meta.name || '',
        phone: student?.phone || meta.phone || '',
        country: student?.country || meta.country || '',
        nationality: prefs.nationality || '',
        dob: prefs.dob || '',
        qualification: prefs.qualification || '',
        study_level: prefs.study_level || '',
        destination: prefs.destination || '',
        intake: prefs.intake || '',
        english_test: prefs.english_test || '',
        referral: prefs.referral || '',
      }));
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user, navigate]);

  const validate = (s) => {
    const e = {};
    if (s === 1) {
      const name = form.full_name.trim();
      if (name.split(/\s+/).length < 2) e.full_name = 'Enter your first and last name, exactly as on your passport.';
      const digits = form.phone.replace(/[^\d]/g, '');
      if (!form.phone.trim().startsWith('+') || digits.length < 9 || digits.length > 15) {
        e.phone = 'Include your country code, e.g. +263 77 123 4567.';
      }
      if (!form.country) e.country = 'Select where you live now.';
      if (!form.nationality) e.nationality = 'Select the country on your passport.';
      const age = ageFrom(form.dob);
      if (age === null) e.dob = 'Enter your date of birth.';
      else if (age < 15 || age > 65) e.dob = 'Please check this date — it gives an age of ' + age + '.';
    }
    if (s === 2) {
      if (!form.qualification) e.qualification = 'Select your highest completed qualification.';
      if (!form.study_level) e.study_level = 'Select what you want to study.';
      if (!form.destination) e.destination = 'Select a destination, or "Not sure yet".';
      if (!form.intake) e.intake = 'Select when you want to start.';
      if (!form.english_test) e.english_test = 'Select your English proof.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(step)) setStep((s) => s + 1); };

  const summary = useMemo(() => [
    ['Full name', form.full_name, 1], ['WhatsApp', form.phone, 1], ['Lives in', form.country, 1],
    ['Nationality', form.nationality, 1], ['Date of birth', form.dob, 1],
    ['Highest qualification', form.qualification, 2], ['Wants to study', form.study_level, 2],
    ['Destination', form.destination, 2], ['Intake', form.intake, 2],
    ['English proof', form.english_test, 2], ['Heard about us', form.referral || '—', 2],
  ], [form]);

  const save = async () => {
    if (!confirmed || !user) return;
    setSaving(true);
    const preferences = {
      ...existingPrefs,
      nationality: form.nationality, dob: form.dob, qualification: form.qualification,
      study_level: form.study_level, destination: form.destination, intake: form.intake,
      english_test: form.english_test, referral: form.referral || null,
      onboarded_at: new Date().toISOString(),
    };
    const row = {
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      country: form.country,
      preferences,
      updated_at: new Date().toISOString(),
    };
    const { error } = studentId
      ? await supabase.from('students').update(row).eq('id', studentId)
      : await supabase.from('students').insert({ ...row, user_id: user.id, email: user.email });

    if (error) {
      console.error('Profile save failed:', error);
      toast({ title: 'Could not save your profile', description: 'Please try again in a moment.', variant: 'destructive' });
      setSaving(false);
      return;
    }
    await supabase.auth.updateUser({ data: { full_name: row.full_name, phone: row.phone, country: row.country } }).catch(() => {});
    try { sessionStorage.setItem(`kuro_profile_done_${user.id}`, '1'); } catch { /* ignore */ }
    // Completed profile = finished sign-up (runs once: onboarded students skip /welcome).
    trackSignUp(user.app_metadata?.provider || 'email');
    // Welcome email (send-email only allows this to the student's own address).
    supabase.functions.invoke('send-email', {
      body: { to: user.email, templateName: 'welcome_student', data: { name: row.full_name.split(' ')[0], destination: form.destination } },
    }).catch(() => {});
    toast({ title: 'Profile saved', description: 'Welcome to Kuro. An advisor will review your details.' });
    navigate('/dashboard', { replace: true });
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  const titles = ['About you', 'Your study plans', 'Check your details'];

  return (
    <>
      <Helmet>
        <title>Complete your profile - Kuro Educational Consultancy</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 py-10">
        <div className="w-full max-w-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <GraduationCap className="w-8 h-8 text-blue-400" />
            <span className="text-lg font-bold text-white">Kuro Educational</span>
          </div>

          <p className="text-xs uppercase tracking-wider text-blue-300 font-semibold">Step {step} of 3</p>
          <h1 className="text-2xl font-bold text-white mt-1">{titles[step - 1]}</h1>
          <p className="text-slate-400 text-sm mt-1 mb-5">
            {step === 3
              ? 'Your advisor uses these details for applications and visa documents. Please make sure they are correct.'
              : 'We need a few details before you start, so our advice fits your situation.'}
          </p>
          <div className="w-full bg-slate-900 h-1.5 rounded-full mb-6">
            <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {step === 1 && (
                <>
                  <Field label="Full name (as on your passport)" error={errors.full_name}>
                    <input className={inputCls} value={form.full_name} onChange={(e) => set('full_name')(e.target.value)} placeholder="e.g. Tendai Moyo" autoComplete="name" />
                  </Field>
                  <Field label="WhatsApp number" hint="With country code, so your advisor can reach you." error={errors.phone}>
                    <input className={inputCls} value={form.phone} onChange={(e) => set('phone')(e.target.value)} placeholder="+263 77 123 4567" inputMode="tel" autoComplete="tel" />
                  </Field>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Country you live in" error={errors.country}>
                      <Select value={form.country} onChange={set('country')} options={COUNTRIES} placeholder="Select…" />
                    </Field>
                    <Field label="Nationality (passport)" error={errors.nationality}>
                      <Select value={form.nationality} onChange={set('nationality')} options={COUNTRIES} placeholder="Select…" />
                    </Field>
                  </div>
                  <Field label="Date of birth" error={errors.dob}>
                    <input type="date" className={inputCls} value={form.dob} onChange={(e) => set('dob')(e.target.value)} max={new Date().toISOString().slice(0, 10)} />
                  </Field>
                </>
              )}

              {step === 2 && (
                <>
                  <Field label="Highest qualification you have completed" error={errors.qualification}>
                    <Select value={form.qualification} onChange={set('qualification')} options={QUALIFICATIONS} placeholder="Select…" />
                  </Field>
                  <Field label="What do you want to study?" error={errors.study_level}>
                    <Select value={form.study_level} onChange={set('study_level')} options={STUDY_LEVELS} placeholder="Select…" />
                  </Field>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Preferred destination" error={errors.destination}>
                      <Select value={form.destination} onChange={set('destination')} options={[...destinations, 'Not sure yet']} placeholder="Select…" />
                    </Field>
                    <Field label="When do you want to start?" error={errors.intake}>
                      <Select value={form.intake} onChange={set('intake')} options={INTAKES} placeholder="Select…" />
                    </Field>
                  </div>
                  <Field label="English proof" error={errors.english_test}>
                    <Select value={form.english_test} onChange={set('english_test')} options={ENGLISH} placeholder="Select…" />
                  </Field>
                  <Field label="How did you hear about us? (optional)">
                    <Select value={form.referral} onChange={set('referral')} options={REFERRALS} placeholder="Select…" />
                  </Field>
                </>
              )}

              {step === 3 && (
                <>
                  <dl className="divide-y divide-slate-700/70 rounded-lg border border-slate-700 bg-slate-900/40">
                    {summary.map(([k, v, s]) => (
                      <div key={k} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                        <dt className="text-slate-400 shrink-0">{k}</dt>
                        <dd className="text-white text-right flex items-center gap-2 min-w-0">
                          <span className="truncate">{v}</span>
                          <button type="button" onClick={() => setStep(s)} aria-label={`Edit ${k}`} className="text-slate-500 hover:text-blue-300 shrink-0">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <label className="flex items-start gap-3 text-sm text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-1 h-4 w-4 accent-blue-500" />
                    <span>I confirm these details are correct and match my passport and documents.</span>
                  </label>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-3 mt-7">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)} className="border-slate-600 text-slate-200 bg-transparent hover:bg-slate-700">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            )}
            {step < 3 ? (
              <Button type="button" onClick={next} className="flex-1 bg-blue-600 hover:bg-blue-700">
                Continue <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button type="button" onClick={save} disabled={!confirmed || saving} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-1" /> Save and continue</>}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default WelcomePage;

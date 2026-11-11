import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Target, CalendarClock, Award, Pencil, ArrowRight, Loader2, X } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  STUDY_LEVELS, INTAKES, NOT_SURE, planDestination, scholarshipLevel, intakeDate,
} from '@/lib/studyOptions';

/**
 * "Your plan" card on the student dashboard. Built from the onboarding answers in
 * students.preferences (destination, study_level, intake): intake countdown, the
 * next deadlines and the scholarships that fit. The plan can be edited inline.
 */

const card = { background: 'rgba(30,41,59,0.45)', border: '1px solid var(--line-2)', backdropFilter: 'blur(8px)' };
const selectCls = 'w-full px-3 py-2.5 bg-slate-900/60 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500';

const DAY = 86400000;
const daysUntil = (date) => Math.ceil((new Date(date).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / DAY);
const fmtDate = (date) => new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const intakeLabel = (intake) => {
  const d = intakeDate(intake);
  if (!d) return null;
  const months = (d.getFullYear() - new Date().getFullYear()) * 12 + d.getMonth() - new Date().getMonth();
  if (months <= 0) return 'starting now';
  return `${months} month${months === 1 ? '' : 's'} to go`;
};

const DaysChip = ({ date }) => {
  const n = daysUntil(date);
  const urgent = n <= 30;
  return (
    <span className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full border tabular ${
      urgent ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-slate-500/10 text-slate-300 border-slate-500/25'
    }`}>
      {n <= 0 ? 'Today' : `${n}d`}
    </span>
  );
};

const MyPlanCard = ({ student, onStudentChange }) => {
  const { toast } = useToast();
  const prefs = student?.preferences || {};
  const destination = planDestination(student);
  const [deadlines, setDeadlines] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [destOptions, setDestOptions] = useState([]);
  const [form, setForm] = useState({ destination: '', study_level: '', intake: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const today = new Date().toISOString().slice(0, 10);
      let dq = supabase.from('university_deadlines')
        .select('id, university_name, program_name, country, deadline_date, type, intake_season, intake_year')
        .eq('is_active', true).gte('deadline_date', today)
        .order('deadline_date', { ascending: true }).limit(4);
      if (destination) dq = dq.ilike('country', destination);
      const [{ data: dl }, { data: sch }] = await Promise.all([
        dq,
        supabase.from('scholarships').select('id, title, provider, amount, countries, levels, deadline').eq('is_active', true),
      ]);
      if (cancelled) return;
      const country = destination?.toLowerCase();
      const level = scholarshipLevel(prefs.study_level);
      const fits = (sch || []).filter((s) => {
        if (s.deadline && s.deadline < today) return false;
        const countries = (s.countries || []).map((c) => String(c).toLowerCase());
        if (country && countries.length && !countries.includes(country)) return false;
        if (level && (s.levels || []).length && !s.levels.includes(level)) return false;
        return true;
      });
      fits.sort((a, b) => (a.deadline || '9999').localeCompare(b.deadline || '9999'));
      setDeadlines(dl || []);
      setScholarships(fits.slice(0, 4));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [destination, prefs.study_level]);

  const startEdit = async () => {
    setForm({
      destination: prefs.destination || '',
      study_level: prefs.study_level || '',
      intake: prefs.intake || '',
    });
    setEditing(true);
    if (!destOptions.length) {
      const { data } = await supabase.from('destinations').select('name').eq('is_active', true).order('name');
      setDestOptions((data || []).map((d) => d.name).filter(Boolean));
    }
  };

  const save = async () => {
    if (!student?.id) return;
    setSaving(true);
    const preferences = { ...prefs, ...form };
    const { error } = await supabase.from('students').update({ preferences, updated_at: new Date().toISOString() }).eq('id', student.id);
    setSaving(false);
    if (error) {
      toast({ title: 'Could not save your plan', description: 'Please try again in a moment.', variant: 'destructive' });
      return;
    }
    onStudentChange?.({ ...student, preferences });
    setEditing(false);
    toast({ title: 'Plan updated', description: 'Deadlines, scholarships and programs now follow your new plan.' });
  };

  const hasPlan = !!(prefs.study_level || prefs.destination || prefs.intake);
  const title = hasPlan
    ? `${prefs.study_level || 'Studies'} in ${destination || 'Europe'}`
    : 'Set your study plan';
  const countdown = intakeLabel(prefs.intake);

  return (
    <div className="rounded-2xl overflow-hidden" style={card}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-6 py-5 border-b" style={{ borderColor: 'var(--line)' }}>
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)' }}>
            <Target className="w-5 h-5 text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: 'var(--blue-400)' }}>Your plan</p>
            <h2 className="font-display font-bold text-white text-lg leading-tight">{title}</h2>
            <p className="text-xs mt-1" style={{ color: 'var(--fg-4)' }}>
              {prefs.intake && prefs.intake !== NOT_SURE
                ? <>{prefs.intake} intake{countdown && <> · <span className="text-emerald-400 font-medium">{countdown}</span></>}</>
                : 'Pick an intake to see your countdown.'}
              {!destination && hasPlan && ' Showing all destinations.'}
            </p>
          </div>
        </div>
        {!editing && (
          <button type="button" onClick={startEdit}
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: 'var(--blue-400)', border: '1px solid rgba(37,99,235,0.25)' }}>
            <Pencil className="w-3 h-3" /> Edit
          </button>
        )}
      </div>

      {/* Inline editor */}
      <AnimatePresence initial={false}>
        {editing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-b" style={{ borderColor: 'var(--line)' }}
          >
            <div className="px-6 py-5 grid sm:grid-cols-3 gap-3">
              {[
                ['Destination', 'destination', [...destOptions, NOT_SURE]],
                ['Study level', 'study_level', STUDY_LEVELS],
                ['Intake', 'intake', INTAKES],
              ].map(([label, key, options]) => (
                <label key={key} className="block">
                  <span className="block text-xs font-medium text-slate-400 mb-1">{label}</span>
                  <select value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className={selectCls}>
                    <option value="">Select…</option>
                    {options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </label>
              ))}
            </div>
            <div className="px-6 pb-5 flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
                <X className="w-3.5 h-3.5 mr-1" /> Cancel
              </Button>
              <Button size="sm" onClick={save} disabled={saving || !form.destination || !form.study_level || !form.intake}>
                {saving && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />} Save plan
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deadlines + scholarships */}
      <div className="grid md:grid-cols-2 md:divide-x divide-y md:divide-y-0" style={{ borderColor: 'var(--line)' }}>
        <section className="px-6 py-5" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <CalendarClock className="w-4 h-4 text-amber-400" /> Next deadlines
            </h3>
            <Link to="/deadlines" className="text-xs font-semibold flex items-center gap-1 hover:text-blue-300" style={{ color: 'var(--blue-400)' }}>
              All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-10 rounded-lg" />)}</div>
          ) : deadlines.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--fg-4)' }}>
              No upcoming deadlines listed{destination ? ` for ${destination}` : ''} yet. Your advisor will confirm dates with you.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {deadlines.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{d.university_name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--fg-4)' }}>
                      {fmtDate(d.deadline_date)}
                      {d.intake_season && ` · ${d.intake_season}${d.intake_year && !String(d.intake_season).includes(d.intake_year) ? ` ${d.intake_year}` : ''}`}
                      {!destination && ` · ${d.country}`}
                    </p>
                  </div>
                  <DaysChip date={d.deadline_date} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="px-6 py-5" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Award className="w-4 h-4 text-emerald-400" /> Scholarships for you
            </h3>
            <Link to="/scholarships" className="text-xs font-semibold flex items-center gap-1 hover:text-blue-300" style={{ color: 'var(--blue-400)' }}>
              All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-10 rounded-lg" />)}</div>
          ) : scholarships.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--fg-4)' }}>
              No open scholarships match your plan right now. New ones are added as they open.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {scholarships.map((s) => (
                <li key={s.id}>
                  <Link to={`/scholarships/${s.id}`} className="flex items-center justify-between gap-3 group">
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate group-hover:text-blue-300 transition-colors">{s.title}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--fg-4)' }}>
                        {[s.amount, s.deadline ? `closes ${fmtDate(s.deadline)}` : 'rolling deadline'].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    {s.deadline && <DaysChip date={s.deadline} />}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default MyPlanCard;

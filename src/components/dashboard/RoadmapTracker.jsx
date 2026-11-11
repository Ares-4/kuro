import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { m as motion } from 'framer-motion';
import { CheckCircle2, Circle, Map, ArrowRight, Loader2, FileText } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { planDestination } from '@/lib/studyOptions';

/**
 * Student-facing application roadmap for the student's chosen destination.
 * Steps come from destination_roadmaps (admin-managed); completed step orders are
 * stored per destination in students.preferences.roadmap_progress[slug].
 */
const RoadmapTracker = ({ student, onStudentChange }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [destination, setDestination] = useState(null); // { name, slug }
  const [steps, setSteps] = useState([]);
  const [savingOrder, setSavingOrder] = useState(null);
  const [expanded, setExpanded] = useState(null);

  // Destination picked at onboarding; older profiles only have country.
  const target = planDestination(student) || student?.country;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!target) { setLoading(false); return; }
      setLoading(true);
      const { data: dest } = await supabase
        .from('destinations')
        .select('name, slug')
        .eq('is_active', true)
        .ilike('name', target.trim())
        .limit(1)
        .maybeSingle();
      if (!dest) { if (!cancelled) { setDestination(null); setLoading(false); } return; }
      const { data: roadmap } = await supabase
        .from('destination_roadmaps')
        .select('steps')
        .eq('destination_slug', dest.slug)
        .maybeSingle();
      if (cancelled) return;
      setDestination(dest);
      setSteps([...(roadmap?.steps || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [target]);

  const done = useMemo(() => {
    const list = student?.preferences?.roadmap_progress?.[destination?.slug];
    return new Set(Array.isArray(list) ? list : []);
  }, [student?.preferences, destination?.slug]);

  const pct = steps.length ? Math.round((steps.filter(s => done.has(s.order)).length / steps.length) * 100) : 0;
  const nextStep = steps.find(s => !done.has(s.order));

  const toggle = async (order) => {
    if (!student?.id || !destination) return;
    const next = new Set(done);
    next.has(order) ? next.delete(order) : next.add(order);
    const preferences = {
      ...(student.preferences || {}),
      roadmap_progress: {
        ...(student.preferences?.roadmap_progress || {}),
        [destination.slug]: [...next].sort((a, b) => a - b),
      },
    };
    setSavingOrder(order);
    // Optimistic update so the tick feels instant
    onStudentChange?.({ ...student, preferences });
    const { error } = await supabase.from('students').update({ preferences }).eq('id', student.id);
    setSavingOrder(null);
    if (error) {
      onStudentChange?.(student);
      toast({ title: 'Could not save progress', description: error.message, variant: 'destructive' });
    }
  };

  const shell = 'rounded-2xl p-6';
  const shellStyle = { background: 'rgba(30,41,59,0.45)', border: '1px solid var(--line-2)', backdropFilter: 'blur(8px)' };

  if (loading) return <div className={`${shell} h-40 animate-pulse`} style={shellStyle} />;

  if (!student?.country || !destination) {
    return (
      <div className={`${shell} flex flex-col sm:flex-row sm:items-center justify-between gap-4`} style={shellStyle}>
        <div className="flex items-center gap-3">
          <Map className="w-5 h-5 text-blue-400" />
          <div>
            <h2 className="font-display font-bold text-white">Your application roadmap</h2>
            <p className="text-sm text-slate-400">Choose a destination to get a step-by-step plan you can tick off.</p>
          </div>
        </div>
        <Link to="/dashboard/countries" className="text-sm text-blue-300 hover:text-blue-200 inline-flex items-center gap-1">
          Choose destination <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className={shell} style={shellStyle}>
        <h2 className="font-display font-bold text-white">{destination.name} roadmap</h2>
        <p className="text-sm text-slate-400 mt-1">Our team is preparing the {destination.name} roadmap. Message your advisor for the current steps.</p>
      </div>
    );
  }

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={shell} style={shellStyle}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
        <div>
          <p className="text-xs text-blue-300 font-semibold tracking-[0.16em] uppercase">Application roadmap</p>
          <h2 className="font-display font-bold text-white text-lg mt-1">{destination.name}: {pct}% complete</h2>
          {nextStep && <p className="text-sm text-slate-400 mt-1">Next: <span className="text-slate-200">{nextStep.title}</span>{nextStep.typical_timeline ? ` · ${nextStep.typical_timeline}` : ''}</p>}
          {!nextStep && <p className="text-sm text-emerald-300 mt-1">All steps done. Safe travels!</p>}
        </div>
        <Link to={`/destinations/${destination.slug}`} className="text-sm text-blue-300 hover:text-blue-200 inline-flex items-center gap-1 shrink-0">
          Full {destination.name} guide <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden mb-5" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <motion.div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
      </div>

      <ol className="space-y-2">
        {steps.map(step => {
          const isDone = done.has(step.order);
          const isOpen = expanded === step.order;
          return (
            <li key={step.order} className={`rounded-xl border transition-colors ${isDone ? 'border-emerald-500/25 bg-emerald-500/[0.06]' : 'border-slate-800 bg-slate-950/40'}`}>
              <div className="flex items-start gap-3 p-3">
                <button
                  type="button"
                  onClick={() => toggle(step.order)}
                  disabled={savingOrder !== null}
                  aria-label={isDone ? `Mark "${step.title}" as not done` : `Mark "${step.title}" as done`}
                  className="mt-0.5 shrink-0 disabled:opacity-60"
                >
                  {savingOrder === step.order
                    ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                    : isDone ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />}
                </button>
                <button type="button" onClick={() => setExpanded(isOpen ? null : step.order)} className="flex-1 text-left min-w-0">
                  <span className={`block text-sm font-medium ${isDone ? 'text-slate-400 line-through decoration-slate-600' : 'text-white'}`}>{step.title}</span>
                  {step.typical_timeline && <span className="block text-xs text-slate-500 mt-0.5">{step.typical_timeline}</span>}
                </button>
              </div>
              {isOpen && (
                <div className="px-11 pb-4 -mt-1 space-y-3">
                  {step.description && <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>}
                  {step.docs_required?.length > 0 && (
                    <ul className="flex flex-wrap gap-1.5">
                      {step.docs_required.map(doc => (
                        <li key={doc} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                          <FileText className="w-3 h-3 text-slate-500" />{doc}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </motion.section>
  );
};

export default RoadmapTracker;

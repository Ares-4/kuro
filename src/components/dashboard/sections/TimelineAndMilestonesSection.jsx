import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Flag, Plane, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const TimelineAndMilestonesSection = ({ studentId }) => {
  const [loading, setLoading] = useState(true);
  const [intakeMonth, setIntakeMonth] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    if (studentId) fetchData();
  }, [studentId]);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('students').select('preferences').eq('id', studentId).single();
    
    if (data?.preferences?.intake_month) {
      const month = data.preferences.intake_month;
      setIntakeMonth(month);
      
      // Calculate countdown (Assuming intake is in current or next year)
      const now = new Date();
      const currentYear = now.getFullYear();
      let targetDate = new Date(`${month} 1, ${currentYear}`);
      if (targetDate < now) {
        targetDate = new Date(`${month} 1, ${currentYear + 1}`);
      }
      
      const diffTime = Math.abs(targetDate - now);
      setDaysRemaining(Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }
    setLoading(false);
  };

  if (loading) return <div className="h-48 bg-slate-800/50 rounded-xl animate-pulse" />;

  if (!intakeMonth) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center h-full flex flex-col justify-center items-center">
        <Calendar className="w-10 h-10 text-slate-500 mb-3" />
        <p className="text-slate-400">Set your intake preference to see your timeline.</p>
      </div>
    );
  }

  const milestones = [
    { label: "Application Deadline", offset: -6, icon: Flag, status: "past" },
    { label: "Visa Submission", offset: -3, icon: CheckCircle2, status: "current" },
    { label: "Expected Arrival", offset: 0, icon: Plane, status: "future" }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 h-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-white">Timeline</h2>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-400">{daysRemaining}</div>
          <div className="text-xs text-slate-500">Days to Intake</div>
        </div>
      </div>

      <div className="relative pl-4 border-l-2 border-slate-700 space-y-8">
        {milestones.map((m, i) => (
          <div key={i} className="relative">
            <div className={`absolute -left-[21px] top-1 w-4 h-4 rounded-full border-2 ${
              m.status === 'past' ? 'bg-green-500 border-green-500' :
              m.status === 'current' ? 'bg-blue-500 border-blue-500 animate-pulse' :
              'bg-slate-900 border-slate-600'
            }`} />
            
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${m.status === 'current' ? 'bg-blue-900/30 text-blue-400' : 'bg-slate-900 text-slate-500'}`}>
                <m.icon className="w-4 h-4" />
              </div>
              <div>
                <h4 className={`text-sm font-semibold ${m.status === 'future' ? 'text-slate-400' : 'text-white'}`}>{m.label}</h4>
                <p className="text-xs text-slate-500">{m.offset === 0 ? intakeMonth : `${Math.abs(m.offset)} months before`}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default TimelineAndMilestonesSection;
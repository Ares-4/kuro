import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress-tracker'; // Ensure component exists or use native

const steps = [
  { id: 1, name: "Consultation", description: "Initial assessment and strategy" },
  { id: 2, name: "Selection", description: "Choosing universities and programs" },
  { id: 3, name: "Application", description: "Submitting documents and forms" },
  { id: 4, name: "Admission", description: "Waiting for offer letters" },
  { id: 5, name: "Visa", description: "Visa application process" },
  { id: 6, name: "Relocation", description: "Travel and settlement" }
];

const ApplicationStatusSection = ({ studentId }) => {
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [application, setApplication] = useState(null);

  useEffect(() => {
    if (studentId) fetchStatus();
  }, [studentId]);

  const fetchStatus = async () => {
    setLoading(true);
    // Fetch latest application
    const { data } = await supabase
      .from('applications')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setApplication(data);
      // Map status/progress_step to our 1-6 steps
      // Assuming 'progress_step' exists in DB or we derive it
      setCurrentStep(data.progress_step || 1);
    }
    setLoading(false);
  };

  if (loading) return <div className="h-48 bg-slate-800/50 rounded-xl animate-pulse" />;

  if (!application) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
        <h3 className="text-xl font-bold text-white mb-2">No Active Application</h3>
        <p className="text-slate-400 mb-4">Start your journey today by applying to a program.</p>
        <Button variant="outline" className="border-blue-500 text-blue-400">Browse Programs</Button>
      </div>
    );
  }

  const progress = (currentStep / steps.length) * 100;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Application Status</h2>
          <p className="text-sm text-slate-400">Track your progress to {application.program_name || 'University'}</p>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-2xl font-bold text-blue-400">{Math.round(progress)}%</div>
          <div className="text-xs text-slate-500">Completed</div>
        </div>
      </div>

      <div className="relative mb-8">
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-600 to-green-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500 overflow-x-auto pb-2">
          {steps.map((step) => (
            <div key={step.id} className={`flex flex-col items-center min-w-[60px] ${step.id <= currentStep ? 'text-blue-400 font-medium' : ''}`}>
              <span>{step.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-lg p-4 flex items-start gap-4 border border-slate-700">
        <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400 shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-white mb-1">Current Stage: {steps[currentStep - 1].name}</h3>
          <p className="text-sm text-slate-400 mb-3">{steps[currentStep - 1].description}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Next: {steps[currentStep] ? steps[currentStep].name : 'Completion'}</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ApplicationStatusSection;
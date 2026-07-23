import React from 'react';
import { motion } from 'framer-motion';
import { Check, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  { id: 1, label: "Submitted" },
  { id: 2, label: "Payment" },
  { id: 3, label: "Docs Verified" },
  { id: 4, label: "Visa Approved" }
];

const ProgressTracker = ({ currentStep = 1, className }) => {
  // Ensure step is within bounds (max 4 now)
  const activeStep = Math.min(Math.max(currentStep, 1), 4);

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative flex justify-between">
        {/* Connecting Line Background */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-700 -translate-y-1/2 rounded-full z-0" />
        
        {/* Active Progress Line */}
        <motion.div 
          className="absolute top-1/2 left-0 h-1 bg-blue-500 -translate-y-1/2 rounded-full z-0"
          initial={{ width: '0%' }}
          animate={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {/* Steps */}
        {steps.map((step, index) => {
          const isCompleted = step.id < activeStep;
          const isActive = step.id === activeStep;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 group">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isCompleted || isActive ? '#3b82f6' : '#1e293b', // blue-500 : slate-800
                  borderColor: isCompleted || isActive ? '#3b82f6' : '#475569', // blue-500 : slate-600
                  scale: isActive ? 1.1 : 1
                }}
                className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors duration-300",
                  "bg-slate-800 border-slate-600"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-white" />
                ) : isActive ? (
                  <Clock className="w-4 h-4 text-white animate-pulse" />
                ) : (
                  <span className="text-xs text-slate-400 font-medium">{step.id}</span>
                )}
              </motion.div>
              
              <span className={cn(
                "absolute top-10 text-xs font-medium whitespace-nowrap transition-colors duration-300",
                isActive ? "text-blue-400" : isCompleted ? "text-slate-300" : "text-slate-500"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Also export as Progress for compatibility with imports that expect it
export const Progress = ProgressTracker;
export { ProgressTracker };
export default ProgressTracker;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress-tracker';

const ChecklistGroup = ({ title, items, onToggle }) => {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <div className="mb-4">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full p-2 hover:bg-slate-800/50 rounded-lg transition-colors">
        <h4 className="font-semibold text-slate-300 text-sm">{title}</h4>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>
      
      {isOpen && (
        <div className="space-y-2 mt-2 pl-2">
          {items.map((item, idx) => (
            <div key={idx} onClick={() => onToggle(item.id)} className="flex items-center gap-3 p-2 cursor-pointer hover:bg-slate-800/30 rounded-lg group">
              {item.completed ? (
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-slate-600 group-hover:text-slate-400 shrink-0" />
              )}
              <span className={`text-sm ${item.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                {item.name}
              </span>
            </div>
          ))}
          {items.length === 0 && <p className="text-xs text-slate-600 pl-2">No documents required.</p>}
        </div>
      )}
    </div>
  );
};

const DocumentsChecklistSection = ({ studentId }) => {
  const [loading, setLoading] = useState(true);
  // Mock data structure, ideally fetch from DB
  const [documents, setDocuments] = useState({
    application: [
      { id: 1, name: "Passport Copy", completed: true },
      { id: 2, name: "High School Transcripts", completed: false },
      { id: 3, name: "English Proficiency Test", completed: false }
    ],
    visa: [
      { id: 4, name: "Bank Statement", completed: false },
      { id: 5, name: "Visa Application Form", completed: false }
    ],
    relocation: [
      { id: 6, name: "Flight Ticket", completed: false }
    ]
  });

  useEffect(() => {
    // Simulate fetch
    setTimeout(() => setLoading(false), 500);
  }, []);

  const toggleDoc = (id) => {
    // In real app, update DB here
    const updateGroup = (group) => group.map(d => d.id === id ? { ...d, completed: !d.completed } : d);
    
    setDocuments(prev => ({
      application: updateGroup(prev.application),
      visa: updateGroup(prev.visa),
      relocation: updateGroup(prev.relocation)
    }));
  };

  if (loading) return <div className="h-64 bg-slate-800/50 rounded-xl animate-pulse" />;

  const allDocs = [...documents.application, ...documents.visa, ...documents.relocation];
  const completedCount = allDocs.filter(d => d.completed).length;
  const progress = Math.round((completedCount / allDocs.length) * 100) || 0;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-1">Documents</h2>
        <div className="flex justify-between items-end mb-2">
          <p className="text-sm text-slate-400">Required for your journey</p>
          <span className="text-sm font-medium text-blue-400">{progress}% Done</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <ChecklistGroup title="Application" items={documents.application} onToggle={toggleDoc} />
        <ChecklistGroup title="Visa Processing" items={documents.visa} onToggle={toggleDoc} />
        <ChecklistGroup title="Relocation" items={documents.relocation} onToggle={toggleDoc} />
      </div>
    </motion.div>
  );
};

export default DocumentsChecklistSection;
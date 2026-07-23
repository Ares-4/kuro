import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { motion } from 'framer-motion';
import { Search, MapPin, Clock, DollarSign, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDuration } from '@/lib/utils';

const ProgramsView = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const { data, error } = await supabase
          .from('programs')
          .select('*')
          .eq('is_active', true);
        
        if (error) throw error;
        setPrograms(data || []);
      } catch (error) {
        console.error('Error fetching programs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const handleApply = (programId) => {
    navigate(`/dashboard/apply/${programId}`);
  };

  const filteredPrograms = programs.filter(p => 
    p.program_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <BackButton label="Back to Dashboard" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Academic Programs</h1>
          <p className="text-slate-400">Explore opportunities in Poland, Latvia, Lithuania, Germany, and Hungary</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input 
            placeholder="Search programs or countries..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center text-white py-12">Loading programs...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden flex flex-col hover:border-blue-500/50 transition-all"
            >
              <div className="h-48 bg-slate-700 relative">
                {program.image_url ? (
                  <img src={program.image_url} alt={program.program_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-600">
                    <BookOpen className="w-12 h-12 text-slate-400" />
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                  {program.degree_level}
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-blue-400 text-sm font-medium mb-2">
                  <MapPin className="w-4 h-4" /> {program.university}, {program.country}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{program.program_name}</h3>
                
                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-center gap-3 text-slate-300 text-sm">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>{formatDuration(program.duration)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300 text-sm">
                    <DollarSign className="w-4 h-4 text-slate-500" />
                    <span>{formatCurrency(program.tuition_fee, program.currency)}/year</span>
                  </div>
                </div>

                <Button onClick={() => handleApply(program.id)} className="w-full bg-blue-600 hover:bg-blue-700">
                  View Details & Apply
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgramsView;
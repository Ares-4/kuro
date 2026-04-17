import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Wallet, Calendar, GraduationCap, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const DestinationInfoSection = ({ studentId }) => {
  const [loading, setLoading] = useState(true);
  const [destination, setDestination] = useState(null);
  const [countryInfo, setCountryInfo] = useState(null);

  useEffect(() => {
    if (studentId) fetchData();
  }, [studentId]);

  const fetchData = async () => {
    setLoading(true);
    // 1. Get student's target destination
    const { data: student } = await supabase.from('students').select('country').eq('id', studentId).single();
    
    if (student?.country) {
      setDestination(student.country);
      
      // 2. Get destination details
      // Assuming country_info table uses country name as key or has 'country' column
      const { data: info } = await supabase
        .from('country_info')
        .select('*')
        .ilike('country', student.country)
        .maybeSingle();
        
      setCountryInfo(info || {});
    }
    setLoading(false);
  };

  if (loading) return <div className="h-48 bg-slate-800/50 rounded-xl animate-pulse" />;

  if (!destination) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center h-full">
        <MapPin className="w-10 h-10 text-slate-500 mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">No Destination Selected</h3>
        <Button variant="link" className="text-blue-400">Select a Destination</Button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{destination}</h2>
          <p className="text-sm text-slate-400">Your Target Destination</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400">
          <MapPin className="w-5 h-5" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Wallet className="w-3 h-3" /> Living Cost
          </div>
          <div className="font-semibold text-white text-sm">{countryInfo?.cost_of_living || 'N/A'}</div>
        </div>
        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Calendar className="w-3 h-3" /> Visa Time
          </div>
          <div className="font-semibold text-white text-sm">{countryInfo?.visa_requirements ? '4-8 Weeks' : 'N/A'}</div>
        </div>
      </div>

      <div className="mt-auto">
        <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Visa Requirements</h4>
        <p className="text-sm text-slate-300 line-clamp-3 mb-4">
          {countryInfo?.visa_requirements || "Standard student visa requirements apply. Check embassy for details."}
        </p>
        
        <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800" asChild>
          <Link to={`/destinations/${destination.toLowerCase()}`}>
            View Full Guide <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
};

export default DestinationInfoSection;
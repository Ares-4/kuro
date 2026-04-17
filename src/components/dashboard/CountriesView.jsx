import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { MapPin, FileText, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';

const CountriesView = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fallback data in case DB is empty or fails
  const fallbackCountries = [
    {
      name: "Poland",
      description: "A top destination for students offering high-quality education at affordable costs. Known for its rich history and vibrant student life.",
      benefits: ["Low cost of living", "Schengen area access", "Work while studying"],
      documents: ["High School Diploma", "Passport Copy", "English Proficiency Certificate"]
    },
    {
      name: "Germany",
      description: "World-renowned for engineering and technology. Public universities often have low or no tuition fees for international students.",
      benefits: ["Tuition-free universities", "Strong economy", "Post-study work visa"],
      documents: ["Abitur equivalent", "Language Certificate (German/English)", "Blocked Account (Finances)"]
    },
    {
      name: "Latvia",
      description: "An emerging educational hub in the Baltics with modern facilities and degrees recognized worldwide.",
      benefits: ["Affordable tuition", "EU member state", "Multi-cultural environment"],
      documents: ["Education Transcripts", "Passport Photo", "Medical Certificate"]
    },
    {
      name: "Lithuania",
      description: "Offers a unique blend of historical heritage and modern innovation. Great for tech and medical studies.",
      benefits: ["Fast internet", "Start-up friendly", "English-taught programs"],
      documents: ["Diploma legalization", "Bank Statement", "Application Fee Receipt"]
    },
    {
      name: "Hungary",
      description: "Known for its medical and dentistry programs. Budapest is considered one of the best student cities in Europe.",
      benefits: ["Stipendium Hungaricum", "Central European location", "Vibrant culture"],
      documents: ["Health Insurance", "Entrance Exam Results", "Motivation Letter"]
    }
  ];

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('country_info')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        // Transform DB data to match UI structure if necessary
        // Assuming DB has 'highlights' for benefits and 'visa_requirements' for documents
        const formattedData = data.map(c => ({
          name: c.country,
          description: c.description,
          benefits: c.highlights || [],
          // If visa_requirements is text, wrap in array, or split if it's newline separated
          documents: Array.isArray(c.visa_requirements) 
            ? c.visa_requirements 
            : (c.visa_requirements ? [c.visa_requirements] : [])
        }));
        setCountries(formattedData);
      } else {
        // Fallback if DB is empty
        console.warn("No countries found in database, using fallback data.");
        setCountries(fallbackCountries);
      }
    } catch (err) {
      console.error('Error fetching countries:', err);
      // Fallback on error to ensure reliability
      setCountries(fallbackCountries);
      // Optionally set error state if we want to show a warning, 
      // but requirement says "ensure countries load reliably every time", so maybe just silent fallback is better UX
      // setError("Could not load latest data from server. Showing offline data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <BackButton label="Back to Dashboard" />
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Study Destinations</h1>
          <p className="text-slate-400">Everything you need to know about your future home.</p>
        </div>
        {loading && <Loader2 className="w-6 h-6 animate-spin text-blue-500" />}
      </div>

      {error && (
        <div className="bg-yellow-900/20 border border-yellow-700 text-yellow-200 p-4 rounded flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="grid gap-6">
        {countries.map((country, index) => (
          <motion.div
            key={country.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden"
          >
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value={`item-${index}`} className="border-0">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-800/50">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{country.name}</h3>
                      <p className="text-sm text-slate-400 font-normal">Click to explore requirements</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2 bg-slate-900/30">
                  <div className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                      {country.description}
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-white flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400" /> Key Benefits
                        </h4>
                        {country.benefits && country.benefits.length > 0 ? (
                          <ul className="space-y-2">
                            {country.benefits.map((benefit, i) => (
                              <li key={i} className="text-slate-400 text-sm flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 shrink-0" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-slate-500 italic text-sm">No specific benefits listed.</p>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-semibold text-white flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-400" /> Required Documents
                        </h4>
                        {country.documents && country.documents.length > 0 ? (
                           <ul className="space-y-2">
                            {country.documents.map((doc, i) => (
                              <li key={i} className="text-slate-400 text-sm flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 shrink-0" />
                                {doc}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-slate-500 italic text-sm">Contact support for document list.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CountriesView;
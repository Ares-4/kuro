import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { 
  Building2, 
  MapPin, 
  Clock, 
  DollarSign, 
  GraduationCap, 
  Languages, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { useToast } from '@/components/ui/use-toast';

const ApplicationForm = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    let channel;

    const fetchProgram = async () => {
      try {
        const { data, error } = await supabase
          .from('programs')
          .select('*')
          .eq('id', programId)
          .single();

        if (error) throw error;
        setProgram(data);
      } catch (error) {
        console.error('Error fetching program:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load program details. Please try again."
        });
        navigate('/dashboard/programs');
      } finally {
        setLoading(false);
      }
    };

    if (programId) {
      fetchProgram();

      // Real-time subscription for immediate updates from Admin changes
      channel = supabase
        .channel(`public:programs:${programId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'programs',
            filter: `id=eq.${programId}`,
          },
          (payload) => {
            setProgram(payload.new);
            toast({
              title: "Program Updated",
              description: "Course details have been updated by the administration.",
            });
          }
        )
        .subscribe();
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [programId, navigate, toast]);

  const handleStartApplication = async () => {
    if (!user) return;
    setSubmitting(true);

    try {
      // 1. Get or Create Student Profile
      // This logic fixes the "Could not find student profile" error by creating one if it's missing
      let studentId;
      
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (studentData) {
        studentId = studentData.id;
      } else {
        console.log("Student profile missing in ApplicationForm, attempting to create...");
        const { data: newStudent, error: createError } = await supabase
          .from('students')
          .insert([{
            user_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student',
            created_at: new Date().toISOString()
          }])
          .select('id')
          .single();

        if (createError) {
          // Handle specific Foreign Key violation (23503) which usually means stale session
          if (createError.code === '23503') {
            toast({
              variant: "destructive",
              title: "Authentication Error",
              description: "Your session appears to be invalid. Please sign out and sign in again."
            });
            // Optional: Automatically sign out if critical auth mismatch
            // await signOut(); 
            // navigate('/login');
            throw new Error("Session invalid. Please re-login.");
          }
          
          console.error("Critical error creating profile:", createError);
          throw new Error("Could not initialize student profile. Please verify your account settings.");
        }
        studentId = newStudent.id;
      }

      // 2. Check if already applied
      const { data: existingApp } = await supabase
        .from('applications')
        .select('id')
        .eq('student_id', studentId)
        .eq('program_id', programId)
        .maybeSingle();

      if (existingApp) {
        toast({
          title: "Application Exists",
          description: "You have already started an application for this program. Redirecting...",
        });
        navigate(`/dashboard/application/${existingApp.id}`);
        return;
      }

      // 3. Create Application (Initial 'draft' state)
      const { data: newApp, error: insertError } = await supabase
        .from('applications')
        .insert([{
          student_id: studentId,
          program_id: programId,
          status: 'draft', 
          progress_step: 0, 
          payment_status: 'pending',
          documents: {} 
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: "Application Started! 🚀",
        description: "Please upload your required documents to complete the submission.",
      });

      navigate(`/dashboard/application/${newApp.id}`);

    } catch (error) {
      console.error('Submission error:', error);
      toast({
        variant: "destructive",
        title: "Failed to start application",
        description: error.message || "Something went wrong. Please try again."
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
        <p>Loading program details...</p>
      </div>
    );
  }

  if (!program) return null;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <BackButton label="Back to Programs" to="/dashboard/programs" />

      <div className="grid lg:grid-cols-3 gap-8 mt-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden shadow-2xl"
          >
            {/* Hero Image */}
            <div className="h-72 relative bg-slate-700 group">
              {program.image_url ? (
                <img src={program.image_url} alt={program.program_name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-600">
                  <GraduationCap className="w-16 h-16 text-slate-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-500/30 backdrop-blur-md">
                    {program.degree_level}
                  </div>
                  {program.is_active === false && (
                    <div className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-bold uppercase tracking-wider border border-yellow-500/30 backdrop-blur-md">
                      Currently Unavailable
                    </div>
                  )}
                </div>
                <h1 className="text-4xl font-bold text-white mb-2 shadow-sm">{program.program_name}</h1>
                <div className="flex items-center text-slate-300 font-medium">
                  <Building2 className="w-5 h-5 mr-2 text-blue-400" />
                  {program.university}, {program.country}
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-700 border-b border-slate-700">
              <div className="p-4 bg-slate-900/80 backdrop-blur-sm">
                <div className="text-xs text-slate-400 mb-1 flex items-center gap-1 uppercase tracking-wider font-semibold"><Clock className="w-3.5 h-3.5" /> Duration</div>
                <div className="font-medium text-white text-lg">{program.duration}</div>
              </div>
              <div className="p-4 bg-slate-900/80 backdrop-blur-sm">
                <div className="text-xs text-slate-400 mb-1 flex items-center gap-1 uppercase tracking-wider font-semibold"><Languages className="w-3.5 h-3.5" /> Language</div>
                <div className="font-medium text-white text-lg">{program.language}</div>
              </div>
              <div className="p-4 bg-slate-900/80 backdrop-blur-sm">
                <div className="text-xs text-slate-400 mb-1 flex items-center gap-1 uppercase tracking-wider font-semibold"><DollarSign className="w-3.5 h-3.5" /> Tuition</div>
                <div className="font-medium text-white text-lg">{program.tuition_fee}</div>
              </div>
              <div className="p-4 bg-slate-900/80 backdrop-blur-sm">
                <div className="text-xs text-slate-400 mb-1 flex items-center gap-1 uppercase tracking-wider font-semibold"><MapPin className="w-3.5 h-3.5" /> Location</div>
                <div className="font-medium text-white text-lg">{program.country}</div>
              </div>
            </div>

            {/* Description */}
            <div className="p-8 border-b border-slate-700 bg-slate-900/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                About the Program
              </h3>
              <div className="prose prose-invert prose-slate max-w-none">
                <p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg">
                  {program.description || "No description available for this program."}
                </p>
              </div>
            </div>

            {/* Requirements */}
            <div className="p-8 bg-slate-900/50">
              <h3 className="text-xl font-bold text-white mb-6">Requirements & Eligibility</h3>
              <div className="bg-slate-950 rounded-xl p-6 border border-slate-800">
                {program.requirements && program.requirements.length > 0 ? (
                  <ul className="grid md:grid-cols-2 gap-4">
                    {program.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800/50">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-slate-300 font-medium">{req}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="space-y-3">
                    {['Valid Passport Copy', 'High School Diploma/Bachelor Certificate', 'Academic Transcripts', 'English Proficiency Certificate', 'CV / Resume'].map((req, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-slate-300">{req}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-6 pt-6 border-t border-slate-800 flex gap-3 items-start">
                   <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
                      <AlertCircle className="w-5 h-5 text-blue-400" />
                   </div>
                   <p className="text-sm text-slate-400 leading-relaxed">
                     <span className="text-blue-200 font-semibold block mb-1">Important Note</span>
                     Starting this application will save a draft in your dashboard. You will need to upload digital copies of all required documents in the next step before your application can be sent for review.
                   </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar Summary & Action */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 sticky top-6 shadow-xl"
          >
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              Application Summary
            </h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-sm p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <span className="text-slate-400">Application Fee</span>
                <span className="text-white font-mono font-bold text-lg">
                  {program.application_fee || '€250'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <span className="text-slate-400">Processing Time</span>
                <span className="text-white font-medium">
                  {program.processing_time || '2-4 Weeks'}
                </span>
              </div>
              
              <div className="pt-4 mt-2">
                <div className="flex justify-between items-end mb-1">
                   <span className="text-slate-300 font-semibold">Total Due Now</span>
                   <span className="text-green-400 font-bold text-2xl">
                     €0.00
                   </span>
                </div>
                <p className="text-[11px] text-slate-500 text-right">* Fee will be paid after initial document review</p>
              </div>
            </div>

            <div className="space-y-4">
               <div 
                 className={`flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer ${
                   agreed 
                     ? 'bg-blue-900/20 border-blue-500/50' 
                     : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                 }`}
                 onClick={() => setAgreed(!agreed)}
               >
                  <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${agreed ? 'bg-blue-600 border-blue-600' : 'border-slate-500'}`}>
                    {agreed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <p className="text-xs text-slate-300 select-none leading-relaxed">
                    I confirm that I meet the eligibility criteria and understand I must upload valid documents in the next step.
                  </p>
               </div>

              <Button 
                className="w-full h-14 text-base font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.02] disabled:hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleStartApplication}
                disabled={!agreed || submitting || program.is_active === false}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creating Application...
                  </>
                ) : (
                  <>
                    Start Application <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
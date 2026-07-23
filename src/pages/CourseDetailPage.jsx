import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Building2, MapPin, Clock, DollarSign, Globe, CheckCircle2, ArrowRight, Loader2, FileText, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency, formatDuration } from '@/lib/utils';

const CourseDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data, error } = await supabase
          .from('programs')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setCourse(data);
      } catch (error) {
        console.error("Error fetching course:", error);
        toast({ variant: "destructive", title: "Error", description: "Course not found." });
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, toast]);

  const handleApply = async () => {
    if (!user) {
      toast({ title: "Please Login", description: "You need to log in to apply for this course." });
      navigate(`/login?redirect=/courses/${id}`);
      return;
    }

    setApplying(true);
    try {
      // Check for student profile
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (studentError || !student) {
         // Should ideally redirect to profile creation, but assuming it exists or handling gracefully
         toast({ variant: "destructive", title: "Profile Missing", description: "Please complete your student profile first." });
         navigate('/dashboard/settings');
         return;
      }

      // Check existing application
      const { data: existingApp } = await supabase
        .from('applications')
        .select('id')
        .eq('student_id', student.id)
        .eq('program_id', id)
        .maybeSingle();

      if (existingApp) {
        navigate(`/dashboard/application/${existingApp.id}`);
        return;
      }

      // Create new application
      const { data: newApp, error: createError } = await supabase
        .from('applications')
        .insert([{
          student_id: student.id,
          program_id: id,
          status: 'draft',
          progress_step: 1,
          documents: {}
        }])
        .select()
        .single();

      if (createError) throw createError;

      toast({ title: "Application Started", description: "Redirecting to your application dashboard..." });
      navigate(`/dashboard/application/${newApp.id}`);

    } catch (error) {
      console.error("Apply error:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not start application." });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center flex-col gap-4 text-white">
        <h1 className="text-2xl font-bold">Course Not Found</h1>
        <Link to="/destinations"><Button>Browse Other Courses</Button></Link>
      </div>
    );
  }

  const requirementsList = course.requirements || [
    "High School Diploma or equivalent",
    "Passport Copy",
    "English Proficiency Certificate"
  ];

  return (
    <>
      <Helmet>
        <title>{course.program_name} at {course.university} | Apply Now</title>
        <meta name="description" content={`Apply for ${course.program_name} in ${course.country}. Tuition: ${formatCurrency(course.tuition_fee, course.currency)}.`} />
      </Helmet>

      <div className="min-h-screen bg-slate-950 pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          {/* Header */}
          <div className="mb-8">
             <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                <Link to="/destinations" className="hover:text-blue-400">Destinations</Link> 
                <span>/</span>
                <span className="text-white">{course.country}</span>
             </div>
             <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{course.program_name}</h1>
             <div className="flex flex-wrap items-center gap-6 text-slate-300">
                <div className="flex items-center gap-2">
                   <Building2 className="w-5 h-5 text-blue-400" />
                   <span className="font-medium text-lg">{course.university}</span>
                </div>
                <div className="flex items-center gap-2">
                   <MapPin className="w-5 h-5 text-blue-400" />
                   <span>{course.country}</span>
                </div>
             </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-8">
               <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="aspect-video bg-slate-800 relative">
                     {course.image_url ? (
                        <img src={course.image_url} alt={course.program_name} className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                           <Building2 className="w-16 h-16" />
                        </div>
                     )}
                     <div className="absolute top-4 right-4">
                        <Badge className="bg-blue-600 hover:bg-blue-700 text-lg px-4 py-1">{course.degree_level}</Badge>
                     </div>
                  </div>
                  
                  <div className="p-8">
                     <h2 className="text-2xl font-bold text-white mb-4">About this Program</h2>
                     <p className="text-slate-300 leading-relaxed text-lg mb-8">
                        {course.description || "This program offers comprehensive training and education in the field, preparing students for a successful career internationally."}
                     </p>

                     <h3 className="text-xl font-bold text-white mb-4">Requirements</h3>
                     <ul className="space-y-3 mb-8">
                        {requirementsList.map((req, idx) => (
                           <li key={idx} className="flex items-start gap-3 text-slate-300">
                              <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                              <span>{req}</span>
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>
            </div>

            {/* Sidebar / Apply Card */}
            <div className="lg:col-span-1">
               <div className="sticky top-24 space-y-6">
                  <Card className="bg-slate-900 border-slate-800 shadow-xl">
                     <CardContent className="p-6 space-y-6">
                        <div className="space-y-4 pb-6 border-b border-slate-800">
                           <div className="flex justify-between items-center">
                              <span className="text-slate-400 flex items-center gap-2"><Clock className="w-4 h-4" /> Duration</span>
                              <span className="text-white font-medium">{formatDuration(course.duration)}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-slate-400 flex items-center gap-2"><Globe className="w-4 h-4" /> Language</span>
                              <span className="text-white font-medium">{course.language}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-slate-400 flex items-center gap-2"><FileText className="w-4 h-4" /> Processing</span>
                              <span className="text-white font-medium">{course.processing_time || "4-6 weeks"}</span>
                           </div>
                        </div>

                        <div>
                           <span className="text-slate-400 text-sm uppercase font-bold tracking-wider">Tuition Fee</span>
                           <div className="text-3xl font-bold text-white mt-1">
                             {formatCurrency(course.tuition_fee, course.currency)}
                           </div>
                           <span className="text-slate-500 text-sm">per academic year</span>
                        </div>

                        <Button 
                           size="lg" 
                           className="w-full bg-blue-600 hover:bg-blue-700 text-lg h-14"
                           onClick={handleApply}
                           disabled={applying}
                        >
                           {applying ? <Loader2 className="animate-spin w-5 h-5" /> : "Apply Now"}
                        </Button>

                        <p className="text-center text-slate-500 text-xs">
                           No payment required to start application.
                        </p>
                     </CardContent>
                  </Card>

                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 text-center">
                     <p className="text-slate-400 text-sm mb-2">Need help choosing?</p>
                     <Link to="/contact" className="text-blue-400 hover:underline text-sm font-medium">Contact an Advisor</Link>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseDetailPage;
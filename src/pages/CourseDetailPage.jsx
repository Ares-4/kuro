import React, { useState, useEffect } from 'react';
import { sizedImage } from '@/lib/imageUtils';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { breadcrumbs } from '@/lib/schema';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Building2, MapPin, Clock, Globe, CheckCircle2, ArrowRight, Loader2, FileText, CalendarDays, GraduationCap, Plane, Wallet, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency, formatDuration } from '@/lib/utils';

const titleCase = (value) =>
  String(value || '').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\bUk\b/, 'UK').replace(/\bUsa\b/, 'USA');

const formatDay = (iso) =>
  new Date(`${String(iso).slice(0, 10)}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// "3.5" or "3.5 years" -> "3.5-year " (adjective form for the summary sentence).
const durationPhrase = (duration) => {
  const years = parseFloat(String(duration || '').replace(',', '.'));
  return Number.isFinite(years) && years > 0 && years < 10 ? `${years}-year ` : '';
};

const InfoTile =({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
    <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400"><Icon className="w-4 h-4 text-blue-400" />{label}</p>
    <p className="mt-1.5 text-slate-200">{value}</p>
  </div>
);

const CourseDetailPage = () => {
  const { id } = useParams();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [course, setCourse] = useState(null);
  const [universityId, setUniversityId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [related, setRelated] = useState({ destination: null, visa: null, deadlines: [], scholarships: [], siblings: [] });

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

        if (data?.university) {
          const { data: uni } = await supabase.from('universities').select('id').ilike('name', data.university.trim()).maybeSingle();
          setUniversityId(uni?.id || null);
        }
        if (data) loadRelated(data);
      } catch (error) {
        console.error("Error fetching course:", error);
        toast({ variant: "destructive", title: "Error", description: "Course not found." });
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, toast]);

  // Country-level context (costs, visa, deadlines, scholarships) and sibling
  // courses: real data that makes each course page useful on its own, even when
  // the programme itself has only a short description.
  const loadRelated = async (program) => {
    const countryName = titleCase(program.country);
    const today = new Date().toISOString().slice(0, 10);
    const [destination, deadlines, scholarships, siblings] = await Promise.all([
      supabase.from('destinations').select('name, slug, tuition_cost, living_cost').ilike('name', countryName).eq('is_active', true).maybeSingle(),
      supabase.from('university_deadlines').select('id, university_name, program_name, deadline_date, intake_season, intake_year')
        .ilike('country', countryName).eq('is_active', true).gte('deadline_date', today).order('deadline_date').limit(3),
      supabase.from('scholarships').select('id, title, amount, deadline, countries').eq('is_active', true).limit(60),
      supabase.from('programs').select('id, program_name, degree_level, tuition_fee, currency')
        .eq('university', program.university).eq('is_active', true).neq('id', program.id).limit(6),
    ]);
    let visa = null;
    if (destination.data?.slug) {
      const { data: visaRow } = await supabase.from('destination_visa_info')
        .select('visa_type, processing_time, cost, official_link').eq('destination_slug', destination.data.slug).maybeSingle();
      visa = visaRow;
    }
    const lowerCountry = countryName.toLowerCase();
    setRelated({
      destination: destination.data || null,
      visa,
      deadlines: deadlines.data || [],
      scholarships: (scholarships.data || [])
        .filter((sch) => (!sch.deadline || sch.deadline >= today) && (sch.countries || []).some((c) => String(c).toLowerCase() === lowerCountry))
        .slice(0, 3),
      siblings: siblings.data || [],
    });
  };

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

  const requirementsList = Array.isArray(course.requirements) && course.requirements.length
    ? course.requirements
    : ["High school diploma or equivalent", "Passport copy", "English proficiency certificate"];

  const countryName = titleCase(course.country);
  const destinationSlug = related.destination?.slug;
  const tuition = course.tuition_fee ? formatCurrency(course.tuition_fee, course.currency) : null;
  const summary = [
    `${course.program_name} is a ${durationPhrase(course.duration)}${course.degree_level ? `${course.degree_level.toLowerCase()} ` : ''}programme${course.language ? ` taught in ${course.language}` : ''} at ${course.university}.`,
    tuition && `Tuition is ${tuition} per academic year.`,
    course.application_fee && `The application fee is ${course.application_fee}.`,
    course.processing_time && `Applications through Kuro are typically processed in ${course.processing_time.toLowerCase()}.`,
  ].filter(Boolean).join(' ');

  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.program_name,
    description: course.description || summary,
    provider: { '@type': 'CollegeOrUniversity', name: course.university },
    ...(course.language ? { inLanguage: course.language } : {}),
    ...(course.degree_level ? { educationalCredentialAwarded: course.degree_level } : {}),
    ...(course.tuition_fee ? { offers: { '@type': 'Offer', category: 'Tuition', price: course.tuition_fee, priceCurrency: course.currency || 'EUR' } } : {}),
  };

  return (
    <>
      <Helmet>
        <title>{course.program_name} at {course.university} | Apply Now</title>
        <meta name="description" content={`${course.degree_level || 'Study'} ${course.program_name} at ${course.university}.${tuition ? ` Tuition ${tuition}/year.` : ''} Entry requirements, visa, deadlines and how to apply with Kuro.`} />
        <script type="application/ld+json">{JSON.stringify(courseSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbs([['Courses', '/courses'], [course.program_name, pathname]]))}</script>
      </Helmet>

      <div className="min-h-screen bg-slate-950 pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          {/* Header */}
          <div className="mb-8">
             <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                <Link to="/destinations" className="hover:text-blue-400">Destinations</Link> 
                <span>/</span>
                {destinationSlug ? (
                  <Link to={`/destinations/${destinationSlug}`} className="text-white hover:text-blue-400">{countryName}</Link>
                ) : (
                  <span className="text-white">{countryName}</span>
                )}
             </div>
             <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{course.program_name}</h1>
             <div className="flex flex-wrap items-center gap-6 text-slate-300">
                <div className="flex items-center gap-2">
                   <Building2 className="w-5 h-5 text-blue-400" />
                   {universityId ? (
                     <Link to={`/universities/${universityId}`} className="font-medium text-lg hover:text-blue-400 transition-colors">{course.university}</Link>
                   ) : (
                     <span className="font-medium text-lg">{course.university}</span>
                   )}
                </div>
                <div className="flex items-center gap-2">
                   <MapPin className="w-5 h-5 text-blue-400" />
                   <span>{countryName}</span>
                </div>
             </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-8">
               <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="aspect-video bg-slate-800 relative">
                     {course.image_url ? (
                        <img src={sizedImage(course.image_url, 1200)} alt={course.program_name} className="w-full h-full object-cover" fetchPriority="high" decoding="async" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                           <Building2 className="w-16 h-16" />
                        </div>
                     )}
                     <div className="absolute top-4 right-4">
                        <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-4 py-1">{course.degree_level}</Badge>
                     </div>
                  </div>
                  
                  <div className="p-8">
                     <h2 className="text-2xl font-bold text-white mb-4">About this Program</h2>
                     <p className={`text-slate-300 leading-relaxed text-lg ${course.description ? 'mb-4' : 'mb-8'}`}>{summary}</p>
                     {course.description && (
                        <p className="text-slate-300 leading-relaxed text-lg mb-8 whitespace-pre-line">{course.description}</p>
                     )}

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

               {(related.destination || related.visa) && (
                  <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                     <h2 className="text-2xl font-bold text-white mb-6">Studying in {countryName}</h2>
                     <div className="grid sm:grid-cols-2 gap-4">
                        {related.destination?.tuition_cost && <InfoTile icon={GraduationCap} label="Typical tuition" value={related.destination.tuition_cost} />}
                        {related.destination?.living_cost && <InfoTile icon={Wallet} label="Living costs" value={related.destination.living_cost} />}
                        {related.visa?.visa_type && <InfoTile icon={Plane} label="Student visa" value={related.visa.visa_type} />}
                        {related.visa?.processing_time && <InfoTile icon={Clock} label="Visa processing" value={related.visa.processing_time} />}
                     </div>
                     {related.visa?.cost && <p className="text-slate-400 text-sm mt-4">Visa fee: {related.visa.cost}</p>}
                     <div className="flex flex-wrap gap-4 mt-5 text-sm">
                        {destinationSlug && (
                           <Link to={`/destinations/${destinationSlug}`} className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300">
                              Full {countryName} guide <ArrowRight className="w-4 h-4" />
                           </Link>
                        )}
                        {related.visa?.official_link && (
                           <a href={related.visa.official_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200">
                              Official visa information <ExternalLink className="w-3.5 h-3.5" />
                           </a>
                        )}
                        <Link to="/intake-planner" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200">
                           Plan your 2027 intake <ArrowRight className="w-4 h-4" />
                        </Link>
                     </div>
                  </section>
               )}

               {(related.deadlines.length > 0 || related.scholarships.length > 0) && (
                  <section className="grid md:grid-cols-2 gap-6">
                     {related.deadlines.length > 0 && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                           <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-4"><CalendarDays className="w-5 h-5 text-blue-400" /> Upcoming {countryName} deadlines</h3>
                           <ul className="space-y-3">
                              {related.deadlines.map((d) => (
                                 <li key={d.id} className="text-sm">
                                    <p className="text-slate-200">{d.university_name}{d.program_name ? ` – ${d.program_name}` : ''}</p>
                                    <p className="text-slate-400">{formatDay(d.deadline_date)}{d.intake_season ? ` · ${d.intake_season} ${d.intake_year || ''}` : ''}</p>
                                 </li>
                              ))}
                           </ul>
                           <Link to="/deadlines" className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300">All deadlines</Link>
                        </div>
                     )}
                     {related.scholarships.length > 0 && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                           <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-4"><GraduationCap className="w-5 h-5 text-blue-400" /> Scholarships for {countryName}</h3>
                           <ul className="space-y-3">
                              {related.scholarships.map((sch) => (
                                 <li key={sch.id} className="text-sm">
                                    <Link to={`/scholarships/${sch.id}`} className="text-slate-200 hover:text-blue-400">{sch.title}</Link>
                                    <p className="text-slate-400">{sch.amount ? `${sch.amount} · ` : ''}Deadline {sch.deadline ? formatDay(sch.deadline) : 'rolling'}</p>
                                 </li>
                              ))}
                           </ul>
                           <Link to="/scholarships" className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300">All scholarships</Link>
                        </div>
                     )}
                  </section>
               )}

               {related.siblings.length > 0 && (
                  <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                     <h3 className="text-lg font-bold text-white mb-4">More programmes at {course.university}</h3>
                     <div className="grid sm:grid-cols-2 gap-3">
                        {related.siblings.map((p) => (
                           <Link key={p.id} to={`/courses/${p.id}`} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 hover:border-blue-500/40 transition-colors">
                              <p className="text-slate-200 font-medium">{p.program_name}</p>
                              <p className="text-slate-400 text-sm mt-1">{p.degree_level}{p.tuition_fee ? ` · ${formatCurrency(p.tuition_fee, p.currency)}/year` : ''}</p>
                           </Link>
                        ))}
                     </div>
                  </section>
               )}
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
                           <span className="text-slate-400 text-sm">per academic year</span>
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
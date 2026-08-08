import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Globe, Star, CheckCircle2, ArrowLeft, GraduationCap, ChevronRight } from 'lucide-react';
import UniversityMark from '@/components/UniversityMark';

const UniversityDetailPage = () => {
  const { id } = useParams();
  const [university, setUniversity] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    setLoading(true);
    const { data: uni } = await supabase
      .from('universities')
      .select('*, destinations(name, slug)')
      .eq('id', id)
      .single();
    setUniversity(uni || null);

    if (uni?.name) {
      const { data: progs } = await supabase
        .from('programs')
        .select('id, program_name, degree_level, duration, tuition_fee, currency')
        .ilike('university', uni.name.trim())
        .eq('is_active', true);
      setPrograms(progs || []);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!university) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center flex-col gap-4 text-white">
        <h1 className="text-2xl font-bold">University Not Found</h1>
        <Link to="/universities"><Button>Browse Universities</Button></Link>
      </div>
    );
  }

  const u = university;
  const destSlug = u.destinations?.slug;
  const destName = u.destinations?.name;

  return (
    <>
      <SEO
        title={u.name}
        description={u.description || `${u.name}${destName ? ` in ${destName}` : ''} — programs, admissions, and application guidance from Kuro Education Consultancy.`}
        image={u.image_url}
      />

      <div className="min-h-screen bg-slate-950 pt-24 pb-20 text-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Link to="/universities" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-400 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Universities
          </Link>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-8">
            <UniversityMark name={u.name} imageUrl={u.image_url} className="aspect-[3/1]" wrapperPadding="p-10 sm:p-14 md:p-16" />
            <div className="p-6 sm:p-8">
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-3">{u.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-slate-300">
                {destName && (
                  <Link to={destSlug ? `/destinations/${destSlug}` : '/destinations'} className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                    <MapPin className="w-4 h-4 text-blue-400" /> {destName}
                  </Link>
                )}
                {u.ranking && (
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400" /> Ranked #{u.ranking}
                  </span>
                )}
                {u.website && (
                  <a href={u.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                    <Globe className="w-4 h-4" /> Official website
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {u.description && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-white mb-3">About</h2>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line">{u.description}</p>
                </div>
              )}

              {u.admission_requirements?.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-white mb-3">Admission Requirements</h2>
                  <ul className="space-y-2.5">
                    {u.admission_requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-slate-300 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /> {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {programs.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-400" /> Programs at {u.name}
                  </h2>
                  <div className="space-y-2">
                    {programs.map(p => (
                      <Link key={p.id} to={`/courses/${p.id}`}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-800 hover:border-blue-500/40 hover:bg-slate-800/50 transition-colors group">
                        <div>
                          <p className="text-white font-medium text-sm">{p.program_name}</p>
                          <p className="text-slate-500 text-xs mt-0.5">{p.degree_level} · {p.duration}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
                <p className="text-slate-400 text-sm mb-3">Interested in {u.name}?</p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                  <Link to="/signup">Start your application</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UniversityDetailPage;

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Clock, ChevronRight, ShieldCheck, CheckCircle2, Plane, ExternalLink, CalendarCheck, FileText, AlertTriangle, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';
import { getCountryImageUrl } from '@/lib/imageUtils';
import { supabase } from '@/lib/customSupabaseClient';
import CountryUpdateCard from '@/components/CountryUpdateCard';

const DestinationTemplatePage = () => {
  const params = useParams();
  const rawSlug = (params && params.country) ? params.country : '';
  const slug = rawSlug ? rawSlug.toLowerCase().trim() : '';

  const [roadmap, setRoadmap] = useState(null);
  const [visaInfo, setVisaInfo] = useState(null);
  const [dbDest, setDbDest] = useState(null);
  const [countryUpdates, setCountryUpdates] = useState([]);

  useEffect(() => {
    if (!slug) return;
    const now = new Date().toISOString();
    Promise.all([
      supabase.from('destination_roadmaps').select('steps').eq('destination_slug', slug).maybeSingle(),
      supabase.from('destination_visa_info').select('*').eq('destination_slug', slug).maybeSingle(),
      supabase.from('destinations').select('*').eq('slug', slug).eq('is_active', true).maybeSingle(),
      supabase.from('country_updates').select('*')
        .eq('destination_slug', slug).eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order('created_at', { ascending: false }),
    ]).then(([r, v, d, u]) => {
      setRoadmap(r.data?.steps || null);
      setVisaInfo(v.data || null);
      setDbDest(d.data || null);
      setCountryUpdates(u.data || []);
    });
  }, [slug]);

  if (!slug) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 pt-20 flex flex-col items-center justify-center">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Destination not found</h1>
        <Button asChild><Link to="/destinations">View all destinations</Link></Button>
      </div>
    );
  }

  const safeName = dbDest?.name || (slug.charAt(0).toUpperCase() + slug.slice(1));
  const image = dbDest?.image_url || getCountryImageUrl(safeName);
  const description = dbDest?.description;

  return (
    <>
      <SEO
        title={`Study in ${safeName}`}
        description={`Interested in studying in ${safeName}? Get visa info, application roadmap, and expert support from Kuro.`}
      />
      <div className="min-h-screen bg-slate-950 text-slate-50">

        {/* Hero */}
        <div className="relative h-[420px] md:h-[520px] flex flex-col items-center justify-center overflow-hidden border-b border-slate-800">
          <div className="absolute inset-0">
            <img src={image} alt={safeName} className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/40" />
          </div>
          <div className="container relative z-10 mx-auto px-4 text-center max-w-4xl pt-28">
            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-900/30 text-blue-400 border border-blue-500/20 mb-6 text-sm font-medium">
              Now accepting applications · {safeName}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-tight drop-shadow-xl">
              Study in <span className="text-blue-400">{safeName}</span>
            </h1>
            {description && <p className="text-xl text-slate-200 max-w-2xl mx-auto mb-8">{description}</p>}
            <Button size="lg" className="h-12 px-8 bg-blue-600 hover:bg-blue-700" asChild>
              <Link to="/signup">Express interest <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
        </div>

        {/* Country updates */}
        {countryUpdates.length > 0 && (
          <section className="py-10 container mx-auto px-4">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-400" /> Latest updates for {safeName}
            </h2>
            <div className="space-y-3 max-w-2xl">
              {countryUpdates.map(u => <CountryUpdateCard key={u.id} update={u} />)}
            </div>
          </section>
        )}

        {/* Costs */}
        {(dbDest?.tuition_cost || dbDest?.living_cost) && (
          <section className="py-12 bg-slate-900 border-b border-slate-800">
            <div className="container mx-auto px-4 max-w-2xl">
              <div className="grid grid-cols-2 gap-4">
                {dbDest.tuition_cost && (
                  <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center">
                    <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Tuition range</p>
                    <p className="text-xl font-bold text-white">{dbDest.tuition_cost}</p>
                  </div>
                )}
                {dbDest.living_cost && (
                  <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center">
                    <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Living costs</p>
                    <p className="text-xl font-bold text-white">{dbDest.living_cost}</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Application Roadmap */}
        {roadmap && roadmap.length > 0 && (
          <section className="py-14 container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-2 text-center flex items-center justify-center gap-2">
              <ChevronRight className="w-6 h-6 text-blue-500" /> Application roadmap
            </h2>
            <p className="text-center text-slate-400 text-sm mb-8">Step-by-step for {safeName}</p>
            <div className="max-w-2xl mx-auto space-y-3">
              {roadmap.map((step, i) => (
                <div key={i} className="flex gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-blue-500/30 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {step.order || i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <span className="font-semibold text-white text-sm">{step.title}</span>
                      {step.typical_timeline && (
                        <span className="text-xs text-blue-400 bg-blue-950/40 border border-blue-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {step.typical_timeline}
                        </span>
                      )}
                    </div>
                    {step.description && <p className="text-slate-400 text-xs mt-1">{step.description}</p>}
                    {step.docs_required?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {step.docs_required.map((doc, j) => (
                          <span key={j} className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 flex items-center gap-1">
                            <FileText className="w-2.5 h-2.5" /> {doc}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Visa Info */}
        <section className="py-14 bg-slate-900/40 border-y border-slate-800">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 text-center flex items-center justify-center gap-2">
              <Plane className="w-6 h-6 text-blue-500" /> Visa information
            </h2>
            {visaInfo ? (
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="grid sm:grid-cols-3 gap-3">
                  {visaInfo.visa_type && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                      <p className="text-slate-400 text-xs uppercase mb-1">Visa type</p>
                      <p className="text-white font-semibold text-sm">{visaInfo.visa_type}</p>
                    </div>
                  )}
                  {visaInfo.processing_time && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                      <p className="text-slate-400 text-xs uppercase mb-1">Processing</p>
                      <p className="text-white font-semibold text-sm">{visaInfo.processing_time}</p>
                    </div>
                  )}
                  {visaInfo.cost && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                      <p className="text-slate-400 text-xs uppercase mb-1">Visa fee</p>
                      <p className="text-white font-semibold text-sm">{visaInfo.cost}</p>
                    </div>
                  )}
                </div>
                {visaInfo.documents?.length > 0 && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-green-400" /> Required documents
                    </h3>
                    <ul className="space-y-1.5">
                      {visaInfo.documents.map((doc, i) => (
                        <li key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" /> {doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {visaInfo.notes && (
                  <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-4">
                    <p className="text-amber-300 text-sm">{visaInfo.notes}</p>
                  </div>
                )}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {visaInfo.last_verified && (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <CalendarCheck className="w-3.5 h-3.5" />
                      Last verified: {new Date(visaInfo.last_verified).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                  {visaInfo.official_link && (
                    <a href={visaInfo.official_link} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5" /> Official portal
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-center text-slate-400 max-w-md mx-auto">
                Visa details for {safeName} are being compiled. <Link to="/contact" className="text-blue-400 hover:underline">Contact us</Link> for the latest requirements.
              </p>
            )}
          </div>
        </section>

        <div className="py-8 border-t border-slate-800 text-center px-4">
          <p className="text-xs text-slate-600 max-w-2xl mx-auto">
            Visa requirements and costs are subject to change. Kuro provides guidance based on current regulations — verify with the official embassy for the latest information.
          </p>
        </div>
      </div>
    </>
  );
};

export default DestinationTemplatePage;

import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, DollarSign, GraduationCap, Plane, AlertTriangle, ShieldCheck, ExternalLink, CalendarCheck, Clock, FileText, ChevronRight, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import SEO from '@/components/SEO';
import { getCountryImageUrl } from '@/lib/imageUtils';
import { supabase } from '@/lib/customSupabaseClient';
import CountryUpdateCard from '@/components/CountryUpdateCard';

const nameMap = {
  poland: "Poland",    pl: "Poland",
  australia: "Australia", au: "Australia",
  usa: "USA",          us: "USA",
  canada: "Canada",    ca: "Canada",
  uk: "UK",            gb: "UK",
  germany: "Germany",  de: "Germany",
  lithuania: "Lithuania", lt: "Lithuania",
  latvia: "Latvia",    lv: "Latvia",
  hungary: "Hungary",  hu: "Hungary",
  malta: "Malta",      mt: "Malta",
  cyprus: "Cyprus",    cy: "Cyprus",
  austria: "Austria",  at: "Austria",
};

const DestinationDetailPage = () => {
  const params = useParams();
  const slug = (params?.country || '').toLowerCase().trim();
  const name = nameMap[slug];

  const [roadmap, setRoadmap] = useState(null);
  const [visaInfo, setVisaInfo] = useState(null);
  const [dbDest, setDbDest] = useState(null);
  const [countryUpdates, setCountryUpdates] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const now = new Date().toISOString();
    Promise.all([
      supabase.from('destination_roadmaps').select('steps').eq('destination_slug', slug).maybeSingle(),
      supabase.from('destination_visa_info').select('*').eq('destination_slug', slug).maybeSingle(),
      supabase.from('destinations').select('*').ilike('slug', slug).maybeSingle(),
      supabase.from('country_updates').select('*')
        .eq('destination_slug', slug).eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order('created_at', { ascending: false }),
      supabase.from('faqs').select('question,answer').eq('category', slug).eq('is_active', true).order('created_at'),
    ]).then(([r, v, d, u, f]) => {
      setRoadmap(r.data?.steps || null);
      setVisaInfo(v.data || null);
      setDbDest(d.data || null);
      setCountryUpdates(u.data || []);
      setFaqs(f.data || []);
      setLoading(false);
    });
  }, [slug]);

  if (!slug) return <Navigate to="/destinations" replace />;

  if (!name && !loading && !dbDest) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 pt-20 flex flex-col items-center justify-center">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Destination not available</h1>
        <p className="text-slate-400 mb-8">We couldn't find information for this destination.</p>
        <Button asChild><Link to="/destinations">View all destinations</Link></Button>
      </div>
    );
  }

  const displayName = dbDest?.name || name || slug.charAt(0).toUpperCase() + slug.slice(1);
  const image = dbDest?.image_url || getCountryImageUrl(displayName);
  const description = dbDest?.description || `Discover top-tier education and lifestyle in ${displayName}.`;

  const defaultFaqs = [
    { question: "Can I work while studying?", answer: "Yes, most countries allow international students to work part-time during term time. Check the specific visa rules for your destination." },
    { question: "Is English widely spoken?", answer: "In academic circles and international programs, yes. Many universities offer full English-medium programs." }
  ];

  return (
    <>
      <SEO
        title={`Study in ${displayName}`}
        description={`Everything you need to know about studying in ${displayName}. Visa info, costs, roadmap, and more.`}
      />
      <div className="min-h-screen text-slate-50">

        {/* Hero */}
        <section className="relative h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden border-b border-slate-800">
          <div className="absolute inset-0">
            <img src={image} alt={displayName} className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/50 to-slate-950/90" />
          </div>
          <div className="container relative z-10 mx-auto px-4 text-center pt-20">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-tight drop-shadow-lg">
              Study in <span className="text-blue-400">{displayName}</span>
            </h1>
            <p className="text-xl text-slate-200 max-w-2xl mx-auto mb-10 leading-relaxed">{description}</p>
            <Button size="lg" className="h-12 px-8 text-lg bg-blue-600 hover:bg-blue-700" asChild>
              <Link to="/signup">Apply now</Link>
            </Button>
          </div>
        </section>

        {/* Country updates / visa appointment alerts */}
        {countryUpdates.length > 0 && (
          <section className="py-10 container mx-auto px-4">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-400" /> Latest updates for {displayName}
            </h2>
            <div className="space-y-3 max-w-3xl">
              {countryUpdates.map(u => <CountryUpdateCard key={u.id} update={u} />)}
            </div>
          </section>
        )}

        {/* Costs overview (from destinations table) */}
        {(dbDest?.tuition_cost || dbDest?.living_cost) && (
          <section className="py-16 bg-slate-900 border-y border-slate-800">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-10 text-center flex items-center justify-center gap-3">
                <DollarSign className="w-7 h-7 text-green-500" /> Cost overview
              </h2>
              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {dbDest.tuition_cost && (
                  <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center">
                    <div className="text-slate-400 mb-2 uppercase text-xs tracking-widest">Tuition range</div>
                    <div className="text-2xl font-bold text-white">{dbDest.tuition_cost}</div>
                  </div>
                )}
                {dbDest.living_cost && (
                  <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center">
                    <div className="text-slate-400 mb-2 uppercase text-xs tracking-widest">Living costs</div>
                    <div className="text-2xl font-bold text-white">{dbDest.living_cost}</div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Application Roadmap */}
        {roadmap && roadmap.length > 0 && (
          <section className="py-16 container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-3 text-center flex items-center justify-center gap-3">
              <ChevronRight className="w-7 h-7 text-blue-500" /> Application roadmap
            </h2>
            <p className="text-center text-slate-400 mb-10">Step-by-step process for {displayName}</p>
            <div className="max-w-3xl mx-auto space-y-4">
              {roadmap.map((step, i) => (
                <div key={i} className="flex gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-blue-500/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                    {step.order || i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <h3 className="font-semibold text-white text-base">{step.title}</h3>
                      {step.typical_timeline && (
                        <span className="flex items-center gap-1 text-xs text-blue-400 bg-blue-950/40 border border-blue-500/20 px-2 py-1 rounded-full whitespace-nowrap">
                          <Clock className="w-3 h-3" /> {step.typical_timeline}
                        </span>
                      )}
                    </div>
                    {step.description && <p className="text-slate-400 text-sm mt-1 leading-relaxed">{step.description}</p>}
                    {step.docs_required?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {step.docs_required.map((doc, j) => (
                          <span key={j} className="flex items-center gap-1 text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                            <FileText className="w-3 h-3 text-slate-500" /> {doc}
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

        {/* Visa Information */}
        <section className={`py-16 ${roadmap?.length ? 'bg-slate-900/30 border-y border-slate-800' : 'container mx-auto px-4'}`}>
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10 text-center flex items-center justify-center gap-3">
              <Plane className="w-7 h-7 text-blue-500" /> Visa information
            </h2>

            {visaInfo ? (
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="grid sm:grid-cols-3 gap-4">
                  {visaInfo.visa_type && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                      <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Visa type</p>
                      <p className="text-white font-semibold">{visaInfo.visa_type}</p>
                    </div>
                  )}
                  {visaInfo.processing_time && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                      <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Processing time</p>
                      <p className="text-white font-semibold">{visaInfo.processing_time}</p>
                    </div>
                  )}
                  {visaInfo.cost && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                      <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Visa fee</p>
                      <p className="text-white font-semibold">{visaInfo.cost}</p>
                    </div>
                  )}
                </div>

                {visaInfo.documents?.length > 0 && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-green-400" /> Required documents
                    </h3>
                    <ul className="space-y-2">
                      {visaInfo.documents.map((doc, i) => (
                        <li key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" /> {doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {visaInfo.notes && (
                  <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-5">
                    <p className="text-amber-300 text-sm leading-relaxed">{visaInfo.notes}</p>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  {visaInfo.last_verified && (
                    <p className="flex items-center gap-1.5 text-xs text-slate-500">
                      <CalendarCheck className="w-3.5 h-3.5" />
                      Last verified: {new Date(visaInfo.last_verified).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                  {visaInfo.official_link && (
                    <a href={visaInfo.official_link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" /> Official immigration portal
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="max-w-xl mx-auto text-center py-8">
                <p className="text-slate-400">Detailed visa information for {displayName} is being updated. <Link to="/contact" className="text-blue-400 hover:underline">Contact our team</Link> for the latest requirements.</p>
              </div>
            )}
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently asked questions</h2>
            <Accordion type="single" collapsible>
              {(faqs.length > 0 ? faqs : defaultFaqs).map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-slate-800">
                  <AccordionTrigger className="text-white hover:text-blue-400 hover:no-underline text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-slate-400">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-8 border-t border-slate-800 text-center px-4">
          <p className="text-xs text-slate-500 max-w-4xl mx-auto">
            Visa requirements and tuition fees are subject to change. Kuro Education Consultancy provides guidance based on current regulations, but final decisions rest with the embassy and university.
          </p>
        </section>
      </div>
    </>
  );
};

export default DestinationDetailPage;

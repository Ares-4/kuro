import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, DollarSign, GraduationCap, Plane, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import SEO from '@/components/SEO';
import { getCountryImageUrl } from '@/lib/imageUtils';

// Helper to retrieve data dynamically using proven image map
const getDestinationData = (slug) => {
  const nameMap = {
    poland: "Poland",
    australia: "Australia",
    usa: "USA",
    canada: "Canada",
    uk: "UK",
    germany: "Germany",
    lithuania: "Lithuania",
    latvia: "Latvia",
    hungary: "Hungary",
    malta: "Malta",
    cyprus: "Cyprus",
    austria: "Austria"
  };

  const name = nameMap[slug];
  if (!name) return null;

  const image = getCountryImageUrl(name);

  // Common data structures
  return {
    name,
    tagline: `Study in ${name}`,
    description: `Discover top-tier education and lifestyle in ${name}.`,
    benefits: ["Quality Education", "Cultural Diversity", "Career Opportunities", "Student Support"],
    universities: ["Leading University 1", "National University", "Tech Institute"],
    steps: ["Assessment", "Application", "Admission", "Visa", "Departure"],
    costs: { tuition: "Varies", living: "Varies", visa: "Varies" },
    images: {
      hero: image, 
      university: image, 
      visa: image
    },
    testimonials: [
      { name: "Student A", text: "A life-changing experience." },
      { name: "Student B", text: "Support was incredible." }
    ],
    faqs: [
      { q: "Can I work while studying?", a: "Yes, usually 20 hours per week." },
      { q: "Is English widely spoken?", a: "Yes, in academic circles." }
    ]
  };
};

const DestinationDetailPage = () => {
  const params = useParams();
  const slug = (params?.country || '').toLowerCase().trim();

  if (!slug) {
    return <Navigate to="/destinations" replace />;
  }

  const data = getDestinationData(slug);

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 pt-20 flex flex-col items-center justify-center">
         <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
         <h1 className="text-2xl font-bold mb-4">Destination Info Unavailable</h1>
         <p className="text-slate-400 mb-8">We couldn't find detailed information for this destination.</p>
         <Button asChild><Link to="/destinations">View All Destinations</Link></Button>
       </div>
    );
  }

  return (
    <>
      <SEO 
        title={`Study in ${data.name}`} 
        description={`Everything you need to know about studying in ${data.name}. Visa, costs, universities, and more.`} 
      />
      <div className="min-h-screen bg-slate-950 text-slate-50">
        {/* Hero */}
        <section className="relative h-[500px] md:h-[600px] flex items-center justify-center border-b border-slate-800 overflow-hidden">
          {/* Background Image Overlay */}
          <div className="absolute inset-0 z-0">
             <img 
              src={data.images.hero} 
              alt={`${data.name} landscape`} 
              className="w-full h-full object-cover"
              loading="lazy"
             />
             {/* Gradient Overlay for better text contrast */}
             <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/50 to-slate-950/90" />
          </div>

          <div className="container relative z-10 mx-auto px-4 text-center pt-20">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-tight drop-shadow-lg">
              Study in <span className="text-blue-400">{data.name}</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 max-w-2xl mx-auto mb-8 font-light drop-shadow-md">{data.tagline}</p>
            <p className="text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed text-lg">{data.description}</p>
            <Button size="lg" className="h-12 px-8 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20" asChild>
              <Link to="/signup">Apply Now</Link>
            </Button>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-10 text-center">Why {data.name}?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.benefits && data.benefits.map((benefit, i) => (
              <div key={i} className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 flex flex-col items-center text-center hover:bg-slate-900 transition-all hover:scale-105">
                <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                <h3 className="font-semibold text-lg text-slate-100">{benefit}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* Universities */}
        <section className="py-16 bg-slate-900/30 border-y border-slate-800">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center flex items-center justify-center gap-3">
              <GraduationCap className="w-8 h-8 text-blue-500" /> Popular Universities
            </h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="grid gap-6">
                {data.universities && data.universities.map((uni, i) => (
                  <div key={i} className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex items-center gap-4 hover:border-blue-500/50 transition-colors">
                    <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-xl font-bold text-slate-500 shrink-0">
                      {uni.charAt(0)}
                    </div>
                    <h3 className="font-semibold text-lg">{uni}</h3>
                  </div>
                ))}
              </div>
              <div className="relative h-80 md:h-[400px] rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
                <img 
                  src={data.images.university} 
                  alt={`Universities in ${data.name}`} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay" />
              </div>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="py-16 container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center flex items-center justify-center gap-3">
             <Plane className="w-8 h-8 text-blue-500" /> Visa Process
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
             <div className="relative h-64 md:h-[350px] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 order-2 md:order-1">
                <img 
                  src={data.images.visa} 
                  alt="Visa Process" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
             </div>
             <div className="space-y-6 order-1 md:order-2">
                {data.steps && data.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {i + 1}
                    </div>
                    <p className="font-medium text-slate-200">{step}</p>
                  </div>
                ))}
             </div>
          </div>
        </section>

        {/* Costs */}
        <section className="py-16 bg-slate-900 border-y border-slate-800">
           <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center flex items-center justify-center gap-3">
              <DollarSign className="w-8 h-8 text-green-500" /> Cost Breakdown
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
               <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center hover:border-slate-600 transition-colors">
                 <div className="text-slate-400 mb-2 uppercase text-sm tracking-wide">Tuition Fees</div>
                 <div className="text-2xl font-bold text-white">{data.costs?.tuition || "Varies"}</div>
               </div>
               <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center hover:border-slate-600 transition-colors">
                 <div className="text-slate-400 mb-2 uppercase text-sm tracking-wide">Living Expenses</div>
                 <div className="text-2xl font-bold text-white">{data.costs?.living || "Varies"}</div>
               </div>
               <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center hover:border-slate-600 transition-colors">
                 <div className="text-slate-400 mb-2 uppercase text-sm tracking-wide">Visa Fees</div>
                 <div className="text-2xl font-bold text-white">{data.costs?.visa || "Varies"}</div>
               </div>
            </div>
           </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Student Stories</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {data.testimonials && data.testimonials.map((t, i) => (
              <div key={i} className="bg-slate-900 p-8 rounded-xl border border-slate-800 relative">
                <span className="absolute top-4 left-4 text-4xl text-slate-700 font-serif">"</span>
                <p className="italic text-slate-300 mb-6 relative z-10 pl-4">{t.text}</p>
                <div className="font-semibold text-blue-400 text-right">- {t.name}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 bg-slate-900/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {data.faqs && data.faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-slate-800">
                  <AccordionTrigger className="text-white hover:text-blue-400 hover:no-underline">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-slate-400">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-8 border-t border-slate-800 text-center px-4">
           <p className="text-xs text-slate-500 max-w-4xl mx-auto">
             Disclaimer: Visa requirements and tuition fees are subject to change by respective governments and institutions. 
             Kuro Education Consultancy provides guidance based on current regulations but the final decision lies with the embassy and university.
           </p>
        </section>
      </div>
    </>
  );
};

export default DestinationDetailPage;
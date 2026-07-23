import React, { useEffect } from 'react';
import { 
  CheckCircle2, 
  X,
  CreditCard,
  Scale,
  FileSearch,
  Sparkles,
  BookOpen,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import FunnelButton from '@/components/FunnelButton';
import AdSlot from '@/components/ads/AdSlot';

const ReadinessCheckPage = () => {
  useEffect(() => {
    document.title = "Study Abroad Readiness Check | Self-Assessment Tool";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = "Assess your readiness for studying abroad. Free self-assessment tool covering academics, finances, language skills, and personal factors.";
  }, []);

  return (
    <>
      {/* --- HERO SECTION --- */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-blue-900/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="mb-8">
             <AdSlot page="/readiness-check" slot="top" />
          </div>

          <Badge variant="outline" className="mb-6 border-blue-500/50 text-blue-300 bg-blue-900/20 px-4 py-1 text-sm rounded-full">
            Recommended First Step
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Know Your Chances <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Before You Apply
            </span>
          </h1>
          
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-16 leading-relaxed">
            Stop guessing. Get an assessment of your admission and visa profile. 
            Choose the depth of analysis that fits your needs.
          </p>

          {/* Pricing Grid */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Basic Tier */}
            <Card className="bg-slate-900 border-slate-800 relative hover:border-slate-700 transition-colors">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl text-white">Basic Check</CardTitle>
                <div className="text-4xl font-bold text-white mt-4">€2.99</div>
                <p className="text-slate-400 text-sm mt-2">Instant eligibility score</p>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-4 text-left">
                  <li className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span>Automated Academic Score (0-100)</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span>Basic Budget Estimation</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span>1 Destination Analysis</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-500">
                    <X className="w-5 h-5 shrink-0" />
                    <span>Visa Risk Assessment</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-500">
                    <X className="w-5 h-5 shrink-0" />
                    <span>Document Audit</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                 <FunnelButton 
                   action="readiness" 
                   text="Start Basic Check" 
                   variant="outline" 
                   className="w-full border-slate-700 text-white hover:bg-slate-800" 
                 />
              </CardFooter>
            </Card>

            {/* Premium Tier */}
            <Card className="bg-slate-900 border-blue-500/50 shadow-2xl shadow-blue-900/20 relative overflow-hidden transform md:-translate-y-4">
              <div className="absolute top-0 right-0 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-bl-xl z-10">
                RECOMMENDED
              </div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
              
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" /> Premium Check
                </CardTitle>
                <div className="text-4xl font-bold text-white mt-4">€19</div>
                <p className="text-blue-200 text-sm mt-2">Comprehensive 10-page report</p>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-4 text-left">
                  <li className="flex items-start gap-3 text-sm text-white">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                    <span className="font-medium">Human Expert Review (Not AI)</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                    <span>Visa Risk Assessment (High/Med/Low)</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                    <span>Full Financial Health Check</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                    <span>3 Destination Comparisons</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                    <span>Priority Booking for Consultation</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                 <FunnelButton 
                   action="readiness" 
                   text="Get Premium Report" 
                   className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold" 
                 />
              </CardFooter>
            </Card>

          </div>
        </div>
      </section>

      {/* --- DETAILS: WHAT IS ANALYZED --- */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">What do we analyze?</h2>
            <p className="text-slate-400">The 4 pillars of a successful application.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 transition-colors">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 mb-6">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Academic Profile</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                We convert your local grades to European ECTS equivalents to verify program eligibility.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-green-500/50 transition-colors">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 mb-6">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Financial Proof</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Analysis of sponsor capability, bank statement history, and alignment with embassy requirements.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-yellow-500/50 transition-colors">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500 mb-6">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Study Gap</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Evaluation of any gaps in your education and how to properly explain them to consular officers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 transition-colors">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 mb-6">
                <FileSearch className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Document Audit</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Checklist of required legalizations (Apostilles), translations, and certifications specific to your country.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-slate-800">
              <AccordionTrigger className="text-slate-200 hover:text-white hover:no-underline">
                Is the €19 fee refundable?
              </AccordionTrigger>
              <AccordionContent className="text-slate-400">
                The fee covers the time of our expert consultants to review your specific case. It is non-refundable, but if you proceed with our Full Application Service, we deduct the €19 from your final package price.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-slate-800">
               <AccordionTrigger className="text-slate-200 hover:text-white hover:no-underline">
                How long does the report take?
              </AccordionTrigger>
              <AccordionContent className="text-slate-400">
                For the Basic Check (€2.99), results are instant. For the Premium Report (€19), you will receive your detailed PDF via email within 24 hours.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-slate-800">
               <AccordionTrigger className="text-slate-200 hover:text-white hover:no-underline">
                Does this guarantee a visa?
              </AccordionTrigger>
              <AccordionContent className="text-slate-400">
                No. The Readiness Check is a risk assessment tool. It identifies problems <em>before</em> you apply, significantly increasing your chances, but the final decision always lies with the Embassy.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-24 bg-gradient-to-t from-blue-900/20 to-slate-950 border-t border-slate-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Shield className="w-16 h-16 text-blue-500 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to get the truth about your application?
          </h2>
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
            Get clarity, identify risks, and move forward with confidence.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <FunnelButton 
              action="readiness" 
              size="lg" 
              className="h-14 px-10 text-lg bg-white text-blue-900 hover:bg-slate-200 font-bold hover:text-blue-800"
              text="Get Premium Report (€19)"
            />
            <FunnelButton 
              action="consultation" 
              variant="outline"
              size="lg" 
              className="h-14 px-10 text-lg border-slate-700 text-slate-300 hover:text-white"
              text="Book Consultation"
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default ReadinessCheckPage;
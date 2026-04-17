import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Info, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';
import { getCountryImageUrl } from '@/lib/imageUtils';

const DestinationTemplatePage = () => {
  const params = useParams();
  
  const rawSlug = (params && params.country) ? params.country : '';
  const slug = rawSlug ? rawSlug.toLowerCase().trim() : '';

  if (!slug) {
     return (
       <div className="min-h-screen bg-slate-950 text-slate-50 pt-20 flex flex-col items-center justify-center">
         <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
         <h1 className="text-2xl font-bold mb-4">Destination Not Found</h1>
         <p className="text-slate-400 mb-8">It seems you've reached this page without specifying a destination.</p>
         <Button asChild><Link to="/destinations">View All Destinations</Link></Button>
       </div>
     );
  }

  const safeName = slug.charAt(0).toUpperCase() + slug.slice(1);
  const image = getCountryImageUrl(safeName);

  return (
    <>
      <SEO 
        title={`Study in ${safeName} - Express Interest`} 
        description={`Interested in studying in ${safeName}? We are now accepting expressions of interest for upcoming intakes.`} 
      />
      <div className="min-h-screen bg-slate-950 text-slate-50">
        {/* Hero Section */}
        <div className="relative h-[400px] md:h-[500px] flex flex-col items-center justify-center overflow-hidden border-b border-slate-800">
           <div className="absolute inset-0 z-0">
             <img 
               src={image} 
               alt={`${safeName} scenic view`}
               className="w-full h-full object-cover"
               loading="lazy"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
           </div>

          <div className="container relative z-10 mx-auto px-4 py-16 text-center max-w-4xl pt-32">
            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-900/30 text-blue-400 border border-blue-500/20 mb-6 text-sm font-medium backdrop-blur-sm">
               Now Accepting Interest for {safeName}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 text-white tracking-tight drop-shadow-xl">
              Study in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{safeName}</span>
            </h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Left Column: Text and CTA */}
            <div>
              <p className="text-xl text-slate-300 mb-12 leading-relaxed">
                {safeName} offers incredible opportunities for international students. 
                We are currently processing applications for select universities in this region.
                Get expert guidance on admission and visa procedures.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-blue-500/30 transition-colors">
                  <DollarSign className="w-6 h-6 text-green-500 mb-3" />
                  <div className="text-slate-400 text-xs uppercase tracking-wider">Cost of Living</div>
                  <div className="text-lg font-bold text-white">Varies</div>
                </div>
                <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-blue-500/30 transition-colors">
                  <Info className="w-6 h-6 text-blue-500 mb-3" />
                  <div className="text-slate-400 text-xs uppercase tracking-wider">Tuition Range</div>
                  <div className="text-lg font-bold text-white">Varies</div>
                </div>
                <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-blue-500/30 transition-colors sm:col-span-2">
                  <Clock className="w-6 h-6 text-purple-500 mb-3" />
                  <div className="text-slate-400 text-xs uppercase tracking-wider">Visa Timeline</div>
                  <div className="text-lg font-bold text-white">Varies</div>
                </div>
              </div>

              <div className="space-y-4">
                <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 w-full sm:w-auto shadow-lg shadow-blue-900/20" asChild>
                  <Link to="/signup">Express Interest Now <ArrowRight className="ml-2 w-5 h-5" /></Link>
                </Button>
                <div className="pt-2">
                  <Link to="/destinations" className="text-slate-500 hover:text-white transition-colors text-sm">
                    ← Back to all destinations
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Image */}
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 hidden md:block">
              <img 
                src={image} 
                alt={`Universities in ${safeName}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay" />
            </div>
          </div>
        </div>
        
        <div className="mt-auto py-8 w-full border-t border-slate-800 text-center px-4">
           <p className="text-xs text-slate-600 max-w-2xl mx-auto">
             Information provided is an estimate. Processing times and costs may vary. 
             Contact our consultants for the most up-to-date details.
           </p>
        </div>
      </div>
    </>
  );
};

export default DestinationTemplatePage;
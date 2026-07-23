import React from 'react';
import { X, Smartphone, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HomePage from '@/pages/HomePage';
import DestinationsPage from '@/pages/DestinationsPage';
import ServicesPage from '@/pages/ServicesPage';
import ProcessPage from '@/pages/ProcessPage';
import WhyKuroPage from '@/pages/WhyKuroPage';
import FaqsPage from '@/pages/FaqsPage';
import ContactPage from '@/pages/ContactPage';
import EligibilityPage from '@/pages/EligibilityPage';

const componentMap = {
  home: HomePage,
  destinations: DestinationsPage,
  services: ServicesPage,
  process: ProcessPage,
  why_kuro: WhyKuroPage,
  faqs: FaqsPage,
  contact: ContactPage,
  eligibility: EligibilityPage,
};

const ContentPreview = ({ isOpen, onClose, page, content }) => {
  const [mode, setMode] = React.useState('desktop'); // desktop | mobile
  
  if (!isOpen) return null;

  const PageComponent = componentMap[page] || HomePage;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Drawer */}
      <div className="relative w-full md:w-[85vw] lg:w-[70vw] h-full bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Live Preview: <span className="text-blue-400 capitalize">{page.replace('_', ' ')}</span>
          </h2>
          <div className="flex items-center gap-4">
             <div className="flex bg-slate-800 rounded-lg p-1">
               <Button 
                 size="sm" 
                 variant={mode === 'mobile' ? 'default' : 'ghost'} 
                 className={`h-7 px-2 ${mode === 'mobile' ? 'bg-blue-600' : 'text-slate-400'}`}
                 onClick={() => setMode('mobile')}
               >
                 <Smartphone className="w-4 h-4" />
               </Button>
               <Button 
                 size="sm" 
                 variant={mode === 'desktop' ? 'default' : 'ghost'} 
                 className={`h-7 px-2 ${mode === 'desktop' ? 'bg-blue-600' : 'text-slate-400'}`}
                 onClick={() => setMode('desktop')}
               >
                 <Monitor className="w-4 h-4" />
               </Button>
             </div>
             <Button variant="ghost" size="icon" onClick={onClose}>
               <X className="w-5 h-5 text-slate-400" />
             </Button>
          </div>
        </div>

        {/* Iframe-like container */}
        <div className="flex-1 bg-slate-900 overflow-hidden flex justify-center p-4">
          <div className={`bg-slate-950 border border-slate-800 shadow-xl overflow-y-auto transition-all duration-300 ${
            mode === 'mobile' ? 'w-[375px] h-[667px] rounded-3xl border-4 border-slate-800' : 'w-full h-full rounded-lg'
          }`}>
             {/* Pass content override prop to the page */}
             <div className="relative isolate">
                <PageComponent contentOverride={content} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentPreview;
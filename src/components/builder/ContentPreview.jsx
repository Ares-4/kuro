import React, { useState } from 'react';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Smartphone, Monitor, X, Loader2 } from 'lucide-react';

// Import Pages dynamically or statically
import HomePage from '@/pages/HomePage';
import DestinationsPage from '@/pages/DestinationsPage';
import ServicesPage from '@/pages/ServicesPage';
import ProcessPage from '@/pages/ProcessPage';
import WhyKuroPage from '@/pages/WhyKuroPage';
import FaqsPage from '@/pages/FaqsPage';
import ContactPage from '@/pages/ContactPage';
import EligibilityPage from '@/pages/EligibilityPage';

const ContentPreview = ({ isOpen, onClose, pageName, contentOverride }) => {
  const [viewMode, setViewMode] = useState('desktop');

  const getPageComponent = () => {
    switch(pageName) {
      case 'home': return HomePage;
      case 'destinations': return DestinationsPage;
      case 'services': return ServicesPage;
      case 'process': return ProcessPage;
      case 'why_kuro': return WhyKuroPage;
      case 'faqs': return FaqsPage;
      case 'contact': return ContactPage;
      case 'eligibility': return EligibilityPage;
      default: return () => <div className="p-10 text-center">Preview not available</div>;
    }
  };

  const PageComponent = getPageComponent();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[100vw] w-screen h-screen p-0 m-0 bg-slate-950/95 border-none rounded-none flex flex-col overflow-hidden">
        
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-4">
             <h3 className="font-bold text-white capitalize">{pageName.replace('_', ' ')} Preview</h3>
             <div className="flex bg-slate-800 rounded-lg p-1">
               <Button 
                 variant={viewMode === 'mobile' ? 'default' : 'ghost'} 
                 size="sm"
                 className="h-8 w-8 p-0"
                 onClick={() => setViewMode('mobile')}
               >
                 <Smartphone className="w-4 h-4" />
               </Button>
               <Button 
                 variant={viewMode === 'desktop' ? 'default' : 'ghost'} 
                 size="sm"
                 className="h-8 w-8 p-0"
                 onClick={() => setViewMode('desktop')}
               >
                 <Monitor className="w-4 h-4" />
               </Button>
             </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Viewport */}
        <div className="flex-1 overflow-hidden bg-slate-950 flex justify-center items-start pt-8 pb-8">
           <div 
             className={`bg-white transition-all duration-300 ease-in-out shadow-2xl overflow-hidden ${
               viewMode === 'mobile' 
                 ? 'w-[375px] h-[750px] rounded-3xl border-8 border-slate-800' 
                 : 'w-[1280px] h-full rounded-md border border-slate-800'
             }`}
           >
             <div className="w-full h-full overflow-y-auto scrollbar-hide">
               {/* We wrap in a div with dark mode forced if the app relies on dark classes */}
               <div className="dark min-h-full bg-slate-950">
                  <PageComponent contentOverride={contentOverride} />
               </div>
             </div>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContentPreview;
import React, { useState, useEffect } from 'react';
import { usePublicSiteSettings } from '@/contexts/PublicSiteSettingsContext';
import { updateSiteSettings } from '@/lib/settingsStore';
import { AdPlacementProvider } from '@/contexts/AdPlacementContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import {
  GripVertical,
  Save,
  RefreshCw,
  LayoutTemplate,
  AlertTriangle,
  Monitor
} from 'lucide-react';
import {
  TooltipProvider,
} from "@/components/ui/tooltip";

// Import Pages for Preview
import HomePage from '@/pages/HomePage';
import ServicesPage from '@/pages/ServicesPage';
import ResourcesPage from '@/pages/ResourcesPage';
import ReadinessCheckPage from '@/pages/ReadinessCheckPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';

// Must match the PromoZone components actually rendered inside each preview
// page below - a zone here only does something if a matching <PromoZone
// zone="..."/> exists in that page's JSX.
const ZONES = ['top', 'bottom'];

const PromoPlacementEditor = () => {
  const { siteSettings, refreshPublicSettings } = usePublicSiteSettings();
  const [activeTab, setActiveTab] = useState('/');
  const [localPromos, setLocalPromos] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Promos live in site_settings.promo_banners - the same data PromoManager
  // creates/edits via its page/zone dropdowns. This editor is a visual way
  // to edit those same `pages`/`zones` arrays by dragging, not a separate
  // placement system.
  useEffect(() => {
    setLocalPromos(JSON.parse(JSON.stringify(siteSettings?.promo_banners || {})));
  }, [siteSettings]);

  const handleUpdatePlacement = (page, zone, promoId, removePromoId) => {
    setLocalPromos(prev => {
      const next = JSON.parse(JSON.stringify(prev));

      if (removePromoId && next[removePromoId]) {
        const promo = next[removePromoId];
        promo.zones = (promo.zones || []).filter(z => z !== zone);
        // Only drop the page from this promo if it's not also placed in
        // another zone on the same page.
        const stillOnPage = (promo.zones || []).length > 0;
        if (!stillOnPage) {
          promo.pages = (promo.pages || []).filter(p => p !== page);
        }
        setHasChanges(true);
        return next;
      }

      if (promoId && next[promoId]) {
        const promo = next[promoId];
        promo.zones = Array.from(new Set([...(promo.zones || []), zone]));
        if (!(promo.pages || []).includes('all') && !(promo.pages || []).includes(page)) {
          promo.pages = [...(promo.pages || []), page];
        }
        setHasChanges(true);
      }

      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await updateSiteSettings('promo_banners', localPromos);

      if (success) {
        await refreshPublicSettings();
        setHasChanges(false);
        toast({ title: "Success", description: "Promo placements published successfully" });
      } else {
        throw new Error("Failed to save placements");
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to publish placements", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDragStart = (e, promoId) => {
    e.dataTransfer.setData('text/plain', promoId);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const getActiveCount = (path) => {
    return Object.values(localPromos).filter(p =>
      Array.isArray(p.zones) && p.zones.length > 0 &&
      (p.pages?.includes('all') || p.pages?.includes(path))
    ).length;
  };

  const PagePreview = () => {
    switch (activeTab) {
      case '/': return <HomePage />;
      case '/services': return <ServicesPage />;
      case '/resources': return <ResourcesPage />;
      case '/readiness-check': return <ReadinessCheckPage />;
      case '/about': return <AboutPage />;
      case '/contact': return <ContactPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 p-4 rounded-lg border border-slate-800 gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-blue-500" />
            Visual Placement Editor
          </h2>
          <p className="text-sm text-slate-400">
            Drag promos from the sidebar onto a highlighted zone in the preview. Create/edit promos themselves in Promo Manager.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLocalPromos(JSON.parse(JSON.stringify(siteSettings?.promo_banners || {})));
              setHasChanges(false);
            }}
            disabled={!hasChanges}
            className="border-slate-700 text-slate-300"
           >
             <RefreshCw className="w-4 h-4 mr-2" /> Reset
           </Button>
           <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={cn("transition-all", hasChanges ? "bg-green-600 hover:bg-green-700" : "bg-slate-700")}
           >
             <Save className="w-4 h-4 mr-2" />
             {saving ? 'Publishing...' : 'Publish'}
           </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Sidebar - Promos */}
        <div className="w-80 bg-slate-900 border border-slate-800 rounded-lg flex flex-col overflow-hidden shrink-0 shadow-xl z-10">
          <div className="p-4 border-b border-slate-800 bg-slate-900">
            <h3 className="font-semibold text-white">Available Promos</h3>
            <p className="text-xs text-slate-500 mt-1">Zones on this page: {ZONES.join(', ')}</p>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {Object.keys(localPromos).length === 0 && (
                <div className="flex flex-col items-center justify-center text-slate-500 text-sm text-center py-8 gap-2">
                  <AlertTriangle className="w-8 h-8 opacity-50" />
                  <p>No promos found.</p>
                  <p className="text-xs">Create some in the Promo Manager first.</p>
                </div>
              )}
              {Object.entries(localPromos).map(([id, promo]) => (
                <div
                  key={id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, id)}
                  className="bg-slate-800 border border-slate-700 p-3 rounded-md cursor-grab active:cursor-grabbing hover:border-blue-500 hover:bg-slate-800/80 transition-all shadow-sm group select-none relative overflow-hidden"
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1"
                    style={{ backgroundColor: promo.backgroundColor || '#334155' }}
                  />

                  <div className="flex items-center justify-between mb-2 pl-2">
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${promo.isActive === false ? 'text-red-400 bg-red-950/50' : 'text-emerald-400 bg-emerald-950/50'}`}>
                      {promo.isActive === false ? 'inactive' : 'active'}
                    </span>
                    <GripVertical className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                  </div>
                  <h4 className="font-medium text-slate-200 text-sm line-clamp-1 pl-2">{promo.emoji} {promo.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 pl-2">{promo.description}</p>
                  {Array.isArray(promo.zones) && promo.zones.length > 0 && (
                    <p className="text-[10px] text-blue-400 mt-1 pl-2">In: {promo.zones.join(', ')}</p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Preview Area */}
        <div className="flex-1 flex flex-col bg-slate-950 border border-slate-800 rounded-lg overflow-hidden relative">
           <div className="p-2 border-b border-slate-800 bg-slate-900 overflow-x-auto z-20">
             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-slate-800 text-slate-400 h-auto p-1 flex-wrap justify-start">
                  {[
                    { id: '/', label: 'Home' },
                    { id: '/services', label: 'Services' },
                    { id: '/resources', label: 'Resources' },
                    { id: '/readiness-check', label: 'Readiness' },
                    { id: '/about', label: 'About' },
                    { id: '/contact', label: 'Contact' },
                  ].map(page => (
                    <TabsTrigger
                      key={page.id}
                      value={page.id}
                      className="data-[state=active]:bg-slate-700 data-[state=active]:text-white relative px-3 py-1.5"
                    >
                      {page.label}
                      {getActiveCount(page.id) > 0 && (
                        <Badge variant="secondary" className="ml-2 h-4 px-1 text-[9px] bg-blue-600 text-white hover:bg-blue-700 border-none">
                          {getActiveCount(page.id)}
                        </Badge>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
             </Tabs>
           </div>

           <div className="flex-1 overflow-auto bg-white relative scroll-smooth">
              <TooltipProvider>
                 <AdPlacementProvider
                   isEditorMode={true}
                   promos={localPromos}
                   onPlacementUpdate={handleUpdatePlacement}
                 >
                   <div className="origin-top transform transition-all min-h-full">
                      <PagePreview />
                   </div>
                 </AdPlacementProvider>
              </TooltipProvider>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PromoPlacementEditor;

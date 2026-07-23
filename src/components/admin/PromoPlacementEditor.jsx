import React, { useState, useEffect } from 'react';
import { usePublicSiteSettings } from '@/contexts/PublicSiteSettingsContext';
import { updateSiteSettings } from '@/lib/settingsStore';
import { AdPlacementProvider } from '@/contexts/AdPlacementContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { 
  GripVertical, 
  Save, 
  RefreshCw, 
  LayoutTemplate, 
  AlertTriangle, 
  Layers, 
  Plus, 
  X,
  Monitor
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Import Pages for Preview
import HomePage from '@/pages/HomePage';
import ServicesPage from '@/pages/ServicesPage';
import ResourcesPage from '@/pages/ResourcesPage';
import ReadinessCheckPage from '@/pages/ReadinessCheckPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';

const PromoPlacementEditor = () => {
  const { siteSettings, refreshPublicSettings } = usePublicSiteSettings();
  const [activeTab, setActiveTab] = useState('/');
  const [localPlacements, setLocalPlacements] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [manageZonesMode, setManageZonesMode] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const { toast } = useToast();

  const promos = siteSettings?.promos || {};

  // Initialize local placements from site settings on load
  useEffect(() => {
    if (siteSettings?.ad_placements) {
      // Ensure we have a deep copy to avoid reference issues
      setLocalPlacements(JSON.parse(JSON.stringify(siteSettings.ad_placements)));
    }
  }, [siteSettings]);

  const handleUpdatePlacement = (page, slot, promoId) => {
    setLocalPlacements(prev => {
      const pagePlacements = { ...(prev[page] || {}) };
      
      if (promoId) {
        // Assign promo
        pagePlacements[slot] = { type: promoId, enabled: true };
      } else {
        // Remove promo assignment (but keep the slot key if we are just clearing it)
        // If we want to fully remove the slot configuration, we can delete it
        if (pagePlacements[slot]) {
           delete pagePlacements[slot];
        }
      }

      return {
        ...prev,
        [page]: pagePlacements
      };
    });
    setHasChanges(true);
  };

  const handleAddZone = () => {
    if (!newZoneName.trim()) {
      toast({ title: "Error", description: "Zone name cannot be empty", variant: "destructive" });
      return;
    }
    
    // Create a normalized slot ID
    const slotId = newZoneName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    setLocalPlacements(prev => {
      const pagePlacements = { ...(prev[activeTab] || {}) };
      
      // Initialize if not exists, but don't overwrite if it does
      if (!pagePlacements[slotId]) {
        pagePlacements[slotId] = { type: null, enabled: true }; // Empty slot
      }
      
      return {
        ...prev,
        [activeTab]: pagePlacements
      };
    });
    
    setNewZoneName('');
    setHasChanges(true);
    toast({ title: "Zone Added", description: `Zone '${slotId}' added to current page.` });
  };

  const handleRemoveZone = (slotId) => {
    setLocalPlacements(prev => {
      const pagePlacements = { ...(prev[activeTab] || {}) };
      delete pagePlacements[slotId];
      return {
        ...prev,
        [activeTab]: pagePlacements
      };
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await updateSiteSettings('ad_placements', localPlacements);
      
      if (success) {
        await refreshPublicSettings();
        setHasChanges(false);
        toast({ title: "Success", description: "Ad placements published successfully" });
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
    const pagePlacements = localPlacements[path] || {};
    // Count only slots that have a promo assigned
    return Object.values(pagePlacements).filter(p => p && p.type).length;
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

  // List of zones currently defined for the active page
  const currentZones = Object.keys(localPlacements[activeTab] || {});

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
            {manageZonesMode 
              ? "Manage available ad zones for this page." 
              : "Drag promos from the sidebar to any available zone."}
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <Button 
             variant={manageZonesMode ? "secondary" : "ghost"} 
             size="sm"
             onClick={() => setManageZonesMode(!manageZonesMode)}
             className={cn("text-slate-300", manageZonesMode && "bg-blue-900/50 text-blue-300 hover:bg-blue-900/70")}
           >
             <Layers className="w-4 h-4 mr-2" />
             {manageZonesMode ? 'Done Managing' : 'Manage Zones'}
           </Button>

           <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setLocalPlacements(JSON.parse(JSON.stringify(siteSettings?.ad_placements || {})));
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
        {/* Sidebar - Promos & Zone Tools */}
        <div className="w-80 bg-slate-900 border border-slate-800 rounded-lg flex flex-col overflow-hidden shrink-0 shadow-xl z-10">
          
          {manageZonesMode ? (
             <div className="p-4 border-b border-slate-800 bg-slate-900 space-y-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Zone Manager
                </h3>
                <div className="flex gap-2">
                  <Input 
                    placeholder="New Zone ID (e.g. sidebar-top)" 
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                    className="bg-slate-950 border-slate-700 h-9"
                  />
                  <Button size="sm" onClick={handleAddZone} className="bg-blue-600 hover:bg-blue-700 px-3">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <ScrollArea className="h-[calc(100vh-350px)]">
                  <div className="space-y-2 mt-2">
                     {currentZones.length === 0 && (
                       <p className="text-slate-500 text-xs italic p-2">No zones defined for this page.</p>
                     )}
                     {currentZones.map(zone => (
                       <div key={zone} className="flex justify-between items-center bg-slate-800/50 p-2 rounded border border-slate-800">
                         <span className="text-sm font-mono text-slate-300">{zone}</span>
                         <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-red-400" onClick={() => handleRemoveZone(zone)}>
                           <X className="w-3 h-3" />
                         </Button>
                       </div>
                     ))}
                  </div>
                </ScrollArea>
             </div>
          ) : (
            <>
              <div className="p-4 border-b border-slate-800 bg-slate-900">
                <h3 className="font-semibold text-white">Available Promos</h3>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {Object.keys(promos).length === 0 && (
                    <div className="flex flex-col items-center justify-center text-slate-500 text-sm text-center py-8 gap-2">
                      <AlertTriangle className="w-8 h-8 opacity-50" />
                      <p>No promos found.</p>
                      <p className="text-xs">Create some in the Promo Manager first.</p>
                    </div>
                  )}
                  {Object.entries(promos).map(([id, promo]) => (
                    <div
                      key={id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, id)}
                      className="bg-slate-800 border border-slate-700 p-3 rounded-md cursor-grab active:cursor-grabbing hover:border-blue-500 hover:bg-slate-800/80 transition-all shadow-sm group select-none relative overflow-hidden"
                    >
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-1" 
                        style={{ backgroundColor: promo.type === 'custom' ? (promo.backgroundColor || '#334155') : (promo.type === 'guide' ? '#1d4ed8' : '#15803d') }} 
                      />
                      
                      <div className="flex items-center justify-between mb-2 pl-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded">
                          {promo.type}
                        </span>
                        <GripVertical className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                      </div>
                      <h4 className="font-medium text-slate-200 text-sm line-clamp-1 pl-2">{promo.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 pl-2">{promo.text}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
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
                   placements={localPlacements}
                   promos={promos}
                   onPlacementUpdate={handleUpdatePlacement}
                   manageZonesMode={manageZonesMode}
                 >
                   <div className="origin-top transform transition-all min-h-full">
                      <PagePreview />
                   </div>
                 </AdPlacementProvider>
              </TooltipProvider>

              {/* Overlay for Manage Zones Help */}
              {manageZonesMode && currentZones.length === 0 && (
                 <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-30 pointer-events-none">
                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg text-center max-w-md shadow-2xl">
                       <LayoutTemplate className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                       <h3 className="text-xl font-bold text-white mb-2">No Zones Configured</h3>
                       <p className="text-slate-300 mb-4">
                         This page doesn't have any active ad zones yet. Use the sidebar to add zone IDs (e.g., 'header', 'sidebar', 'footer') that correspond to AdSlot locations in your code.
                       </p>
                    </div>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default PromoPlacementEditor;
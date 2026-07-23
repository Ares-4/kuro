import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Edit2, Trash2, Loader2, Save, Eye, Smartphone, Monitor } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getPromoBanners, savePromoBanners } from '@/lib/settingsStore';
import { motion, AnimatePresence } from 'framer-motion';

const PAGE_OPTIONS = [
  { value: '/', label: 'Home Page' },
  { value: '/services', label: 'Services' },
  { value: '/resources', label: 'Resources' },
  { value: '/readiness-check', label: 'Readiness Check' },
  { value: '/about', label: 'About Us' },
  { value: '/contact', label: 'Contact' },
  { value: 'all', label: 'All Pages' }
];

const ZONE_OPTIONS = [
  { value: 'top', label: 'Top of Page' },
  { value: 'hero_below', label: 'Below Hero' },
  { value: 'sidebar', label: 'Sidebar' },
  { value: 'content_mid', label: 'Middle of Content' },
  { value: 'bottom', label: 'Bottom/Footer' }
];

const PromoManager = () => {
  const [banners, setBanners] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const { toast } = useToast();

  // Initial form state
  const initialFormState = {
    id: null,
    title: '',
    description: '',
    buttonText: '',
    buttonLink: '',
    backgroundColor: '#1e293b',
    textColor: '#ffffff',
    emoji: '📣',
    position: 'center',
    animation: 'fade',
    priority: 1,
    pages: ['all'],
    zones: ['top'],
    audience: 'all',
    isActive: true
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const data = await getPromoBanners();
      
      // Explicitly check that data is an object and NOT an array
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        setBanners(data);
      } else {
        console.warn('PromoManager: Loaded data was not a valid object, defaulting to empty object.');
        setBanners({});
      }
    } catch (error) {
      console.error("Failed to load banners:", error);
      setBanners({});
    }
    setLoading(false);
  };

  const handleEdit = (banner) => {
    // Ensure arrays exist in edit mode
    setFormData({
      ...banner,
      pages: Array.isArray(banner.pages) ? banner.pages : ['all'],
      zones: Array.isArray(banner.zones) ? banner.zones : ['top']
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setFormData({ ...initialFormState, id: crypto.randomUUID() });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    const newBanners = { ...banners };
    delete newBanners[deleteId];
    
    setBanners(newBanners);
    await savePromoBanners(newBanners);
    
    toast({ title: 'Success', description: 'Promo deleted successfully.' });
    setDeleteId(null);
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Ensure we are working with an object structure
    const newBanners = { ...banners };
    
    // Use the ID as key
    if (formData.id) {
      newBanners[formData.id] = formData;
    } else {
      // Fallback if ID somehow missing, though handleCreate sets it
      const newId = crypto.randomUUID();
      newBanners[newId] = { ...formData, id: newId };
    }

    const success = await savePromoBanners(newBanners);
    if (success) {
      setBanners(newBanners);
      setIsDialogOpen(false);
      toast({ title: 'Success', description: 'Promo saved successfully.' });
    } else {
      toast({ title: 'Error', description: 'Failed to save promo.', variant: 'destructive' });
    }
    setSaving(false);
  };

  const togglePage = (page) => {
    setFormData(prev => {
      const currentPages = Array.isArray(prev.pages) ? prev.pages : [];
      
      if (page === 'all') {
        return { ...prev, pages: currentPages.includes('all') ? [] : ['all'] };
      }
      
      const newPages = currentPages.includes('all') ? [] : [...currentPages];
      if (newPages.includes(page)) {
        return { ...prev, pages: newPages.filter(p => p !== page) };
      } else {
        return { ...prev, pages: [...newPages, page] };
      }
    });
  };

  const toggleZone = (zone) => {
    setFormData(prev => {
      const currentZones = Array.isArray(prev.zones) ? prev.zones : [];
      
      if (currentZones.includes(zone)) {
        return { ...prev, zones: currentZones.filter(z => z !== zone) };
      } else {
        return { ...prev, zones: [...currentZones, zone] };
      }
    });
  };

  // Helper to get array for rendering
  const bannerList = Object.values(banners);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Promo Banners</h2>
          <p className="text-slate-400">Manage targeted advertisements and announcements across your site.</p>
        </div>
        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> New Promo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            Loading banners...
          </div>
        ) : bannerList.length === 0 ? (
          <div className="col-span-full py-12 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/50">
            <p className="text-slate-400">No promo banners found. Create one to get started!</p>
          </div>
        ) : (
          bannerList.map(banner => (
            <Card key={banner.id} className="bg-slate-900 border-slate-800 overflow-hidden group hover:border-blue-500/50 transition-colors">
              <div 
                className="h-2 w-full"
                style={{ backgroundColor: banner.backgroundColor }}
              />
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{banner.emoji}</span>
                    <h3 className="font-semibold text-white truncate max-w-[150px]">{banner.title}</h3>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${banner.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-600'}`} />
                </div>
                
                <p className="text-slate-400 text-sm mb-4 line-clamp-2 min-h-[40px]">{banner.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300 border border-slate-700">
                    Priority: {banner.priority}
                  </span>
                  <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300 border border-slate-700">
                    {Array.isArray(banner.pages) && banner.pages.includes('all') ? 'All Pages' : `${banner.pages?.length || 0} Pages`}
                  </span>
                  <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300 border border-slate-700">
                     {banner.zones?.length || 0} Zones
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 border-slate-700 hover:bg-slate-800 text-slate-300" onClick={() => handleEdit(banner)}>
                    <Edit2 className="w-3 h-3 mr-2" /> Edit
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-500 hover:text-red-400 hover:bg-red-900/10" onClick={() => handleDeleteClick(banner.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-950 border-slate-800 text-slate-100 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure Promo Banner</DialogTitle>
          </DialogHeader>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="w-full bg-slate-900 border border-slate-800 mb-4">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="style">Style</TabsTrigger>
                <TabsTrigger value="placement">Placement</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <div className="space-y-2">
                  <Label>Banner Title</Label>
                  <Input 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Summer Admission Open!"
                    className="bg-slate-900 border-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Brief detail about the promo"
                    className="bg-slate-900 border-slate-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Button Text</Label>
                    <Input 
                      value={formData.buttonText} 
                      onChange={e => setFormData({...formData, buttonText: e.target.value})}
                      placeholder="e.g. Apply Now"
                      className="bg-slate-900 border-slate-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Button Link</Label>
                    <Input 
                      value={formData.buttonLink} 
                      onChange={e => setFormData({...formData, buttonLink: e.target.value})}
                      placeholder="/apply or https://..."
                      className="bg-slate-900 border-slate-800"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-800">
                  <Label>Active Status</Label>
                  <Switch 
                    checked={formData.isActive}
                    onCheckedChange={checked => setFormData({...formData, isActive: checked})}
                  />
                </div>
              </TabsContent>

              <TabsContent value="style" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        value={formData.backgroundColor}
                        onChange={e => setFormData({...formData, backgroundColor: e.target.value})}
                        className="w-12 h-10 p-1 bg-slate-900 border-slate-800"
                      />
                      <Input 
                        value={formData.backgroundColor}
                        onChange={e => setFormData({...formData, backgroundColor: e.target.value})}
                        className="flex-1 bg-slate-900 border-slate-800"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Text Color</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        value={formData.textColor}
                        onChange={e => setFormData({...formData, textColor: e.target.value})}
                        className="w-12 h-10 p-1 bg-slate-900 border-slate-800"
                      />
                      <Input 
                        value={formData.textColor}
                        onChange={e => setFormData({...formData, textColor: e.target.value})}
                        className="flex-1 bg-slate-900 border-slate-800"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Emoji Icon</Label>
                  <Input 
                    value={formData.emoji} 
                    onChange={e => setFormData({...formData, emoji: e.target.value})}
                    placeholder="Paste an emoji here"
                    className="bg-slate-900 border-slate-800 text-2xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Animation</Label>
                    <Select value={formData.animation} onValueChange={val => setFormData({...formData, animation: val})}>
                      <SelectTrigger className="bg-slate-900 border-slate-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fade">Fade In</SelectItem>
                        <SelectItem value="slide">Slide Up</SelectItem>
                        <SelectItem value="bounce">Bounce</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Content Position</Label>
                    <Select value={formData.position} onValueChange={val => setFormData({...formData, position: val})}>
                      <SelectTrigger className="bg-slate-900 border-slate-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="placement" className="space-y-6">
                 <div className="space-y-2">
                    <Label>Display Priority (Higher shows first)</Label>
                    <Input 
                      type="number" 
                      value={formData.priority}
                      onChange={e => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
                      className="bg-slate-900 border-slate-800"
                    />
                 </div>
                 
                 <div className="space-y-2">
                   <Label>Target Pages</Label>
                   <div className="grid grid-cols-2 gap-2">
                      {PAGE_OPTIONS.map(page => (
                        <div 
                          key={page.value}
                          onClick={() => togglePage(page.value)}
                          className={`
                            px-3 py-2 rounded text-sm cursor-pointer border transition-colors
                            ${(Array.isArray(formData.pages) && (formData.pages.includes(page.value) || (formData.pages.includes('all') && page.value === 'all')))
                              ? 'bg-blue-600 border-blue-500 text-white' 
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'}
                          `}
                        >
                          {page.label}
                        </div>
                      ))}
                   </div>
                 </div>

                 <div className="space-y-2">
                   <Label>Ad Zones</Label>
                   <div className="flex flex-wrap gap-2">
                      {ZONE_OPTIONS.map(zone => (
                        <div 
                          key={zone.value}
                          onClick={() => toggleZone(zone.value)}
                          className={`
                            px-3 py-2 rounded text-sm cursor-pointer border transition-colors
                            ${Array.isArray(formData.zones) && formData.zones.includes(zone.value)
                              ? 'bg-purple-600 border-purple-500 text-white' 
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'}
                          `}
                        >
                          {zone.label}
                        </div>
                      ))}
                   </div>
                 </div>
              </TabsContent>
            </Tabs>

            {/* Preview Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-slate-400 text-sm uppercase tracking-wider font-semibold">
                <Eye className="w-4 h-4" /> Live Preview
              </div>
              
              <div className="flex-1 flex items-center justify-center bg-black/20 rounded-lg p-8 relative overflow-hidden">
                <div 
                   className="w-full rounded-lg p-6 shadow-xl relative overflow-hidden"
                   style={{ 
                     backgroundColor: formData.backgroundColor,
                     color: formData.textColor,
                     textAlign: formData.position
                   }}
                >
                  <div className="absolute top-0 right-0 p-2 opacity-50">
                    <div className="w-1 h-1 rounded-full bg-current mb-1"/>
                    <div className="w-1 h-1 rounded-full bg-current mb-1"/>
                    <div className="w-1 h-1 rounded-full bg-current"/>
                  </div>

                  <div className="text-4xl mb-3">{formData.emoji}</div>
                  <h3 className="text-xl font-bold mb-2">{formData.title || 'Your Title Here'}</h3>
                  <p className="opacity-90 mb-6 text-sm">{formData.description || 'Description of your amazing offer goes here.'}</p>
                  
                  {formData.buttonText && (
                    <button 
                      className="px-6 py-2 rounded font-semibold text-sm transition-transform active:scale-95"
                      style={{ 
                         backgroundColor: 'rgba(255,255,255,0.2)',
                         color: 'inherit',
                         border: '1px solid rgba(255,255,255,0.4)'
                      }}
                    >
                      {formData.buttonText}
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 text-xs text-slate-500 text-center">
                Preview shows generic container. Actual appearance depends on website placement.
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Banner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-slate-950 border-slate-800 text-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action cannot be undone. This will permanently delete the promo banner.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white border-0">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PromoManager;
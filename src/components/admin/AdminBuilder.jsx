import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutTemplate, Menu, Palette, Globe, Plus, Pencil, Trash2, Eye, Type, Megaphone, Shield, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/customSupabaseClient';
import PageEditor from './builder/PageEditor';
import MenuEditor from './builder/MenuEditor';
import StyleEditor from './builder/StyleEditor';
import LandingPageEditor from './builder/LandingPageEditor';
import FooterEditor from './builder/FooterEditor';
import CredibilityEditor from './builder/CredibilityEditor';
import PromoEditor from './builder/PromoEditor';
import TestimonialManager from './content/TestimonialManager';

const AdminBuilder = () => {
  const [activeTab, setActiveTab] = useState("landing");
  const [editingPageId, setEditingPageId] = useState(null);
  const [pages, setPages] = useState([]);
  
  React.useEffect(() => {
    if (activeTab === 'pages' && !editingPageId) {
      const fetchPages = async () => {
        const { data } = await supabase.from('dynamic_pages').select('*').order('created_at');
        setPages(data || []);
      };
      fetchPages();
    }
  }, [activeTab, editingPageId]);

  const deletePage = async (id) => {
    if(!window.confirm("Delete this page?")) return;
    await supabase.from('dynamic_pages').delete().eq('id', id);
    setPages(pages.filter(p => p.id !== id));
  };

  if (editingPageId) {
    return <PageEditor pageId={editingPageId} onBack={() => setEditingPageId(null)} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Website Builder</h2>
        <p className="text-slate-400">Manage pages, navigation, and site content.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        {/* Scrollable Tabs for Mobile */}
        <div className="w-full overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 scrollbar-hide">
          <TabsList className="bg-slate-800 border-slate-700 text-slate-400 flex w-max md:w-full md:flex-wrap h-auto gap-1">
            <TabsTrigger value="landing" className="gap-2"><LayoutTemplate className="w-4 h-4" /> Homepage</TabsTrigger>
            <TabsTrigger value="promos" className="gap-2"><Megaphone className="w-4 h-4" /> Promos</TabsTrigger>
            <TabsTrigger value="credibility" className="gap-2"><Shield className="w-4 h-4" /> Credibility</TabsTrigger>
            <TabsTrigger value="testimonials" className="gap-2"><MessageSquare className="w-4 h-4" /> Testimonials</TabsTrigger>
            <TabsTrigger value="pages" className="gap-2"><LayoutTemplate className="w-4 h-4" /> Pages</TabsTrigger>
            <TabsTrigger value="menu" className="gap-2"><Menu className="w-4 h-4" /> Navigation</TabsTrigger>
            <TabsTrigger value="style" className="gap-2"><Palette className="w-4 h-4" /> Branding</TabsTrigger>
            <TabsTrigger value="footer" className="gap-2"><Type className="w-4 h-4" /> Footer</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="landing" className="space-y-4"><LandingPageEditor /></TabsContent>
        <TabsContent value="promos" className="space-y-4"><PromoEditor /></TabsContent>
        <TabsContent value="credibility" className="space-y-4"><CredibilityEditor /></TabsContent>
        <TabsContent value="testimonials" className="space-y-4"><TestimonialManager /></TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <div className="flex justify-between items-center bg-slate-800 p-4 rounded-lg border border-slate-700">
            <div>
              <h3 className="text-lg font-bold text-white">Pages</h3>
              <p className="text-sm text-slate-400">Create and manage custom pages.</p>
            </div>
            <Button onClick={() => setEditingPageId('new')} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> New Page
            </Button>
          </div>

          <div className="grid gap-4">
            {pages.map(page => (
              <Card key={page.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-lg">{page.title}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${page.is_published ? 'bg-green-900/30 border-green-800 text-green-400' : 'bg-yellow-900/30 border-yellow-800 text-yellow-400'}`}>
                        {page.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                      <Globe className="w-3 h-3" /> /page/{page.slug}
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="ghost" size="sm" onClick={() => window.open(`/page/${page.slug}`, '_blank')} className="flex-1 md:flex-none text-slate-400 hover:text-white">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingPageId(page.id)} className="flex-1 md:flex-none text-blue-400 hover:text-blue-300">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deletePage(page.id)} className="flex-1 md:flex-none text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {pages.length === 0 && <div className="text-center p-8 text-slate-500 border border-dashed border-slate-700 rounded-lg">No custom pages yet.</div>}
          </div>
        </TabsContent>

        <TabsContent value="menu" className="space-y-4"><MenuEditor /></TabsContent>
        <TabsContent value="style" className="space-y-4"><StyleEditor /></TabsContent>
        <TabsContent value="footer" className="space-y-4"><FooterEditor /></TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminBuilder;
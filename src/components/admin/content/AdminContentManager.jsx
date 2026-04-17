import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Save, Loader2, FileText, Image, List, CheckCircle2, Globe, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminContentManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [content, setContent] = useState({
    hero: {
      title: "Global Study & Relocation Support",
      subtitle: "Your trusted partner for admissions, visa support, and relocation to top universities worldwide.",
      cta_text: "Start Your Journey"
    },
    destinations: {
      poland: { title: "Study in Poland", description: "Affordable education in the heart of Europe." },
      australia: { title: "Study in Australia", description: "World-class education and lifestyle." },
      usa: { title: "Study in USA", description: "Top-ranked universities and opportunities." }
    },
    services: [
      { id: 1, title: "Admissions", description: "Expert guidance on university selection and application." },
      { id: 2, title: "Visa Support", description: "Comprehensive visa application assistance." },
      { id: 3, title: "Relocation", description: "Help with flights, accommodation, and settling in." }
    ],
    faqs: [
      { q: "How much does it cost?", a: "Costs vary by destination and program." },
      { q: "Do you guarantee visas?", a: "We maximize your chances but cannot guarantee issuance." }
    ]
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('key', 'site_content')
        .maybeSingle();
      
      if (data && data.value) {
        setContent(prev => ({ ...prev, ...data.value }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('admin_settings').upsert({
        key: 'site_content',
        value: content,
        updated_at: new Date()
      });
      if (error) throw error;
      toast({ title: "Content Updated", description: "Changes saved successfully." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const updateHero = (field, value) => {
    setContent(prev => ({
      ...prev,
      hero: { ...prev.hero, [field]: value }
    }));
  };

  const updateDestination = (country, field, value) => {
    setContent(prev => ({
      ...prev,
      destinations: {
        ...prev.destinations,
        [country]: { ...prev.destinations[country], [field]: value }
      }
    }));
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Content Manager</h2>
          <p className="text-slate-400">Edit website text and sections.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
          {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />} Save Changes
        </Button>
      </div>

      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="bg-slate-800 border-slate-700 w-full justify-start overflow-x-auto">
          <TabsTrigger value="hero"><Image className="w-4 h-4 mr-2" /> Hero Section</TabsTrigger>
          <TabsTrigger value="destinations"><Globe className="w-4 h-4 mr-2" /> Destinations</TabsTrigger>
          <TabsTrigger value="services"><List className="w-4 h-4 mr-2" /> Services</TabsTrigger>
          <TabsTrigger value="faqs"><CheckCircle2 className="w-4 h-4 mr-2" /> FAQs</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-4 mt-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Homepage Hero</CardTitle>
              <CardDescription>Edit the main banner text on the homepage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Headline</Label>
                <Input 
                  value={content.hero.title} 
                  onChange={(e) => updateHero('title', e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Subheadline</Label>
                <Textarea 
                  value={content.hero.subtitle} 
                  onChange={(e) => updateHero('subtitle', e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">CTA Button Text</Label>
                <Input 
                  value={content.hero.cta_text} 
                  onChange={(e) => updateHero('cta_text', e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="destinations" className="space-y-4 mt-4">
          {Object.entries(content.destinations).map(([key, data]) => (
            <Card key={key} className="bg-slate-900 border-slate-800 mb-4">
              <CardHeader>
                <CardTitle className="text-white capitalize">{key}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Title</Label>
                  <Input 
                    value={data.title} 
                    onChange={(e) => updateDestination(key, 'title', e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Description</Label>
                  <Textarea 
                    value={data.description} 
                    onChange={(e) => updateDestination(key, 'description', e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="services" className="space-y-4 mt-4">
          {content.services.map((service, index) => (
            <Card key={index} className="bg-slate-900 border-slate-800 mb-4">
              <CardHeader>
                <CardTitle className="text-white">Service {index + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Service Name</Label>
                  <Input 
                    value={service.title} 
                    onChange={(e) => {
                      const newServices = [...content.services];
                      newServices[index].title = e.target.value;
                      setContent(prev => ({ ...prev, services: newServices }));
                    }}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Description</Label>
                  <Textarea 
                    value={service.description} 
                    onChange={(e) => {
                      const newServices = [...content.services];
                      newServices[index].description = e.target.value;
                      setContent(prev => ({ ...prev, services: newServices }));
                    }}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="faqs" className="space-y-4 mt-4">
          {content.faqs.map((faq, index) => (
            <Card key={index} className="bg-slate-900 border-slate-800 mb-4">
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-white text-base">FAQ {index + 1}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    const newFaqs = content.faqs.filter((_, i) => i !== index);
                    setContent(prev => ({ ...prev, faqs: newFaqs }));
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  Delete
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Question</Label>
                  <Input 
                    value={faq.q} 
                    onChange={(e) => {
                      const newFaqs = [...content.faqs];
                      newFaqs[index].q = e.target.value;
                      setContent(prev => ({ ...prev, faqs: newFaqs }));
                    }}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Answer</Label>
                  <Textarea 
                    value={faq.a} 
                    onChange={(e) => {
                      const newFaqs = [...content.faqs];
                      newFaqs[index].a = e.target.value;
                      setContent(prev => ({ ...prev, faqs: newFaqs }));
                    }}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          <Button 
            variant="outline" 
            onClick={() => setContent(prev => ({ ...prev, faqs: [...prev.faqs, { q: "", a: "" }] }))}
            className="w-full border-dashed border-slate-700 text-slate-400 hover:text-white"
          >
            + Add New FAQ
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminContentManager;
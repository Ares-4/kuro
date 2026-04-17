import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Save, Loader2, Globe, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SiteSettingsManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [metrics, setMetrics] = useState({
    students_placed: '500+',
    partner_unis: '50+',
    visa_success: '98%',
    scholarships: '€2M+'
  });

  const [contact, setContact] = useState({
    email: 'support@kuroeduconsultancy.com',
    phone: '+48 123 456 789',
    address: 'Warsaw, Poland'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase.from('site_settings').select('*').in('key', ['site_metrics', 'contact_info']);
      
      if (data) {
        data.forEach(item => {
          if (item.key === 'site_metrics') setMetrics({ ...metrics, ...item.value });
          if (item.key === 'contact_info') setContact({ ...contact, ...item.value });
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key, value) => {
    setSaving(true);
    try {
      const { error } = await supabase.from('site_settings').upsert({
        key,
        value,
        updated_at: new Date()
      });
      if (error) throw error;
      toast({ title: "Settings Updated", description: "Changes are live on the website." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="metrics" className="gap-2"><TrendingUp className="w-4 h-4" /> Live Metrics</TabsTrigger>
          <TabsTrigger value="contact" className="gap-2"><Globe className="w-4 h-4" /> Contact Info</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          <Card className="bg-slate-800 border-slate-700 mt-4">
            <CardHeader>
              <CardTitle className="text-white">Website Metrics</CardTitle>
              <CardDescription className="text-slate-400">Update the stats shown on the homepage and landing pages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Students Placed</Label>
                  <Input value={metrics.students_placed} onChange={e => setMetrics({...metrics, students_placed: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Partner Universities</Label>
                  <Input value={metrics.partner_unis} onChange={e => setMetrics({...metrics, partner_unis: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Visa Success Rate</Label>
                  <Input value={metrics.visa_success} onChange={e => setMetrics({...metrics, visa_success: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Scholarships Won</Label>
                  <Input value={metrics.scholarships} onChange={e => setMetrics({...metrics, scholarships: e.target.value})} />
                </div>
              </div>
              <Button onClick={() => handleSave('site_metrics', metrics)} disabled={saving} className="bg-blue-600 w-full md:w-auto">
                {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />} Update Metrics
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card className="bg-slate-800 border-slate-700 mt-4">
            <CardHeader>
              <CardTitle className="text-white">Contact Information</CardTitle>
              <CardDescription className="text-slate-400">Global contact details used in footer and contact page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Support Email</Label>
                <Input value={contact.email} onChange={e => setContact({...contact, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input value={contact.phone} onChange={e => setContact({...contact, phone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Physical Address</Label>
                <Input value={contact.address} onChange={e => setContact({...contact, address: e.target.value})} />
              </div>
              <Button onClick={() => handleSave('contact_info', contact)} disabled={saving} className="bg-blue-600 w-full md:w-auto">
                {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />} Update Info
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SiteSettingsManager;
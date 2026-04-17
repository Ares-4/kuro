import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Save, Loader2, Settings, Globe, Mail, Bell, Shield, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/components/ui/use-toast';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    global: {
      companyName: "Kuro Education",
      contactEmail: "admin@kuro.com",
      phone: "+123456789",
      address: "Harare, Zimbabwe"
    },
    destinations: {
      enableNewDestinations: true,
      showComingSoon: false
    },
    scoring: {
      destinationWeight: 40,
      budgetWeight: 25,
      intakeWeight: 20,
      levelWeight: 10,
      originWeight: 5
    },
    notifications: {
      emailLeads: true,
      recipientEmail: "leads@kuro.com"
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('key', 'main_config')
        .maybeSingle();
      
      if (data?.value) {
        setSettings(prev => ({ ...prev, ...data.value }));
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
        key: 'main_config',
        value: settings,
        updated_at: new Date()
      });

      if (error) throw error;
      toast({ title: "Settings Saved", description: "System configuration updated." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value }
    }));
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">System Settings</h2>
          <p className="text-slate-400">Configure global platform parameters.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="global" className="w-full">
        <TabsList className="bg-slate-800 border-slate-700 w-full justify-start">
          <TabsTrigger value="global"><Globe className="w-4 h-4 mr-2" /> Global</TabsTrigger>
          <TabsTrigger value="scoring"><Sliders className="w-4 h-4 mr-2" /> Lead Scoring</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2" /> Notifications</TabsTrigger>
        </TabsList>

        {/* Global Settings */}
        <TabsContent value="global" className="mt-4 space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Company Name</Label>
                  <Input value={settings.global.companyName} onChange={e => updateSection('global', 'companyName', e.target.value)} className="bg-slate-950 border-slate-800 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Contact Email</Label>
                  <Input value={settings.global.contactEmail} onChange={e => updateSection('global', 'contactEmail', e.target.value)} className="bg-slate-950 border-slate-800 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lead Scoring */}
        <TabsContent value="scoring" className="mt-4 space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Scoring Weights</CardTitle>
              <CardDescription>Adjust how leads are scored (Total must equal 100)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: 'destinationWeight', label: 'Destination' },
                { key: 'budgetWeight', label: 'Budget' },
                { key: 'intakeWeight', label: 'Intake Timing' },
                { key: 'levelWeight', label: 'Study Level' },
                { key: 'originWeight', label: 'Origin Country' }
              ].map((item) => (
                <div key={item.key} className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-slate-300">{item.label}</Label>
                    <span className="text-blue-400 font-bold">{settings.scoring[item.key]}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={settings.scoring[item.key]} 
                    onChange={(e) => updateSection('scoring', item.key, parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-4 space-y-4">
          <Card className="bg-slate-900 border-slate-800">
             <CardHeader>
              <CardTitle className="text-white">Email Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                 <Label className="text-slate-300">Receive New Lead Alerts</Label>
                 <Switch 
                   checked={settings.notifications.emailLeads}
                   onCheckedChange={(checked) => updateSection('notifications', 'emailLeads', checked)}
                 />
              </div>
              <div className="space-y-2">
                 <Label className="text-slate-300">Recipient Email</Label>
                 <Input value={settings.notifications.recipientEmail} onChange={e => updateSection('notifications', 'recipientEmail', e.target.value)} className="bg-slate-950 border-slate-800 text-white" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default AdminSettings;
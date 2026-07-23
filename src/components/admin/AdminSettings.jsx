import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Save, Loader2, Globe, Bell, Sliders, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/components/ui/use-toast';
import { subscribeAdminToPush, unsubscribeAdminFromPush, isPushSubscribed } from '@/lib/pushNotifications';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingAdvisor, setSavingAdvisor] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    isPushSubscribed().then(setPushSubscribed);
  }, []);

  const handleTogglePush = async () => {
    setPushLoading(true);
    try {
      if (pushSubscribed) {
        await unsubscribeAdminFromPush();
        setPushSubscribed(false);
        toast({ title: "Push notifications disabled on this device" });
      } else {
        const sub = await subscribeAdminToPush();
        if (sub) {
          setPushSubscribed(true);
          toast({ title: "Push notifications enabled", description: "You'll get alerts on this device when someone submits their details." });
        } else {
          toast({ variant: "destructive", title: "Couldn't enable push", description: "Permission was denied or this browser doesn't support push. On iPhone, add this site to your Home Screen first." });
        }
      }
    } finally {
      setPushLoading(false);
    }
  };

  const [advisor, setAdvisor] = useState({
    enabled: true,
    name: 'Your Advisor',
    title: 'Senior Consultant',
    email: '',
    phone: '',
    avatar_url: '',
    message_link: ''
  });

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
      const [{ data: main }, { data: adv }] = await Promise.all([
        supabase.from('admin_settings').select('value').eq('key', 'main_config').maybeSingle(),
        supabase.from('admin_settings').select('value').eq('key', 'advisor_config').maybeSingle()
      ]);
      if (main?.value) setSettings(prev => ({ ...prev, ...main.value }));
      if (adv?.value) setAdvisor(prev => ({ ...prev, ...adv.value }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAdvisor = async () => {
    setSavingAdvisor(true);
    try {
      const { data: existing } = await supabase
        .from('admin_settings').select('key').eq('key', 'advisor_config').maybeSingle();
      const op = existing
        ? supabase.from('admin_settings').update({ value: advisor, updated_at: new Date() }).eq('key', 'advisor_config')
        : supabase.from('admin_settings').insert({ key: 'advisor_config', value: advisor });
      const { error } = await op;
      if (error) throw error;
      toast({ title: 'Advisor saved', description: 'Students will see the updated advisor card.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setSavingAdvisor(false);
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
        <TabsList className="bg-slate-800 border-slate-700 w-full justify-start flex-wrap h-auto">
          <TabsTrigger value="global"><Globe className="w-4 h-4 mr-2" /> Global</TabsTrigger>
          <TabsTrigger value="scoring"><Sliders className="w-4 h-4 mr-2" /> Lead Scoring</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2" /> Notifications</TabsTrigger>
          <TabsTrigger value="advisor"><UserCircle2 className="w-4 h-4 mr-2" /> Advisor Card</TabsTrigger>
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
              <CardTitle className="text-white">Push Notifications</CardTitle>
              <CardDescription className="text-slate-400">
                Get an instant alert on this device whenever someone submits a contact form, signup, application, or lead capture. On iPhone, add the site to your Home Screen first, then enable here from that app icon.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label className="text-slate-300">Enable on this device</Label>
                <Switch checked={pushSubscribed} disabled={pushLoading} onCheckedChange={handleTogglePush} />
              </div>
            </CardContent>
          </Card>
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

        {/* Advisor Card */}
        <TabsContent value="advisor" className="mt-4 space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Student Advisor Card</CardTitle>
              <CardDescription className="text-slate-400">
                Controls the "Contact Your Advisor" card shown to students in the Support tab.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                <div>
                  <p className="text-sm font-medium text-white">Show advisor card to students</p>
                  <p className="text-xs text-slate-400 mt-0.5">Toggle off to hide the card entirely from the student hub.</p>
                </div>
                <Switch
                  checked={advisor.enabled}
                  onCheckedChange={(v) => setAdvisor(a => ({ ...a, enabled: v }))}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Advisor Name</Label>
                  <Input value={advisor.name} onChange={e => setAdvisor(a => ({ ...a, name: e.target.value }))}
                    placeholder="e.g. Sarah Jenkins" className="bg-slate-950 border-slate-700 text-white" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Title / Role</Label>
                  <Input value={advisor.title} onChange={e => setAdvisor(a => ({ ...a, title: e.target.value }))}
                    placeholder="e.g. Senior Consultant" className="bg-slate-950 border-slate-700 text-white" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Email (optional)</Label>
                  <Input value={advisor.email} onChange={e => setAdvisor(a => ({ ...a, email: e.target.value }))}
                    placeholder="advisor@kuro.com" className="bg-slate-950 border-slate-700 text-white" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Phone (optional)</Label>
                  <Input value={advisor.phone} onChange={e => setAdvisor(a => ({ ...a, phone: e.target.value }))}
                    placeholder="+263 77 123 4567" className="bg-slate-950 border-slate-700 text-white" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-slate-300">Avatar URL (optional)</Label>
                  <Input value={advisor.avatar_url} onChange={e => setAdvisor(a => ({ ...a, avatar_url: e.target.value }))}
                    placeholder="https://..." className="bg-slate-950 border-slate-700 text-white" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-slate-300">Message Link (optional — mailto: or WhatsApp URL)</Label>
                  <Input value={advisor.message_link} onChange={e => setAdvisor(a => ({ ...a, message_link: e.target.value }))}
                    placeholder="mailto:advisor@kuro.com or https://wa.me/..." className="bg-slate-950 border-slate-700 text-white" />
                </div>
              </div>

              {/* Preview */}
              {advisor.enabled && (
                <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/40">
                  <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wide">Preview</p>
                  <div className="flex items-center gap-3 mb-4">
                    {advisor.avatar_url ? (
                      <img src={advisor.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                        <UserCircle2 className="w-7 h-7 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-white">{advisor.name || 'Advisor Name'}</div>
                      <div className="text-xs text-slate-400">{advisor.title || 'Role'}</div>
                      {advisor.email && <div className="text-xs text-slate-500">{advisor.email}</div>}
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={handleSaveAdvisor} disabled={savingAdvisor} className="bg-green-600 hover:bg-green-700">
                {savingAdvisor ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Advisor
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default AdminSettings;
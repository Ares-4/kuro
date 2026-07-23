import React, { useState, useEffect } from 'react';
import { Save, Loader2, Image, Users, Eye, EyeOff, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPageContent, updatePageContent } from '@/lib/contentService';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const AdminContentManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { adminUser } = useAdminAuth();

  const [content, setContent] = useState({
    hero: {
      title: "Global Study & Relocation Support",
      subtitle: "Your trusted partner for admissions, visa support, and relocation to top universities worldwide.",
      cta_label: "Start Your Journey"
    }
  });

  const [metrics, setMetrics] = useState({
    students_placed: '2,400+',
    visa_success: '91%',
    partner_unis: '50+',
  });
  const [savingMetrics, setSavingMetrics] = useState(false);

  const [team, setTeam] = useState({
    team_heading: '',
    team_intro: '',
    team_member_1_name: '', team_member_1_title: '', team_member_1_bio: '',
    team_member_2_name: '', team_member_2_title: '', team_member_2_bio: '',
    team_member_3_name: '', team_member_3_title: '', team_member_3_bio: '',
  });
  const [showTeam, setShowTeam] = useState(true);
  const [savingTeam, setSavingTeam] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [homeData, teamData] = await Promise.all([
        getPageContent('home'),
        getPageContent('expert_team'),
      ]);
      if (homeData) {
        setContent(prev => ({
          ...prev,
          hero: {
            title: homeData.hero_title || prev.hero.title,
            subtitle: homeData.hero_subtitle || prev.hero.subtitle,
            cta_label: homeData.hero_cta_label || prev.hero.cta_label,
          }
        }));
      }
      if (teamData) setTeam(prev => ({ ...prev, ...teamData }));

      const [{ data: teamSetting }, { data: metricsSetting }] = await Promise.all([
        supabase.from('site_settings').select('value').eq('key', 'show_expert_team_section').maybeSingle(),
        supabase.from('site_settings').select('value').eq('key', 'site_metrics').maybeSingle(),
      ]);
      if (teamSetting !== null && teamSetting?.value === false) setShowTeam(false);
      if (metricsSetting?.value) setMetrics(prev => ({ ...prev, ...metricsSetting.value }));

      setLoading(false);
    };
    load();
  }, []);

  const handleSaveMetrics = async () => {
    setSavingMetrics(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'site_metrics', value: metrics, updated_at: new Date() }, { onConflict: 'key' });
      if (error) throw error;
      toast({ title: 'Metrics updated', description: 'Changes are live on the homepage.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setSavingMetrics(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const userId = adminUser?.id;
      await Promise.all([
        updatePageContent('home', 'hero_title', content.hero.title, userId),
        updatePageContent('home', 'hero_subtitle', content.hero.subtitle, userId),
        updatePageContent('home', 'hero_cta_label', content.hero.cta_label, userId),
      ]);
      toast({ title: "Content updated", description: "Changes are live on the homepage." });
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

  const handleSaveTeam = async () => {
    setSavingTeam(true);
    try {
      const userId = adminUser?.id;
      await Promise.all(Object.entries(team).map(([key, val]) =>
        updatePageContent('expert_team', key, val, userId)
      ));
      toast({ title: 'Team updated', description: 'Changes are live on the homepage.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally { setSavingTeam(false); }
  };

  const toggleTeamVisibility = async (val) => {
    setShowTeam(val);
    await supabase.from('site_settings').upsert({ key: 'show_expert_team_section', value: val }, { onConflict: 'key' });
    toast({ title: val ? 'Team section visible' : 'Team section hidden' });
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
          <TabsTrigger value="team"><Users className="w-4 h-4 mr-2" /> Expert Team</TabsTrigger>
          <TabsTrigger value="metrics"><TrendingUp className="w-4 h-4 mr-2" /> Site Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-4 mt-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Homepage Hero</CardTitle>
              <CardDescription className="text-slate-400">Changes save directly to the live homepage.</CardDescription>
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
                  value={content.hero.cta_label}
                  onChange={(e) => updateHero('cta_label', e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">Expert team section</h3>
              <p className="text-slate-400 text-xs mt-0.5">Edit names, titles, and bios for your 3 advisors.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleTeamVisibility(!showTeam)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${showTeam ? 'bg-emerald-900/30 border-emerald-700 text-emerald-400 hover:bg-red-900/20 hover:border-red-700 hover:text-red-400' : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-emerald-600 hover:text-emerald-400'}`}
              >
                {showTeam ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {showTeam ? 'Visible' : 'Hidden'}
              </button>
              <Button onClick={handleSaveTeam} disabled={savingTeam} className="bg-green-600 hover:bg-green-700">
                {savingTeam ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />} Save Team
              </Button>
            </div>
          </div>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Section heading</Label>
                  <Input value={team.team_heading} onChange={e => setTeam(p => ({ ...p, team_heading: e.target.value }))} className="bg-slate-950 border-slate-800 text-white" placeholder="Advisors who have been there" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Section intro</Label>
                  <Input value={team.team_intro} onChange={e => setTeam(p => ({ ...p, team_intro: e.target.value }))} className="bg-slate-950 border-slate-800 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {[1, 2, 3].map(num => (
            <Card key={num} className="bg-slate-900 border-slate-800">
              <CardHeader><CardTitle className="text-white text-sm">Advisor {num}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-xs">Name</Label>
                    <Input value={team[`team_member_${num}_name`]} onChange={e => setTeam(p => ({ ...p, [`team_member_${num}_name`]: e.target.value }))} className="bg-slate-950 border-slate-800 text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-xs">Title / Role</Label>
                    <Input value={team[`team_member_${num}_title`]} onChange={e => setTeam(p => ({ ...p, [`team_member_${num}_title`]: e.target.value }))} className="bg-slate-950 border-slate-800 text-white" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs">Bio</Label>
                  <Textarea value={team[`team_member_${num}_bio`]} onChange={e => setTeam(p => ({ ...p, [`team_member_${num}_bio`]: e.target.value }))} className="bg-slate-950 border-slate-800 text-white" rows={2} />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4 mt-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Homepage Stats</CardTitle>
              <CardDescription className="text-slate-400">
                These are the numbers shown in the credibility strip on the homepage (e.g. "2,400+ Students placed").
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Students Placed</Label>
                  <Input
                    value={metrics.students_placed}
                    onChange={(e) => setMetrics(p => ({ ...p, students_placed: e.target.value }))}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Visa Success Rate</Label>
                  <Input
                    value={metrics.visa_success}
                    onChange={(e) => setMetrics(p => ({ ...p, visa_success: e.target.value }))}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Partner Universities</Label>
                  <Input
                    value={metrics.partner_unis}
                    onChange={(e) => setMetrics(p => ({ ...p, partner_unis: e.target.value }))}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </div>
              <Button onClick={handleSaveMetrics} disabled={savingMetrics} className="bg-green-600 hover:bg-green-700">
                {savingMetrics ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />} Save Metrics
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminContentManager;
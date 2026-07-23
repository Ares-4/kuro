import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import Sections
import ApplicationStatusSection from '@/components/dashboard/sections/ApplicationStatusSection';
import DestinationInfoSection from '@/components/dashboard/sections/DestinationInfoSection';
import TimelineAndMilestonesSection from '@/components/dashboard/sections/TimelineAndMilestonesSection';
import DocumentsChecklistSection from '@/components/dashboard/sections/DocumentsChecklistSection';
import ResourcesAndSupportSection from '@/components/dashboard/sections/ResourcesAndSupportSection';
import CommunityHub from '@/components/community/CommunityHub'; // New Component

const StudentHub = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [currentStudentId, setCurrentStudentId] = useState(null);
  const [advisor, setAdvisor] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [id] = await Promise.all([
        getStudentId(),
        supabase.from('admin_settings').select('value').eq('key', 'advisor_config').maybeSingle()
          .then(({ data }) => { if (data?.value?.enabled !== false) setAdvisor(data?.value || null); })
      ]);
      setCurrentStudentId(id);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const getStudentId = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
      
    if (error) throw error;
    
    if (!data) {
      const { data: newStudent, error: createError } = await supabase
        .from('students')
        .insert([{
          user_id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student'
        }])
        .select('id')
        .single();
        
      if (createError) throw new Error("Could not create student profile. Please contact support.");
      return newStudent.id;
    }
    
    return data.id;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Student Hub</h1>
          <p className="text-slate-400">Track your progress and connect with others.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-800 border-slate-700 text-slate-400 w-full justify-start mb-6 overflow-x-auto">
          <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="timeline" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">Timeline & Docs</TabsTrigger>
          <TabsTrigger value="community" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">Community & Chat</TabsTrigger>
          <TabsTrigger value="support" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">Support</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="mt-0 space-y-6">
          <ApplicationStatusSection studentId={currentStudentId} />
          <div className="grid md:grid-cols-2 gap-6">
            <DestinationInfoSection studentId={currentStudentId} />
            <TimelineAndMilestonesSection studentId={currentStudentId} />
          </div>
        </TabsContent>

        {/* TIMELINE TAB */}
        <TabsContent value="timeline" className="mt-0 space-y-6">
           <div className="grid md:grid-cols-3 gap-6">
             <div className="md:col-span-2 h-full">
                <DocumentsChecklistSection studentId={currentStudentId} />
             </div>
             <div>
                <ResourcesAndSupportSection />
             </div>
           </div>
        </TabsContent>

        {/* COMMUNITY TAB - NEW */}
        <TabsContent value="community" className="mt-0">
           <CommunityHub studentId={currentStudentId} />
        </TabsContent>

        {/* SUPPORT TAB */}
        <TabsContent value="support" className="mt-0">
          <div className="grid md:grid-cols-2 gap-6">
            <ResourcesAndSupportSection />
            {advisor && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="font-bold text-white mb-1">Contact Your Advisor</h3>
                <p className="text-slate-400 text-sm mb-4">You have been assigned a dedicated advisor to help with your application.</p>
                <div className="flex items-center gap-3 mb-6">
                  {advisor.avatar_url ? (
                    <img src={advisor.avatar_url} alt={advisor.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-700" />
                  )}
                  <div>
                    <div className="font-bold text-white">{advisor.name}</div>
                    <div className="text-xs text-slate-400">{advisor.title}</div>
                    {advisor.email && <div className="text-xs text-slate-500 mt-0.5">{advisor.email}</div>}
                    {advisor.phone && <div className="text-xs text-slate-500">{advisor.phone}</div>}
                  </div>
                </div>
                {advisor.message_link ? (
                  <a href={advisor.message_link} target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Send Message</Button>
                  </a>
                ) : (
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled>Send Message</Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default StudentHub;
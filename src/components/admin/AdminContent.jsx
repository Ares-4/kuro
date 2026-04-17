import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Video, MessageSquare, BarChart2, FileText, HelpCircle, Mail, Settings } from 'lucide-react';
import FaqManager from './content/FaqManager';
import TestimonialManager from './content/TestimonialManager';
import EmailTemplateManager from './content/EmailTemplateManager';
import SiteSettingsManager from './content/SiteSettingsManager';
import CommunityModeration from './content/CommunityModeration';
import MediaManager from './content/MediaManager';
import BlogManager from './content/BlogManager';
import ContentAnalytics from './content/ContentAnalytics';

const AdminContent = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Content Management</h2>
        <p className="text-slate-400 text-sm md:text-base">Manage website content, media, community, and analytics.</p>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        {/* Scrollable Tabs List for Mobile */}
        <div className="w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <TabsList className="bg-slate-800 border-slate-700 text-slate-400 inline-flex w-auto min-w-full justify-start h-auto p-1">
            <TabsTrigger value="analytics" className="gap-2 px-3 py-2 whitespace-nowrap"><BarChart2 className="w-4 h-4" /> Analytics</TabsTrigger>
            <TabsTrigger value="moderation" className="gap-2 px-3 py-2 whitespace-nowrap"><MessageSquare className="w-4 h-4" /> Community</TabsTrigger>
            <TabsTrigger value="media" className="gap-2 px-3 py-2 whitespace-nowrap"><Video className="w-4 h-4" /> Podcast/Video</TabsTrigger>
            <TabsTrigger value="blog" className="gap-2 px-3 py-2 whitespace-nowrap"><BookOpen className="w-4 h-4" /> Blog</TabsTrigger>
            <TabsTrigger value="faqs" className="gap-2 px-3 py-2 whitespace-nowrap"><HelpCircle className="w-4 h-4" /> FAQs</TabsTrigger>
            <TabsTrigger value="testimonials" className="gap-2 px-3 py-2 whitespace-nowrap"><FileText className="w-4 h-4" /> Testimonials</TabsTrigger>
            <TabsTrigger value="emails" className="gap-2 px-3 py-2 whitespace-nowrap"><Mail className="w-4 h-4" /> Emails</TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 px-3 py-2 whitespace-nowrap"><Settings className="w-4 h-4" /> Settings</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="analytics" className="space-y-4"><ContentAnalytics /></TabsContent>
        <TabsContent value="moderation" className="space-y-4"><CommunityModeration /></TabsContent>
        <TabsContent value="media" className="space-y-4"><MediaManager /></TabsContent>
        <TabsContent value="blog" className="space-y-4"><BlogManager /></TabsContent>
        <TabsContent value="faqs" className="space-y-4"><FaqManager /></TabsContent>
        <TabsContent value="testimonials" className="space-y-4"><TestimonialManager /></TabsContent>
        <TabsContent value="emails" className="space-y-4"><EmailTemplateManager /></TabsContent>
        <TabsContent value="settings" className="space-y-4"><SiteSettingsManager /></TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminContent;
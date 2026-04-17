import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Video, BookOpen, MessageCircle, TrendingUp, Eye } from 'lucide-react';

const StatCard = ({ title, value, description, icon: Icon, trend }) => (
  <Card className="bg-slate-800 border-slate-700">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-slate-200">
        {title}
      </CardTitle>
      <Icon className="h-4 w-4 text-slate-400" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-white">{value}</div>
      <p className="text-xs text-slate-400 mt-1">
        {trend > 0 ? <span className="text-green-400 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +{trend}%</span> : <span className="text-slate-500">No change</span>} 
        <span className="ml-1 opacity-75">{description}</span>
      </p>
    </CardContent>
  </Card>
);

const ContentAnalytics = () => {
  const [stats, setStats] = useState({
    activeUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    mediaViews: 0,
    blogViews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Parallel requests for dashboard stats
      const [
        { count: usersCount },
        { count: postsCount },
        { count: commentsCount },
        { data: mediaData },
        { data: blogData }
      ] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('hub_posts').select('*', { count: 'exact', head: true }),
        supabase.from('hub_comments').select('*', { count: 'exact', head: true }),
        supabase.from('media_library').select('views'),
        supabase.from('blog_posts').select('views')
      ]);

      const totalMediaViews = mediaData?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0;
      const totalBlogViews = blogData?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0;

      setStats({
        activeUsers: usersCount || 0,
        totalPosts: postsCount || 0,
        totalComments: commentsCount || 0,
        mediaViews: totalMediaViews,
        blogViews: totalBlogViews
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Community Members" 
          value={stats.activeUsers} 
          description="registered students"
          icon={Users}
          trend={12}
        />
        <StatCard 
          title="Media Engagement" 
          value={stats.mediaViews} 
          description="video & podcast views"
          icon={Video}
          trend={5}
        />
        <StatCard 
          title="Blog Readership" 
          value={stats.blogViews} 
          description="article reads"
          icon={BookOpen}
          trend={8}
        />
        <StatCard 
          title="Discussions" 
          value={stats.totalPosts + stats.totalComments} 
          description="posts & comments"
          icon={MessageCircle}
          trend={15}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-slate-400">Latest engagement across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               {/* Simulated activity feed */}
               <div className="flex items-center gap-4 text-sm">
                 <div className="w-2 h-2 rounded-full bg-green-500"></div>
                 <span className="text-slate-300">New student registration</span>
                 <span className="ml-auto text-slate-500">2m ago</span>
               </div>
               <div className="flex items-center gap-4 text-sm">
                 <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                 <span className="text-slate-300">New comment on "Study in Japan"</span>
                 <span className="ml-auto text-slate-500">15m ago</span>
               </div>
               <div className="flex items-center gap-4 text-sm">
                 <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                 <span className="text-slate-300">Blog post "Visa Guide" published</span>
                 <span className="ml-auto text-slate-500">1h ago</span>
               </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Content Performance</CardTitle>
            <CardDescription className="text-slate-400">Top performing content this week</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <Video className="w-4 h-4 text-purple-400" />
                   <span className="text-slate-200">Podcast: Student Life Ep.1</span>
                 </div>
                 <div className="flex items-center gap-1 text-slate-400 text-sm">
                   <Eye className="w-3 h-3" /> 1,204
                 </div>
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <BookOpen className="w-4 h-4 text-blue-400" />
                   <span className="text-slate-200">Guide: Top 10 Unis</span>
                 </div>
                 <div className="flex items-center gap-1 text-slate-400 text-sm">
                   <Eye className="w-3 h-3" /> 892
                 </div>
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <MessageCircle className="w-4 h-4 text-green-400" />
                   <span className="text-slate-200">Thread: Visa Delays?</span>
                 </div>
                 <div className="flex items-center gap-1 text-slate-400 text-sm">
                   <Eye className="w-3 h-3" /> 456
                 </div>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContentAnalytics;
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Bell, Calendar, Megaphone, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BackButton } from '@/components/ui/back-button';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const NoticeView = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotices();
    }
  }, [user]);

  const fetchNotices = async () => {
    try {
      // First get the student ID
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (studentError) throw studentError;

      if (!studentData) {
        setNotices([]);
        setLoading(false);
        return;
      }

      // Fetch notices: either targeted to 'all' or specifically to this student
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .eq('is_active', true)
        .or(`target_audience.eq.all,and(target_audience.eq.specific,student_id.eq.${studentData.id})`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotices(data || []);

    } catch (error) {
      console.error('Error fetching notices:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load notices."
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p>Checking for updates...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <BackButton label="Back to Dashboard" />
      
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Megaphone className="w-8 h-8 text-yellow-500" />
          Important Notices
        </h1>
        <p className="text-slate-400">Stay updated with the latest announcements and required actions.</p>
      </div>

      <div className="space-y-6">
        {notices.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
            <Bell className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-1">All Caught Up!</h3>
            <p className="text-slate-400 text-sm">You have no new notices at this time.</p>
          </div>
        ) : (
          notices.map((notice, index) => (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
                <CardHeader className="bg-slate-800 border-b border-slate-700/50 pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        {notice.target_audience === 'specific' && (
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px] px-1.5 h-5">
                            Private
                          </Badge>
                        )}
                        {notice.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 text-slate-400 text-xs">
                        <Calendar className="w-3 h-3" />
                        {new Date(notice.created_at).toLocaleDateString(undefined, { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </CardDescription>
                    </div>
                    {notice.target_audience === 'all' ? (
                       <Badge className="bg-green-500/10 text-green-400 border-green-500/20 whitespace-nowrap">
                         Announcement
                       </Badge>
                    ) : (
                       <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 whitespace-nowrap flex gap-1 items-center">
                         <AlertCircle className="w-3 h-3" /> Action Required
                       </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-line">
                    {notice.content}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default NoticeView;
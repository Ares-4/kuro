import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { BookOpen, FileText, Globe, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DashboardHome = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    applications: 0,
    programs: 0,
    countries: 5
  });
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Get student data safely
      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Changed from .single() to prevent PGRST116
      
      setStudent(studentData);

      // Get applications count
      if (studentData) {
        const { count } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', studentData.id);
        
        setStats(prev => ({ ...prev, applications: count || 0 }));
      }

      // Get programs count
      const { count: programsCount } = await supabase
        .from('programs')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      
      setStats(prev => ({ ...prev, programs: programsCount || 0 }));
    };

    fetchData();
  }, [user]);

  const quickActions = [
    { name: 'Browse Programs', icon: BookOpen, path: '/dashboard/programs', color: 'bg-blue-600' },
    { name: 'View Countries', icon: Globe, path: '/dashboard/countries', color: 'bg-green-600' },
    { name: 'My Applications', icon: FileText, path: '/dashboard/applications', color: 'bg-purple-600' },
    { name: 'Student Hub', icon: TrendingUp, path: '/dashboard/hub', color: 'bg-orange-600' }
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome back, {student?.full_name || user?.user_metadata?.full_name || 'Student'}! 👋
        </h1>
        <p className="text-xl text-slate-300">Ready to continue your study abroad journey?</p>
      </motion.div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">My Applications</span>
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.applications}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Available Programs</span>
            <BookOpen className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.programs}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Countries</span>
            <Globe className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.countries}</div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Link
                to={action.path}
                className={`block ${action.color} rounded-xl p-6 hover:opacity-90 transition-opacity`}
              >
                <action.icon className="w-8 h-8 text-white mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">{action.name}</h3>
                <ArrowRight className="w-5 h-5 text-white" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Getting Started</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">1</span>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Explore Programs</h3>
              <p className="text-slate-300 text-sm">Browse through our carefully selected programs across Europe</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">2</span>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Submit Application</h3>
              <p className="text-slate-300 text-sm">Complete your application with required documents</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">3</span>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Payment & Processing</h3>
              <p className="text-slate-300 text-sm">Complete payment and we'll process your application</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import {
  FileText, Users, GraduationCap, TrendingUp, Clock,
  CheckCircle2, XCircle, AlertCircle, ChevronRight,
  BarChart3, Globe, BookOpen, Zap, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.07, ease: [0.25, 0.4, 0.25, 1] } }),
};

function MiniBar({ value, max, color = 'bg-primary' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
    </div>
  );
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'text-blue-400', bg: 'bg-blue-500/10', bar: 'bg-blue-500', badge: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  reviewing: { label: 'In review', color: 'text-amber-400', bg: 'bg-amber-500/10', bar: 'bg-amber-500', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  accepted: { label: 'Accepted', color: 'text-emerald-400', bg: 'bg-emerald-500/10', bar: 'bg-emerald-500', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  rejected: { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-500/10', bar: 'bg-red-500', badge: 'bg-red-500/15 text-red-400 border-red-500/25' },
  incomplete: { label: 'Incomplete', color: 'text-slate-400', bg: 'bg-slate-500/10', bar: 'bg-slate-500', badge: 'bg-slate-500/15 text-slate-400 border-slate-500/25' },
};

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [topPrograms, setTopPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [
        { count: totalApps },
        { count: totalStudents },
        { count: totalPrograms },
        { count: totalLeads },
        { count: pendingCount },
        { count: reviewingCount },
        { count: acceptedCount },
        { count: rejectedCount },
        { data: recent },
        { data: programs },
      ] = await Promise.all([
        supabase.from('applications').select('*', { count: 'exact', head: true }),
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('programs').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'reviewing'),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'accepted'),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
        supabase.from('applications')
          .select('id, status, created_at, students(full_name, email), programs(program_name, university)')
          .order('created_at', { ascending: false })
          .limit(6),
        supabase.from('programs')
          .select('id, program_name, university')
          .eq('is_active', true)
          .limit(4),
      ]);

      setStats({
        totalApps: totalApps || 0,
        totalStudents: totalStudents || 0,
        totalPrograms: totalPrograms || 0,
        totalLeads: totalLeads || 0,
        byStatus: {
          pending: pendingCount || 0,
          reviewing: reviewingCount || 0,
          accepted: acceptedCount || 0,
          rejected: rejectedCount || 0,
        },
      });
      setRecentApps(recent || []);
      setTopPrograms(programs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    load();
  };

  const totalByStatus = stats ? Object.values(stats.byStatus).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time platform metrics</p>
        </div>
        <Button size="sm" variant="outline" onClick={handleRefresh} disabled={refreshing} className="gap-2">
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* ── Top metrics ── */}
      <motion.div
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        initial="hidden" animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total applications', value: stats?.totalApps ?? '—', icon: FileText, color: 'text-blue-400', sub: 'all time' },
          { label: 'Registered students', value: stats?.totalStudents ?? '—', icon: Users, color: 'text-violet-400', sub: 'accounts' },
          { label: 'Active programs', value: stats?.totalPrograms ?? '—', icon: GraduationCap, color: 'text-emerald-400', sub: 'listed' },
          { label: 'Total leads', value: stats?.totalLeads ?? '—', icon: TrendingUp, color: 'text-amber-400', sub: 'inquiries' },
        ].map((s, i) => (
          <motion.div key={i} variants={fadeUp} custom={i}
            className="rounded-xl border border-border/60 bg-card p-5 hover:border-primary/25 transition-colors spotlight-card"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            {loading ? (
              <div className="skeleton h-8 w-16 rounded mb-1" />
            ) : (
              <p className="text-3xl font-bold text-white tabular">{s.value}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Main grid ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Application pipeline */}
        <motion.div variants={fadeUp} initial="hidden" animate="show"
          className="lg:col-span-2 rounded-xl border border-border/60 bg-card overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-white text-sm">Application pipeline</h2>
            </div>
            <Link to="/admin/applications" className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors">
              Manage <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-6 space-y-4">
            {loading ? (
              [...Array(4)].map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />)
            ) : (
              Object.entries(STATUS_CONFIG).filter(([k]) => k !== 'incomplete').map(([status, cfg]) => {
                const count = stats?.byStatus[status] ?? 0;
                return (
                  <div key={status} className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${cfg.bar} shrink-0`} />
                    <div className="w-24 shrink-0">
                      <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <div className="flex-1">
                      <MiniBar value={count} max={totalByStatus} color={cfg.bar} />
                    </div>
                    <span className="text-sm font-semibold text-white tabular w-8 text-right shrink-0">{count}</span>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={fadeUp} custom={1} initial="hidden" animate="show"
          className="rounded-xl border border-border/60 bg-card overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-border/50 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-white text-sm">Quick actions</h2>
          </div>
          <div className="p-4 space-y-2">
            {[
              { label: 'Review pending applications', icon: Clock, path: '/admin/applications', badge: stats?.byStatus.pending },
              { label: 'Manage programs', icon: GraduationCap, path: '/admin/courses' },
              { label: 'Create a notice', icon: AlertCircle, path: '/admin/notices' },
              { label: 'View leads', icon: Users, path: '/admin/leads', badge: stats?.totalLeads },
              { label: 'Edit website content', icon: Globe, path: '/admin/public-content' },
            ].map((action, i) => (
              <Link key={i} to={action.path}
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted/60 transition-colors group"
              >
                <action.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                <span className="text-sm text-muted-foreground group-hover:text-white transition-colors flex-1">{action.label}</span>
                {action.badge > 0 && (
                  <span className="text-[10px] font-bold bg-primary/15 text-primary border border-primary/25 px-1.5 py-0.5 rounded-md tabular">
                    {action.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Recent applications ── */}
      <motion.div variants={fadeUp} custom={2} initial="hidden" animate="show"
        className="rounded-xl border border-border/60 bg-card overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-white text-sm">Recent applications</h2>
          </div>
          <Link to="/admin/applications" className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40">
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground tracking-wide uppercase">Student</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground tracking-wide uppercase">Program</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground tracking-wide uppercase">Date</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground tracking-wide uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(4)].map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="skeleton h-3.5 rounded" style={{ width: `${60 + j * 10}%` }} /></td>
                    ))}
                  </tr>
                ))
              ) : recentApps.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    No applications yet
                  </td>
                </tr>
              ) : (
                recentApps.map((app) => {
                  const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.incomplete;
                  return (
                    <tr key={app.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-white">{app.students?.full_name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{app.students?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-slate-300">{app.programs?.program_name || '—'}</p>
                          <p className="text-xs text-muted-foreground">{app.programs?.university}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground tabular">
                          {new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={`text-[10px] border ${cfg.badge}`}>{cfg.label}</Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── Active programs ── */}
      {topPrograms.length > 0 && (
        <motion.div variants={fadeUp} custom={3} initial="hidden" animate="show"
          className="rounded-xl border border-border/60 bg-card overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-white text-sm">Active programs</h2>
            </div>
            <Link to="/admin/courses" className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors">
              Manage <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border/40">
            {topPrograms.map((prog, i) => (
              <div key={prog.id} className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="w-4 h-4 text-primary shrink-0" />
                  <Badge variant="secondary" className="text-[10px]">{prog.level}</Badge>
                </div>
                <p className="text-sm font-semibold text-white leading-snug mb-1">{prog.program_name}</p>
                <p className="text-xs text-muted-foreground">{prog.university}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminOverview;

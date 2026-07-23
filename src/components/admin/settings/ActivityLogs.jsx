import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Clock, Download, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      // In a real scenario, you'd join with user table to get names
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Action,Details,Date\n"
      + logs.map(e => `${e.id},${e.action},"${JSON.stringify(e.details).replace(/"/g, '""')}",${e.created_at}`).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `activity_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
             <CardTitle className="text-white">Activity Logs</CardTitle>
             <CardDescription className="text-slate-400">Recent administrative actions and system changes.</CardDescription>
          </div>
          <Button variant="outline" onClick={handleExport} className="border-slate-600 text-slate-300">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p className="text-slate-400 text-center py-4">Loading logs...</p>
            ) : logs.length === 0 ? (
              <p className="text-slate-400 text-center py-4">No activity recorded yet.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex gap-4 p-3 rounded bg-slate-900/50 border border-slate-700/50 text-sm">
                  <div className="mt-0.5"><Clock className="w-4 h-4 text-slate-500" /></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-semibold text-white">{log.action.replace(/_/g, ' ')}</span>
                      <span className="text-slate-500 text-xs">{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-400 mt-1 font-mono text-xs">
                      {JSON.stringify(log.details)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Backup & Data</CardTitle>
          <CardDescription className="text-slate-400">Manage system data retention and backups.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-blue-900/20 rounded-full text-blue-400">
               <Database className="w-6 h-6" />
             </div>
             <div>
               <h4 className="font-medium text-white">Full System Backup</h4>
               <p className="text-sm text-slate-400">Download a complete snapshot of the database.</p>
             </div>
          </div>
          <Button variant="default" className="bg-blue-600">Create Backup</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLogs;
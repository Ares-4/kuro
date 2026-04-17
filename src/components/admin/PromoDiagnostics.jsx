import React, { useEffect, useState } from 'react';
import { usePublicSiteSettings } from '@/contexts/PublicSiteSettingsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle2, XCircle, AlertTriangle, Database } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const PromoDiagnostics = () => {
  const { siteSettings, refreshPublicSettings, loading, error } = usePublicSiteSettings();
  const [dbStatus, setDbStatus] = useState('checking');
  const [directFetchResult, setDirectFetchResult] = useState(null);

  const promos = siteSettings?.promos || {};
  const placements = siteSettings?.ad_placements || {};

  const checkDirectDatabase = async () => {
    setDbStatus('checking');
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .in('key', ['promos', 'ad_placements']);
      
      if (error) throw error;
      
      setDirectFetchResult(data);
      setDbStatus('ok');
    } catch (err) {
      console.error('Diagnostic DB Check Failed:', err);
      setDbStatus('error');
      setDirectFetchResult({ error: err.message });
    }
  };

  useEffect(() => {
    checkDirectDatabase();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Promo Diagnostics</h2>
          <p className="text-slate-400">Troubleshoot visibility and data persistence issues.</p>
        </div>
        <Button onClick={() => { refreshPublicSettings(); checkDirectDatabase(); }} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh All
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Status Card */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" /> System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-800 rounded">
              <span className="text-slate-300">Context Loading</span>
              {loading ? <span className="text-yellow-500">Loading...</span> : <span className="text-green-500">Idle</span>}
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800 rounded">
              <span className="text-slate-300">Context Error</span>
              {error ? <span className="text-red-500 text-sm truncate max-w-[150px]" title={error}>{error}</span> : <span className="text-green-500">None</span>}
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800 rounded">
              <span className="text-slate-300">DB Connection</span>
              {dbStatus === 'ok' ? (
                <span className="flex items-center text-green-500 gap-1"><CheckCircle2 className="w-4 h-4"/> Connected</span>
              ) : dbStatus === 'checking' ? (
                <span className="text-yellow-500">Checking...</span>
              ) : (
                <span className="flex items-center text-red-500 gap-1"><XCircle className="w-4 h-4"/> Error</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Promos Summary */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
             <CardTitle className="text-lg text-white">Promos Data</CardTitle>
             <CardDescription>Loaded in memory</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="text-3xl font-bold text-white mb-2">{Object.keys(promos).length}</div>
             <p className="text-slate-500 text-sm">Defined Promos</p>
             <div className="mt-4 space-y-1">
               {Object.keys(promos).map(id => (
                 <div key={id} className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded flex justify-between">
                   <span>{id}</span>
                   <span className={promos[id].enabled ? 'text-green-400' : 'text-red-400'}>
                     {promos[id].enabled ? 'Active' : 'Disabled'}
                   </span>
                 </div>
               ))}
             </div>
          </CardContent>
        </Card>

        {/* Placements Summary */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
             <CardTitle className="text-lg text-white">Placements</CardTitle>
             <CardDescription>Active slot assignments</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="text-3xl font-bold text-white mb-2">
               {Object.values(placements).reduce((acc, page) => acc + Object.keys(page).length, 0)}
             </div>
             <p className="text-slate-500 text-sm">Total Placements</p>
             <div className="mt-4 space-y-1 max-h-[150px] overflow-y-auto">
               {Object.entries(placements).map(([page, slots]) => (
                 Object.entries(slots).map(([slot, config]) => (
                   <div key={`${page}-${slot}`} className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
                     <span className="text-blue-400">{page}</span> : {slot} → {config.type}
                   </div>
                 ))
               ))}
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Raw Data Inspector */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Raw Data Inspector</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2">Context State (React)</h3>
              <pre className="bg-slate-950 p-4 rounded-lg text-xs text-slate-300 overflow-auto max-h-[400px]">
                {JSON.stringify({ promos, placements }, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2">Direct DB Fetch (Supabase)</h3>
              <pre className="bg-slate-950 p-4 rounded-lg text-xs text-green-300 overflow-auto max-h-[400px]">
                {JSON.stringify(directFetchResult, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromoDiagnostics;
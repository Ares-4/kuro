import React from 'react';
import { AlertTriangle, FileCode, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const StartupErrorModal = ({ missingVars, onRetry }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
      <div className="w-full max-w-lg p-6 bg-slate-900 border border-red-900/50 rounded-xl shadow-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-red-900/20 flex items-center justify-center text-red-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Configuration Error</h2>
            <p className="text-slate-400 text-sm">Application cannot start due to missing settings</p>
          </div>
        </div>

        <Alert variant="destructive" className="mb-6 bg-red-950/10 border-red-900/20">
          <AlertTitle className="text-red-400 mb-2">Missing Environment Variables</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 space-y-1 text-xs font-mono text-slate-300">
              {missingVars.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>

        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            <FileCode className="w-4 h-4 text-blue-400" />
            How to fix this:
          </h3>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs text-slate-400 font-mono">
             <p className="mb-2">1. Create a <span className="text-yellow-400">.env</span> file in the project root.</p>
             <p className="mb-2">2. Add the missing variables listed above.</p>
             <p>3. Restart the development server.</p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button onClick={onRetry} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Connection
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StartupErrorModal;
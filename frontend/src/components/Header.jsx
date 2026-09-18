import React from 'react';
import { ShieldAlert, Activity, RefreshCw } from 'lucide-react';

export const Header = ({ backendStatus, aiStatus, onRefresh }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Banking AI Early Warning
              <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Hackathon MVP
              </span>
            </h1>
            <p className="text-xs text-slate-400">Decision Intelligence & Delinquency Prevention</p>
          </div>
        </div>

        {/* Live Service Status Badges */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Node Backend:</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-medium ${
              backendStatus.online 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${backendStatus.online ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              {backendStatus.loading ? 'Checking...' : backendStatus.online ? 'Online (:5000)' : 'Offline'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">AI Service:</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-medium ${
              aiStatus.online 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${aiStatus.online ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              {aiStatus.loading ? 'Checking...' : aiStatus.online ? 'Online (:8000)' : 'Offline'}
            </span>
          </div>

          <button
            onClick={onRefresh}
            title="Refresh Service Health Checks"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

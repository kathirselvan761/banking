import React from 'react';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

export const LoadingState = ({ message = 'Loading intelligence telemetry...', height = 'h-64' }) => {
  return (
    <div className={`w-full ${height} flex flex-col items-center justify-center rounded-xl bg-slate-900/40 border border-slate-800/80 p-8 text-center backdrop-blur-sm`}>
      <Loader2 className="w-8 h-8 text-sky-400 animate-spin mb-3" />
      <p className="text-sm text-slate-300 font-medium">{message}</p>
      <p className="text-xs text-slate-500 mt-1">Connecting to AI inference and banking models</p>
    </div>
  );
};

export const ErrorState = ({ message = 'Unable to load banking data', onRetry, height = 'h-64' }) => {
  return (
    <div className={`w-full ${height} flex flex-col items-center justify-center rounded-xl bg-rose-950/20 border border-rose-800/40 p-8 text-center`}>
      <AlertTriangle className="w-9 h-9 text-rose-400 mb-3" />
      <h4 className="text-base font-semibold text-rose-200 mb-1">Telemetry Disruption</h4>
      <p className="text-xs text-rose-300/80 max-w-md mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-xs font-medium transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Connection
        </button>
      )}
    </div>
  );
};

export default LoadingState;

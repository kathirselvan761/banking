import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const ErrorState = ({
  message = 'Unable to retrieve risk information.',
  onRetry,
  height = 'h-64'
}) => {
  return (
    <div
      className={`w-full ${height} flex flex-col items-center justify-center rounded-2xl bg-rose-950/20 border border-rose-800/40 p-8 text-center backdrop-blur-sm`}
    >
      <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-3">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h4 className="text-base font-bold text-rose-200 mb-1">
        Telemetry Disruption
      </h4>
      <p className="text-xs text-rose-300/80 max-w-md mb-4 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-xs font-semibold transition-all hover:scale-105"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Connection
        </button>
      )}
    </div>
  );
};

export default ErrorState;

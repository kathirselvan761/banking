import React from 'react';
import {
  Calendar,
  AlertTriangle,
  MessageSquareWarning,
  Zap,
  Mic,
  Activity,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { formatDate } from '../utils/riskUtils';

export const EventTimeline = ({ events = [] }) => {
  const getEventMeta = (eventType) => {
    const type = String(eventType || '').toUpperCase();
    if (type.includes('EMI') || type.includes('BOUNCE') || type.includes('PAYMENT_FAILED')) {
      return {
        icon: AlertTriangle,
        color: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        label: 'EMI Repayment Failure',
      };
    }
    if (type.includes('COMPLAINT')) {
      return {
        icon: MessageSquareWarning,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        label: 'Customer Complaint Filed',
      };
    }
    if (type.includes('ANOMALY') || type.includes('TRANSACTION')) {
      return {
        icon: Zap,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        label: 'Transaction Outlier Alert',
      };
    }
    if (type.includes('VOICE') || type.includes('CALL') || type.includes('AUDIO')) {
      return {
        icon: Mic,
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/30',
        label: 'Support Call Transcribed',
      };
    }
    return {
      icon: Activity,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/30',
      label: 'Telemetry / Risk Assessment',
    };
  };

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              Event Audit Trail
            </h3>
            <p className="text-xs text-slate-400">Chronological telemetry stream</p>
          </div>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
          {events.length} Events
        </span>
      </div>

      <div className="mt-6">
        {(!events || events.length === 0) ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/50">
            No adverse events logged on this account yet.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {events.map((evt, idx) => {
              const meta = getEventMeta(evt.event_type || evt.type);
              const Icon = meta.icon;
              const dateStr = formatDate(evt.timestamp || evt.created_at || evt.date);

              return (
                <div key={evt._id || idx} className="relative group">
                  {/* Dot Icon on timeline rail */}
                  <div
                    className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full ${meta.bg} ${meta.color} border ${meta.border} flex items-center justify-center -translate-x-1/2 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-2.5 h-2.5" />
                  </div>

                  <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3.5 hover:border-slate-700 transition-all">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-white">
                        {evt.title || meta.label}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {dateStr}
                      </span>
                    </div>

                    {(evt.description || evt.details || evt.text) && (
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {evt.description || evt.details || evt.text}
                      </p>
                    )}

                    {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex flex-wrap gap-2 text-[10px] font-mono text-slate-400">
                        {Object.entries(evt.metadata).map(([k, v]) => (
                          <span
                            key={k}
                            className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
                          >
                            <span className="text-slate-500">{k}:</span>{' '}
                            <span className="text-slate-300">
                              {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventTimeline;

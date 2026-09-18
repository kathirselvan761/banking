import React from 'react';
import { Mic, Headphones, Volume2, ShieldAlert } from 'lucide-react';
import { formatDate } from '../utils/riskUtils';

export const VoiceInsightCard = ({ transcripts = [], voiceData = null }) => {
  const items = Array.isArray(transcripts) && transcripts.length > 0
    ? transcripts
    : voiceData
    ? [voiceData]
    : [];

  const latest = items[0] || null;

  const getSentimentStyle = (sentiment) => {
    const s = String(sentiment || '').toLowerCase();
    if (s.includes('neg') || s.includes('distress')) {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
    if (s.includes('pos')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
    return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  };

  const getSeverityStyle = (severity) => {
    const s = String(severity || '').toUpperCase();
    if (s === 'HIGH' || s === 'CRITICAL') {
      return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
    if (s === 'MEDIUM') {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              Voice Insights
            </h3>
            <p className="text-xs text-slate-400">
              Customer Telephony Inbound Audio Telemetry
            </p>
          </div>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
          {items.length > 0 ? 'Active Recording' : 'No Call Logs'}
        </span>
      </div>

      {!latest ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/50 mt-5">
          No voice transcripts recorded for this customer.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {/* Transcript Quote */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-sky-400" />
                Latest Voice Transcript
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {latest.created_at ? formatDate(latest.created_at) : 'Recent Telephony Audio'}
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed italic">
              "{latest.transcript || 'I am having difficulty paying my EMI this month due to an unexpected hospital expense.'}"
            </p>
          </div>

          {/* Extracted Voice Classifications */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Sentiment */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Sentiment:
              </span>
              <span
                className={`inline-block mt-1 text-xs font-bold font-mono px-2.5 py-0.5 rounded border capitalize ${getSentimentStyle(
                  latest.sentiment || 'Negative'
                )}`}
              >
                {latest.sentiment || 'Negative'}
              </span>
            </div>

            {/* Category */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Category:
              </span>
              <span className="inline-block mt-1 text-xs font-bold font-mono px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30 uppercase">
                {latest.category || 'LOAN_REPAYMENT'}
              </span>
            </div>

            {/* Severity */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Severity:
              </span>
              <span
                className={`inline-block mt-1 text-xs font-bold font-mono px-2.5 py-0.5 rounded border uppercase ${getSeverityStyle(
                  latest.severity || 'High'
                )}`}
              >
                {latest.severity || 'High'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceInsightCard;

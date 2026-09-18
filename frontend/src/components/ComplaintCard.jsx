import React from 'react';
import { MessageSquareWarning, AlertCircle, Sparkles, Tag, Repeat } from 'lucide-react';
import { formatDate } from '../utils/riskUtils';

export const ComplaintCard = ({ complaints = [] }) => {
  const complaintList = Array.isArray(complaints) ? complaints : [];
  const latestComplaint = complaintList[0] || null;

  const getSentimentBadge = (sentiment) => {
    const s = String(sentiment || '').toLowerCase();
    if (s.includes('neg') || s.includes('distress')) {
      return {
        label: 'NEGATIVE',
        classes: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      };
    }
    if (s.includes('pos')) {
      return {
        label: 'POSITIVE',
        classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      };
    }
    return {
      label: 'NEUTRAL',
      classes: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    };
  };

  const getSeverityBadge = (severity) => {
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
          <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/30">
            <MessageSquareWarning className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              Complaint Insights
            </h3>
            <p className="text-xs text-slate-400">
              FinBERT Sentiment & SBERT Recurring Issue Detection
            </p>
          </div>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
          {complaintList.length} Recorded
        </span>
      </div>

      {complaintList.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/50 mt-5">
          No complaints found. Account communication standing is clean.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {complaintList.slice(0, 3).map((item, idx) => {
            const sentiment = getSentimentBadge(item.sentiment);
            const severity = String(item.severity || 'MEDIUM').toUpperCase();
            const category = item.category || 'PAYMENT_FAILURE';
            const isRecurring = item.is_recurring ?? item.recurring ?? false;
            const simScore = item.similarity_score ?? item.similarity ?? 0.88;
            const keywords = item.keywords || ['EMI', 'payment', 'failed', 'support'];
            const date = item.created_at || item.timestamp || new Date();

            return (
              <div
                key={item.id || item._id || idx}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-3 transition-all hover:border-slate-700"
              >
                {/* Top Row: Category & Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black font-mono px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
                      {category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${sentiment.classes}`}>
                      {sentiment.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getSeverityBadge(severity)}`}>
                      SEVERITY: {severity}
                    </span>
                    {isRecurring && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                        <Repeat className="w-3 h-3" />
                        RECURRING: YES
                      </span>
                    )}
                  </div>
                </div>

                {/* Complaint Text */}
                <p className="text-xs text-slate-200 leading-relaxed italic bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/60">
                  "{item.complaint_text || item.text || item.description || 'Customer reported a payment deduction issue.'}"
                </p>

                {/* SBERT Similarity & Keywords */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-[11px]">
                  {/* Keywords */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Tag className="w-3 h-3 text-slate-500" />
                    {keywords.slice(0, 4).map((kw, kIdx) => (
                      <span
                        key={kIdx}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>

                  {/* Similarity Score */}
                  {isRecurring && (
                    <div className="text-[10px] font-mono text-purple-300">
                      Similarity Score: <strong>{(simScore * 100).toFixed(0)}%</strong>
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatDate(date)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ComplaintCard;

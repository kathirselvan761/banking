import React, { useState } from 'react';
import { Sparkles, CheckCircle, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const RecommendationCard = ({ recommendations = [] }) => {
  const [appliedActions, setAppliedActions] = useState({});

  const handleAction = (id) => {
    setAppliedActions((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  const getPriorityStyle = (priority) => {
    const p = String(priority || '').toUpperCase();
    if (p === 'HIGH' || p === 'CRITICAL' || p === 'IMMEDIATE') {
      return {
        badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        dot: 'bg-rose-500',
        border: 'border-l-rose-500',
      };
    }
    if (p === 'MEDIUM' || p === 'MODERATE') {
      return {
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        dot: 'bg-amber-500',
        border: 'border-l-amber-500',
      };
    }
    return {
      badge: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      dot: 'bg-sky-500',
      border: 'border-l-sky-500',
    };
  };

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              AI Intervention Recommendations
            </h3>
            <p className="text-xs text-slate-400">Proactive Delinquency Mitigation Engine</p>
          </div>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
          {recommendations.length} Prescriptions
        </span>
      </div>

      <div className="mt-5 space-y-3.5">
        {(!recommendations || recommendations.length === 0) ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/50">
            No active interventions recommended. Account metrics reflect stable repayment behavior.
          </div>
        ) : (
          recommendations.map((rec, index) => {
            const key = rec.id || rec.action || index;
            const priorityStyle = getPriorityStyle(rec.priority || rec.urgency);
            const isApplied = !!appliedActions[key];

            return (
              <div
                key={key}
                className={`p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 border-l-4 ${priorityStyle.border} transition-all hover:bg-slate-950/90`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${priorityStyle.badge}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
                      {String(rec.priority || 'MEDIUM').toUpperCase()} PRIORITY
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Rule #{index + 1}
                    </span>
                  </div>

                  {rec.category && (
                    <span className="text-[11px] font-mono text-slate-500 uppercase">
                      {rec.category}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-semibold text-white mt-2.5">
                  {rec.action || rec.title || rec.recommendation}
                </h4>

                {(rec.reason || rec.rationale || rec.details) && (
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {rec.reason || rec.rationale || rec.details}
                  </p>
                )}

                <div className="mt-3.5 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Recommended Channel: <strong className="text-slate-300 font-normal">{rec.channel || 'Relationship Manager / Portal'}</strong>
                  </span>

                  {isApplied ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Intervention Initiated
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAction(key)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 transition-all hover:border-sky-400"
                    >
                      Initiate Action
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecommendationCard;

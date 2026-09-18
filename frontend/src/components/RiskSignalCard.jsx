import React from 'react';
import { ArrowUpRight, ArrowDownRight, Info, HelpCircle } from 'lucide-react';

export const RiskSignalCard = ({ signals = [], explanationText = '' }) => {
  // Normalize signals if they come from different response shapes
  const normalizedSignals = Array.isArray(signals)
    ? signals.map((sig) => {
        if (typeof sig === 'string') {
          return {
            name: sig,
            feature: sig,
            direction: 'increases_risk',
            importance: 0.15,
            description: sig,
          };
        }
        return {
          name: sig.feature_name || sig.feature || sig.name || 'Risk Indicator',
          feature: sig.feature || sig.feature_name || '',
          direction: sig.direction || (sig.impact >= 0 ? 'increases_risk' : 'decreases_risk'),
          importance: Math.abs(sig.importance || sig.impact || sig.weight || 0.1),
          description: sig.description || sig.human_readable || sig.explanation || '',
        };
      })
    : [];

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              Important Risk Signals (SHAP)
            </h3>
            <p className="text-xs text-slate-400">Explainable AI feature attribution</p>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
          TreeSHAP Explainer
        </span>
      </div>

      {/* Compliance / Disclaimer Banner */}
      <div className="mt-4 flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span>
          Signals reflect algorithmic feature attributions and correlate with delinquency risk, not definitive causes.
        </span>
      </div>

      {/* Signals List */}
      <div className="mt-5 space-y-3">
        {normalizedSignals.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/50">
            No dominant outlier risk signals detected. Account behavior aligns with low-risk baseline.
          </div>
        ) : (
          normalizedSignals.map((signal, idx) => {
            const isIncreasing = signal.direction === 'increases_risk' || signal.direction === 'UP' || signal.direction === 'positive';
            const pct = Math.min(100, Math.max(10, Math.round(signal.importance * 100)));

            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isIncreasing ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <ArrowDownRight className="w-4 h-4" />
                      </span>
                    )}
                    <span className="text-xs font-semibold text-white">
                      {signal.name.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        isIncreasing
                          ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                          : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                      }`}
                    >
                      {isIncreasing ? '+ Risk Factor' : '- Protective Factor'}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {(signal.importance).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Magnitude Bar */}
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isIncreasing ? 'bg-rose-500/80' : 'bg-emerald-500/80'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {signal.description && (
                  <p className="text-[11px] text-slate-400 leading-relaxed pt-0.5">
                    {signal.description}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Why is this customer at risk text explanation */}
      {explanationText && (
        <div className="mt-5 p-4 rounded-xl bg-slate-950/80 border border-indigo-950/50">
          <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Decision Intelligence Breakdown
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {explanationText}
          </p>
        </div>
      )}
    </div>
  );
};

export default RiskSignalCard;

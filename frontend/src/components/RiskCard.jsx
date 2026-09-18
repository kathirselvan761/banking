import React from 'react';
import {
  ShieldAlert,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { RiskBadge } from './RiskBadge';
import {
  getRiskLevel,
  getRiskColorClasses,
  formatPercentage,
  formatDate,
} from '../utils/riskUtils';

export const RiskCard = ({
  score = 0,
  level,
  defaultProbability,
  signals = [],
  lastUpdated,
  summary,
}) => {
  const currentScore = Math.min(100, Math.max(0, Math.round(score || 0)));
  const currentLevel = level || getRiskLevel(currentScore);
  const colors = getRiskColorClasses(currentLevel);

  // SVG Gauge calculations
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (currentScore / 100) * circumference;

  // Normalized SHAP Signals
  const normalizedSignals = Array.isArray(signals)
    ? signals.map((sig) => {
        if (typeof sig === 'string') {
          return {
            name: sig,
            feature: sig,
            direction: 'increases_risk',
            importance: 0.15,
          };
        }
        return {
          name:
            sig.feature_name ||
            sig.feature ||
            sig.name ||
            'Risk Signal',
          feature: sig.feature || sig.feature_name || '',
          direction:
            sig.direction ||
            (sig.impact >= 0 ? 'increases_risk' : 'decreases_risk'),
          importance: Math.abs(
            sig.importance || sig.impact || sig.weight || 0.1
          ),
          rawImpact: sig.impact || sig.importance || 0,
        };
      })
    : [];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md shadow-xl transition-all hover:border-slate-700">
      {/* Background ambient glow */}
      <div
        className={`absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none ${colors.bar}`}
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2.5 rounded-xl ${colors.bg} ${colors.text} border ${colors.border}`}
          >
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              Risk Overview
            </h3>
            <p className="text-xs text-slate-400">
              AI-Powered Composite Early Warning Assessment
            </p>
          </div>
        </div>
        <RiskBadge level={currentLevel} score={currentScore} size="lg" />
      </div>

      {/* Main Score & Probability Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center my-6">
        {/* Gauge */}
        <div className="flex items-center justify-center gap-4">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 120 120"
            >
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="#1e293b"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className={`${colors.text} transition-all duration-1000 ease-out`}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black tracking-tight text-white font-mono">
                {currentScore}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                / 100
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Current Risk Score
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-white">
                {currentLevel} RISK
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono block">
              Updated: {lastUpdated ? formatDate(lastUpdated) : 'Live Telemetry'}
            </span>
          </div>
        </div>

        {/* Future Default Probability */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">
              Future Default Probability
            </span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-white">
              {formatPercentage(defaultProbability ?? currentScore / 100)}
            </span>
            <span className="text-xs text-slate-400">90-day window</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full ${colors.bar} transition-all duration-1000`}
              style={{
                width: `${Math.min(
                  100,
                  Math.round(
                    (defaultProbability !== undefined
                      ? defaultProbability * 100
                      : currentScore) || 5
                  )
                )}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Estimated likelihood of severe delinquency within the next 90 days.
          </p>
        </div>

        {/* Model & Summary Note */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase">
                Model Status
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                XGBoost + SHAP
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {summary ||
                `Model evaluation flags account in ${currentLevel} risk classification based on repayment history and behavioral signals.`}
            </p>
          </div>
          <p className="text-[10px] text-slate-500 mt-3">
            Decision Intelligence Decision Support Advisory
          </p>
        </div>
      </div>

      {/* SHAP Important Risk Signals Section */}
      {normalizedSignals.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-sky-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Important Risk Signals
              </h4>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Possible contributing factors
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {normalizedSignals.slice(0, 4).map((sig, idx) => {
              const isIncrease = sig.direction === 'increases_risk';
              return (
                <div
                  key={sig.name + idx}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200 capitalize">
                      {sig.name.replace(/_/g, ' ')}
                    </span>
                    {isIncrease ? (
                      <ArrowUpRight className="w-4 h-4 text-rose-400" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className={`text-[11px] font-bold ${
                        isIncrease ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {isIncrease ? '↑ Increases Risk' : '↓ Decreases Risk'}
                    </span>
                    {sig.rawImpact !== 0 && (
                      <span className="text-[10px] font-mono text-slate-400">
                        {sig.rawImpact > 0 ? `+${sig.rawImpact.toFixed(2)}` : sig.rawImpact.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-slate-500 mt-2.5 flex items-center gap-1.5">
            <Info className="w-3 h-3 text-slate-400 shrink-0" />
            Important risk signals indicate possible contributing factors according to the model, not definitive or proven causes.
          </p>
        </div>
      )}
    </div>
  );
};

export default RiskCard;

import React from 'react';
import { ShieldAlert, TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { RiskBadge } from './RiskBadge';
import { getRiskLevel, getRiskColorClasses, formatPercentage, formatDate } from '../utils/riskUtils';

export const RiskScoreCard = ({ score = 0, level, defaultProbability, lastUpdated, summary }) => {
  const currentScore = Math.min(100, Math.max(0, Math.round(score || 0)));
  const currentLevel = level || getRiskLevel(currentScore);
  const colors = getRiskColorClasses(currentLevel);

  // Score meter stroke calculations for SVG gauge
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md shadow-xl transition-all hover:border-slate-700">
      {/* Background ambient glow */}
      <div
        className={`absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${colors.bar}`}
      />

      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${colors.bg} ${colors.text} border ${colors.border}`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              Composite Risk Score
            </h3>
            <p className="text-xs text-slate-400">Multi-Signal Banking Assessment</p>
          </div>
        </div>
        <RiskBadge level={currentLevel} score={currentScore} size="md" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center mt-6">
        {/* Circular Gauge */}
        <div className="flex items-center justify-center sm:justify-start gap-5">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 110 110">
              <circle
                cx="55"
                cy="55"
                r={radius}
                stroke="#1e293b"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="55"
                cy="55"
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

          <div className="space-y-1.5">
            <span className="text-xs font-medium text-slate-400">Risk Assessment</span>
            <div className="text-lg font-bold text-white flex items-center gap-1.5">
              <span className={colors.text}>{currentLevel}</span>
              <span className="text-slate-400 font-normal text-xs">Category</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-[180px]">
              {currentLevel === 'LOW' && 'Account in optimal standing. Standard monitoring.'}
              {currentLevel === 'MEDIUM' && 'Mild warning signals. Periodic observation recommended.'}
              {currentLevel === 'HIGH' && 'Significant risk trajectory detected. Proactive outreach.'}
              {currentLevel === 'CRITICAL' && 'Immediate mitigation required. High default probability.'}
            </p>
          </div>
        </div>

        {/* Future Default Probability & Telemetry */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
              Future Default Probability
            </span>
            <span className="text-sm font-bold font-mono text-white">
              {formatPercentage(defaultProbability)}
            </span>
          </div>

          {/* Probability progress bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 rounded-full ${
                (defaultProbability || 0) > 0.5 ? 'bg-rose-500' : (defaultProbability || 0) > 0.25 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{
                width: `${Math.min(100, Math.max(3, (Number(defaultProbability) || 0) <= 1 ? (Number(defaultProbability) || 0) * 100 : (Number(defaultProbability) || 0)))}%`,
              }}
            />
          </div>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              Last Evaluated:
            </span>
            <span className="font-mono text-slate-300">
              {formatDate(lastUpdated || new Date())}
            </span>
          </div>
        </div>
      </div>

      {/* Explainable AI summary if present */}
      {summary && (
        <div className="mt-5 pt-4 border-t border-slate-800/70">
          <div className="flex items-start gap-2.5 bg-sky-950/20 border border-sky-900/30 rounded-xl p-3.5 text-xs text-slate-300">
            <AlertCircle className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-sky-300 block mb-0.5">
                Executive Risk Summary
              </span>
              <p className="leading-relaxed text-slate-300">{summary}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskScoreCard;

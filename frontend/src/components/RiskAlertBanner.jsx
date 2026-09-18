import React from 'react';
import { ShieldAlert, AlertTriangle, ArrowRight, CheckCircle2, Info } from 'lucide-react';
import { RiskBadge } from './RiskBadge';
import { formatPercentage } from '../utils/riskUtils';

export const RiskAlertBanner = ({
  customerId,
  customerName,
  riskScore = 82,
  riskLevel = 'HIGH',
  defaultProbability = 0.78,
  signals = [],
  recommendations = [],
}) => {
  const isCritical = riskLevel === 'CRITICAL';

  // Format default signals if array is empty
  const defaultSignals = [
    'Recent consecutive payment delays detected',
    'Elevated loan balance relative to liquid savings reserve',
    'Customer grievance expressing repayment friction',
  ];

  // Format default recommendations if array is empty
  const defaultRecs = [
    'Contact customer for proactive early repayment counseling',
    'Review borrower cash flow and repayment feasibility',
    'Evaluate structured 30-day EMI deferral or tenure extension',
  ];

  const displaySignals = signals && signals.length > 0
    ? signals.slice(0, 3).map((s) => (typeof s === 'string' ? s : s.description || s.feature?.replace(/_/g, ' ') || 'Compounding risk factor'))
    : defaultSignals;

  const displayRecs = recommendations && recommendations.length > 0
    ? recommendations.slice(0, 3).map((r) => (typeof r === 'string' ? r : r.action || r.recommendation || 'Proactive customer outreach'))
    : defaultRecs;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-6 backdrop-blur-md shadow-2xl transition-all ${
        isCritical
          ? 'bg-gradient-to-r from-rose-950/80 via-slate-900 to-rose-950/60 border-rose-600/50 shadow-rose-950/50'
          : 'bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/60 border-amber-500/50 shadow-amber-950/50'
      }`}
    >
      {/* Background glow beacon */}
      <div
        className={`absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-25 ${
          isCritical ? 'bg-rose-500' : 'bg-amber-500'
        }`}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-xl border flex items-center justify-center ${
              isCritical
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
            }`}
          >
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-black tracking-tight text-white uppercase">
                {isCritical ? 'CRITICAL RISK ALERT' : 'HIGH RISK ALERT'}
              </h2>
              <RiskBadge level={riskLevel} score={riskScore} size="sm" />
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Customer: <strong className="text-white">{customerId}</strong> {customerName ? `— ${customerName}` : ''}
            </p>
          </div>
        </div>

        {/* Top Key Metrics */}
        <div className="flex items-center gap-4 bg-slate-950/80 p-3 rounded-xl border border-slate-800 self-start md:self-auto">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Risk Score</span>
            <span className="text-xl font-black font-mono text-white">
              {riskScore}<span className="text-xs font-normal text-slate-400">/100</span>
            </span>
          </div>

          <div className="h-8 w-px bg-slate-800" />

          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Default Probability</span>
            <span
              className={`text-xl font-black font-mono ${
                isCritical ? 'text-rose-400' : 'text-amber-400'
              }`}
            >
              {formatPercentage(defaultProbability)}
            </span>
          </div>
        </div>
      </div>

      {/* Signals & Recommended Actions Dual Column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
        {/* Important Signals */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2.5">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className={`w-3.5 h-3.5 ${isCritical ? 'text-rose-400' : 'text-amber-400'}`} />
            Important Risk Signals:
          </span>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {displaySignals.map((sig, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-rose-400 font-bold mt-0.5">•</span>
                <span className="leading-relaxed capitalize">{String(sig).replace(/_/g, ' ')}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Actions */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2.5">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Recommended Actions:
          </span>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {displayRecs.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-sky-400 font-bold mt-0.5">•</span>
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Regulatory Decision-Support Notice */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span>
          Decision Support Notice: This alert synthesizes statistical risk indicators for supervisory review. Non-autonomous recommendation. Human credit officer review required.
        </span>
      </div>
    </div>
  );
};

export default RiskAlertBanner;

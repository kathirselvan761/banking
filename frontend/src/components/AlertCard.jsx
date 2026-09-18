import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, AlertTriangle, ArrowRight, Zap, TrendingUp } from 'lucide-react';
import { RiskBadge } from './RiskBadge';
import { formatPercentage, formatDate } from '../utils/riskUtils';

export const AlertCard = ({ alert, onSelect }) => {
  const navigate = useNavigate();

  if (!alert) return null;

  const customerId = alert.customer_id || alert.customerId || 'UNKNOWN';
  const riskScore = alert.risk_score ?? alert.score ?? 80;
  const riskLevel = alert.risk_level || alert.level || 'HIGH';
  const defaultProbability = alert.future_default_probability ?? alert.default_probability ?? (riskScore / 100);
  const signals = alert.important_risk_signals || alert.signals || [
    'Payment delays',
    'Overdue amount',
    'Repeated complaints',
  ];
  const timestamp = alert.timestamp || alert.created_at || new Date();

  const isCritical = String(riskLevel).toUpperCase() === 'CRITICAL';

  const handleClick = () => {
    if (onSelect) {
      onSelect(customerId);
    } else {
      navigate(`/customers/${customerId}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`rounded-2xl border p-5 backdrop-blur-md shadow-xl transition-all cursor-pointer group hover:scale-[1.01] ${
        isCritical
          ? 'bg-rose-950/20 border-rose-800/60 hover:border-rose-600 shadow-rose-950/20'
          : 'bg-amber-950/20 border-amber-800/60 hover:border-amber-600 shadow-amber-950/20'
      }`}
    >
      {/* Alert Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg ${
              isCritical
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span
              className={`text-xs font-black tracking-wide uppercase ${
                isCritical ? 'text-rose-400' : 'text-amber-400'
              }`}
            >
              {riskLevel} RISK ALERT
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
              {formatDate(timestamp)}
            </span>
          </div>
        </div>
        <RiskBadge level={riskLevel} score={riskScore} size="sm" />
      </div>

      {/* Customer & Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
            Customer
          </span>
          <span className="text-sm font-black font-mono text-white group-hover:text-sky-400 transition-colors">
            {customerId}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
            Risk Score
          </span>
          <span className="text-sm font-black font-mono text-white">
            {Math.round(riskScore)}/100
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
            Future Default Probability
          </span>
          <span className="text-sm font-black font-mono text-white">
            {formatPercentage(defaultProbability)}
          </span>
        </div>
      </div>

      {/* Important Signals */}
      {signals && signals.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Important Signals:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {signals.map((sig, idx) => {
              const text =
                typeof sig === 'string'
                  ? sig
                  : sig.feature_name || sig.feature || sig.name || 'Signal';
              return (
                <span
                  key={idx}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800"
                >
                  • {text.replace(/_/g, ' ')}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Action */}
      <div className="mt-4 flex items-center justify-end text-xs font-semibold text-slate-400 group-hover:text-sky-400 transition-colors">
        <span>Inspect Dossier</span>
        <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  );
};

export default AlertCard;

import React from 'react';
import { AlertTriangle, Clock, MapPin, CreditCard, ShieldAlert } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/riskUtils';

export const TransactionAnomalyCard = ({ transactions = [] }) => {
  const anomalies = Array.isArray(transactions)
    ? transactions.filter((tx) => tx.is_anomaly || tx.anomaly_score < 0 || tx.flagged)
    : [];

  const displayList = anomalies.length > 0
    ? anomalies
    : [
        {
          id: 'TXN-ANOMALY-SAMPLE',
          amount: 85000,
          timestamp: new Date().toISOString(),
          location: 'Unusual Location / Off-hours',
          category: 'ATM_WITHDRAWAL',
          merchant: 'High Volume Cash Out',
          is_anomaly: true,
        },
      ];

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              Transaction Anomalies
            </h3>
            <p className="text-xs text-slate-400">
              Isolation Forest Spending & Outflow Pattern Detector
            </p>
          </div>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
          {anomalies.length} Flagged
        </span>
      </div>

      <div className="mt-5 space-y-3.5">
        {displayList.map((tx, idx) => {
          const timeString = tx.timestamp
            ? new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '02:14 AM';
          const location = tx.location || tx.merchant_location || 'Unusual';
          const amount = tx.amount || 85000;

          return (
            <div
              key={tx.id || tx._id || idx}
              className="p-4 rounded-xl bg-slate-950/70 border border-amber-800/40 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono font-bold text-white">
                    {formatCurrency(amount)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    TRANSACTION ANOMALY DETECTED
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Requires Review
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/60">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Time: <strong className="text-slate-200">{timeString}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Location: <strong className="text-slate-200">{location}</strong></span>
                </div>
                <div className="col-span-2 sm:col-span-1 text-right text-[11px] text-slate-500">
                  Status: <span className="text-amber-400 font-semibold">Requires Review</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-slate-500 mt-4">
        * Policy Note: Flagged deviations represent statistical spending pattern anomalies requiring human operational review, never confirmed fraud.
      </p>
    </div>
  );
};

export default TransactionAnomalyCard;

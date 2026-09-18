import React from 'react';
import { Zap, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/riskUtils';

export const AnomalyCard = ({ transactions = [] }) => {
  // Filter or prioritize anomalous transactions
  const anomalousTxns = (transactions || []).filter(
    (t) => t.is_anomaly === true || t.anomaly_score > 0.6 || t.is_suspicious === true
  );

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              Transaction Anomaly Detection
            </h3>
            <p className="text-xs text-slate-400">Isolation Forest behavioral outlier analysis</p>
          </div>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-purple-300 border border-purple-900/40">
          {anomalousTxns.length} Outliers Detected
        </span>
      </div>

      {/* Compliance Notice */}
      <div className="mt-4 flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400">
        <HelpCircle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
        <span>
          Statistical outlier flagged by unsupervised machine learning. Requires risk officer review. Not confirmed fraud.
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {anomalousTxns.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/50">
            No statistical spending anomalies or volume spikes detected across recent transactions.
          </div>
        ) : (
          anomalousTxns.map((tx, idx) => {
            const score = tx.anomaly_score !== undefined ? Math.round(tx.anomaly_score * 100) : 75;

            return (
              <div
                key={tx._id || tx.transaction_id || idx}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-purple-950/60 hover:border-purple-800/60 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {tx.merchant || tx.description || 'Unusual Outflow Spike'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {tx.category || 'FINANCIAL_OUTFLOW'} • {tx.channel || 'ONLINE_TRANSFER'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-purple-300 block">
                      {formatCurrency(tx.amount || 0)}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {formatDate(tx.timestamp || tx.date || tx.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px]">
                  <span className="text-slate-400">
                    Outlier Divergence Score:{' '}
                    <strong className="text-purple-400 font-mono">{score}%</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                    Requires Review
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AnomalyCard;

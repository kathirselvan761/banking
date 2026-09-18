import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Zap,
  AlertTriangle,
  RefreshCw,
  Search,
  SlidersHorizontal,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { getTransactions } from '../services/api';
import { LoadingState, ErrorState } from '../components/LoadingState';
import { formatCurrency, formatDate } from '../utils/riskUtils';

export const Transactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filterOutliersOnly, setFilterOutliersOnly] = useState(false);
  const [search, setSearch] = useState('');

  const fetchTxns = useCallback(async (isBg = false) => {
    try {
      if (!isBg) setLoading(true);
      else setRefreshing(true);
      setError(null);
      const res = await getTransactions(50);
      if (res && res.data) {
        setTransactions(res.data);
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve transactions telemetry');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTxns(false);
    const timer = setInterval(() => fetchTxns(true), 5000);
    return () => clearInterval(timer);
  }, [fetchTxns]);

  const filteredTxns = useMemo(() => {
    let list = [...transactions];
    if (filterOutliersOnly) {
      list = list.filter((t) => t.is_anomaly || (t.anomaly_score && t.anomaly_score > 0.5));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          (t.customer_id && t.customer_id.toLowerCase().includes(q)) ||
          (t.merchant && t.merchant.toLowerCase().includes(q)) ||
          (t.category && t.category.toLowerCase().includes(q))
      );
    }
    return list;
  }, [transactions, filterOutliersOnly, search]);

  const outlierCount = transactions.filter(
    (t) => t.is_anomaly || (t.anomaly_score && t.anomaly_score > 0.5)
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            Transaction Telemetry & Anomaly Analysis
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
              {outlierCount} Outliers
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time transaction stream monitored by unsupervised Isolation Forest models
          </p>
        </div>

        <button
          onClick={() => fetchTxns(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-800 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Stream
        </button>
      </div>

      {/* Compliance Disclaimer */}
      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-purple-950/20 border border-purple-900/40 text-xs text-slate-300">
        <HelpCircle className="w-4 h-4 text-purple-400 shrink-0" />
        <span>
          Compliance Directive: Outliers indicate statistical divergence from normal spending baselines. Flagged entries require risk officer review and do not constitute confirmed fraud.
        </span>
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by customer ID or merchant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterOutliersOnly(false)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              !filterOutliersOnly
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'bg-slate-950/80 text-slate-400 border border-slate-800'
            }`}
          >
            All Transactions ({transactions.length})
          </button>
          <button
            onClick={() => setFilterOutliersOnly(true)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterOutliersOnly
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950'
                : 'bg-slate-950/80 text-purple-400 border border-purple-900/40'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Outliers Only ({outlierCount})
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md shadow-xl overflow-hidden">
        {loading && !transactions.length ? (
          <LoadingState message="Connecting to transaction telemetry stream..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchTxns(false)} />
        ) : filteredTxns.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No transactions found matching the current criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase font-semibold text-[10px]">
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Merchant / Entity</th>
                  <th className="py-3.5 px-4">Category / Channel</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Outlier Divergence</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTxns.map((t, idx) => {
                  const isAnomaly = t.is_anomaly || (t.anomaly_score && t.anomaly_score > 0.5);
                  const scorePct = t.anomaly_score ? Math.round(t.anomaly_score * 100) : isAnomaly ? 78 : 12;

                  return (
                    <tr
                      key={t._id || t.transaction_id || idx}
                      onClick={() => navigate(`/customers/${t.customer_id}`)}
                      className={`hover:bg-slate-800/40 transition-colors cursor-pointer group ${
                        isAnomaly ? 'bg-purple-950/10' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        {isAnomaly ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            <Zap className="w-3 h-3 text-purple-400" />
                            ANOMALOUS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400">
                            Standard
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white group-hover:text-sky-400 transition-colors">
                        {t.customer_id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        {t.merchant || t.description || 'Electronic Transfer'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {t.category || 'RETAIL'} • {t.channel || 'ONLINE'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {formatCurrency(t.amount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${isAnomaly ? 'bg-purple-500' : 'bg-slate-600'}`}
                              style={{ width: `${scorePct}%` }}
                            />
                          </div>
                          <span className="font-mono text-slate-400 text-[11px]">{scorePct}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                        {formatDate(t.timestamp || t.date || t.created_at)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/customers/${t.customer_id}`);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all group-hover:border-purple-400"
                        >
                          Review
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;

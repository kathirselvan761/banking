import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { getRiskAlerts } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { LoadingState, ErrorState } from '../components/LoadingState';
import { formatDate } from '../utils/riskUtils';

export const Alerts = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const fetchAlerts = useCallback(async (isBg = false) => {
    try {
      if (!isBg) setLoading(true);
      else setRefreshing(true);
      setError(null);
      const res = await getRiskAlerts();
      if (res && res.data) {
        setAlerts(res.data);
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve risk alerts telemetry');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts(false);
    const timer = setInterval(() => fetchAlerts(true), 5000);
    return () => clearInterval(timer);
  }, [fetchAlerts]);

  const filteredAlerts = useMemo(() => {
    if (filter === 'ALL') return alerts;
    return alerts.filter(
      (a) => (a.risk_level || a.level || '').toUpperCase() === filter
    );
  }, [alerts, filter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            Active Risk Alerts
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">
              {alerts.length} Incidents
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Accounts exhibiting acute delinquency indicators, rapid drawdown, or repetitive grievance spikes
          </p>
        </div>

        <button
          onClick={() => fetchAlerts(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-800 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Alerts
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['ALL', 'CRITICAL', 'HIGH'].map((tier) => (
          <button
            key={tier}
            onClick={() => setFilter(tier)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === tier
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tier}
          </button>
        ))}
      </div>

      {/* Alerts Table */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md shadow-xl overflow-hidden">
        {loading && !alerts.length ? (
          <LoadingState message="Fetching active portfolio risk alerts..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchAlerts(false)} />
        ) : filteredAlerts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
            No active alerts matching filter. All monitored accounts are currently stable.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase font-semibold text-[10px]">
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4">Customer ID</th>
                  <th className="py-3.5 px-4">Trigger / Root Cause</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAlerts.map((a, idx) => (
                  <tr
                    key={a._id || idx}
                    onClick={() => navigate(`/customers/${a.customer_id}`)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <RiskBadge level={a.risk_level || a.level} score={a.risk_score} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white group-hover:text-sky-400 transition-colors">
                      {a.customer_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-200 block">
                        {a.title || a.event_type || 'Acute Delinquency Risk'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {a.description || a.reason || 'Multiple leading signals exceed acceptable tolerance limits'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-400">
                      {Math.round(a.risk_score || 0)} / 100
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {formatDate(a.timestamp || a.created_at)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/customers/${a.customer_id}`);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-semibold transition-all group-hover:border-sky-400"
                      >
                        Inspect
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;

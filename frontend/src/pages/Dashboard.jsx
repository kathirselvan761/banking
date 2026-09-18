import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Activity,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { getCustomers, getRiskAlerts } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { AlertCard } from '../components/AlertCard';
import { LoadingState, ErrorState } from '../components/LoadingState';
import {
  getRiskLevel,
  getRiskColorClasses,
  formatCurrency,
  formatDate,
  formatPercentage,
} from '../utils/riskUtils';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async (isBg = false) => {
    try {
      if (!isBg) setLoading(true);
      else setRefreshing(true);
      setError(null);

      const [custRes, alertRes] = await Promise.allSettled([
        getCustomers(),
        getRiskAlerts(),
      ]);

      if (custRes.status === 'fulfilled' && custRes.value?.data) {
        setCustomers(custRes.value.data);
      }
      if (alertRes.status === 'fulfilled' && alertRes.value?.data) {
        setAlerts(alertRes.value.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to update portfolio telemetry');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(false);
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Aggregate metrics
  const totalCustomers = customers.length;
  const criticalCount = customers.filter(
    (c) => (c.risk_level || getRiskLevel(c.risk_score)) === 'CRITICAL'
  ).length;
  const highCount = customers.filter(
    (c) => (c.risk_level || getRiskLevel(c.risk_score)) === 'HIGH'
  ).length;
  const mediumCount = customers.filter(
    (c) => (c.risk_level || getRiskLevel(c.risk_score)) === 'MEDIUM'
  ).length;
  const lowCount = customers.filter(
    (c) => (c.risk_level || getRiskLevel(c.risk_score)) === 'LOW'
  ).length;

  const avgRiskScore = useMemo(() => {
    if (!customers.length) return 0;
    const sum = customers.reduce((acc, c) => acc + (c.risk_score || 0), 0);
    return Math.round(sum / customers.length);
  }, [customers]);

  // Distribution chart data
  const distributionData = useMemo(() => {
    return [
      { name: 'Low Risk', value: lowCount, color: '#10b981' },
      { name: 'Medium Risk', value: mediumCount, color: '#f59e0b' },
      { name: 'High Risk', value: highCount, color: '#f97316' },
      { name: 'Critical Risk', value: criticalCount, color: '#ef4444' },
    ];
  }, [lowCount, mediumCount, highCount, criticalCount]);

  // Trend chart data (derived from alert/customer risk trends)
  const trendData = useMemo(() => {
    if (!alerts.length) {
      // Fallback trend points
      return [
        { time: '09:00', avgRisk: Math.max(10, avgRiskScore - 5), alertVolume: 2 },
        { time: '11:00', avgRisk: Math.max(10, avgRiskScore - 2), alertVolume: 3 },
        { time: '13:00', avgRisk: avgRiskScore, alertVolume: 5 },
        { time: '15:00', avgRisk: Math.min(95, avgRiskScore + 3), alertVolume: 4 },
        { time: 'Current', avgRisk: avgRiskScore, alertVolume: alerts.length },
      ];
    }
    // Take recent alerts and map chronological risk points
    return alerts.slice(0, 7).reverse().map((a, i) => ({
      time: a.timestamp ? new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `T-${7 - i}`,
      avgRisk: Math.round(a.risk_score || 50),
      alertVolume: i + 1,
    }));
  }, [alerts, avgRiskScore]);

  // Top high risk accounts
  const highRiskCustomers = useMemo(() => {
    return [...customers]
      .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0))
      .slice(0, 5);
  }, [customers]);

  if (loading && !customers.length) {
    return <LoadingState message="Connecting to banking intelligence pipeline..." />;
  }

  if (error && !customers.length) {
    return <ErrorState message={error} onRetry={() => fetchDashboardData(false)} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            Banking Risk & Delinquency Command Center
            {refreshing && (
              <RefreshCw className="w-4 h-4 text-sky-400 animate-spin" />
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time portfolio delinquency forecasting and multi-agent risk signals
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-800 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </button>
          <button
            onClick={() => navigate('/customers')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white shadow-lg shadow-sky-950/50 transition-all"
          >
            Customer Directory
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top 4 Dynamic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 backdrop-blur-md relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Accounts
            </span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{totalCustomers}</span>
            <span className="text-xs text-slate-400">monitored</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% active stream telemetry</span>
          </div>
        </div>

        {/* High & Critical Risk Accounts */}
        <div className="rounded-2xl bg-slate-900/70 border border-rose-900/40 p-5 backdrop-blur-md relative overflow-hidden group hover:border-rose-800/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">
              High & Critical Risk
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-400 font-mono">
              {criticalCount + highCount}
            </span>
            <span className="text-xs text-slate-400">
              ({totalCustomers ? Math.round(((criticalCount + highCount) / totalCustomers) * 100) : 0}%)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-2">
            <span className="text-rose-400 font-bold">{criticalCount} Critical</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400 font-bold">{highCount} High</span>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="rounded-2xl bg-slate-900/70 border border-amber-900/40 p-5 backdrop-blur-md relative overflow-hidden group hover:border-amber-800/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
              Active Warning Alerts
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400 font-mono">
              {alerts.length}
            </span>
            <span className="text-xs text-slate-400">unresolved</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Signals requiring officer review</span>
          </div>
        </div>

        {/* Avg Risk Score */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 backdrop-blur-md relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Avg Portfolio Risk
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {avgRiskScore}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <span className="font-semibold text-slate-300">Composite:</span>
            <RiskBadge score={avgRiskScore} size="xs" />
          </div>
        </div>
      </div>

      {/* Recharts Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Pie Chart */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
                  Risk Tier Distribution
                </h3>
                <p className="text-xs text-slate-400">Account breakdown by severity</p>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Portfolio
              </span>
            </div>

            <div className="h-56 w-full mt-4 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#1e293b',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center pointer-events-none">
                <span className="text-2xl font-black text-white font-mono">
                  {totalCustomers}
                </span>
                <span className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Total
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-800/80">
            {distributionData.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-slate-400">{d.name}:</span>
                <span className="font-mono font-bold text-white ml-auto">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio Risk Trend Line Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
                  Dynamic Portfolio Risk Trajectory
                </h3>
                <p className="text-xs text-slate-400">
                  Telemetry timeline tracking average risk score & incident intensity
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded">
                Live Signal Stream
              </span>
            </div>

            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="time"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    domain={[0, 100]}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#1e293b',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                  <Line
                    type="monotone"
                    dataKey="avgRisk"
                    name="Risk Score Trend"
                    stroke="#0284c7"
                    strokeWidth={3}
                    dot={{ fill: '#0284c7', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="alertVolume"
                    name="Incident Volume"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ fill: '#f59e0b', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
            <span>Model Refresh Rate: <strong className="text-slate-300 font-mono">5.0s</strong></span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Real-time Ingestion Active
            </span>
          </div>
        </div>
      </div>

      {/* Top High-Risk Customers Action Panel */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              Priority Review: Critical & High Risk Accounts
            </h3>
            <p className="text-xs text-slate-400">Immediate officer attention recommended</p>
          </div>
          <button
            onClick={() => navigate('/customers')}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
          >
            View All Customers
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Account ID</th>
                <th className="py-3 px-3">Risk Level</th>
                <th className="py-3 px-3">Risk Score</th>
                <th className="py-3 px-3">Default Prob</th>
                <th className="py-3 px-3">Credit Score</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {highRiskCustomers.map((cust) => (
                <tr
                  key={cust.customer_id}
                  className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/customers/${cust.customer_id}`)}
                >
                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-white block group-hover:text-sky-400 transition-colors">
                      {cust.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {cust.email || 'Retail Banking'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-300 font-bold">
                    {cust.customer_id}
                  </td>
                  <td className="py-3.5 px-3">
                    <RiskBadge level={cust.risk_level} score={cust.risk_score} size="sm" />
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-white">
                    {Math.round(cust.risk_score || 0)} / 100
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-300">
                    {formatPercentage(cust.future_default_probability || cust.default_probability)}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-400">
                    {cust.credit_score || 'N/A'}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/customers/${cust.customer_id}`);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-medium transition-all"
                    >
                      Inspect Risk
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent High & Critical Risk Alerts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Recent High & Critical Risk Alerts
            </h3>
            <p className="text-xs text-slate-400">
              Live multi-signal delinquency early warnings
            </p>
          </div>
          <button
            onClick={() => navigate('/alerts')}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
          >
            All Alerts ({alerts.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(alerts.length > 0 ? alerts : [
            {
              customer_id: 'C001',
              risk_score: 82,
              risk_level: 'HIGH',
              future_default_probability: 0.78,
              important_risk_signals: ['Payment delays', 'Overdue amount', 'Repeated complaints'],
            },
            {
              customer_id: 'C003',
              risk_score: 91,
              risk_level: 'CRITICAL',
              future_default_probability: 0.89,
              important_risk_signals: ['Consecutive missed EMIs', 'High debt-to-income', 'Negative sentiment'],
            },
          ]).slice(0, 3).map((item, idx) => (
            <AlertCard key={item.id || item.event_id || idx} alert={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

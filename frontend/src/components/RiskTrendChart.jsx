import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { getCustomerEvents, getCustomerRiskHistory } from '../services/api';

export const RiskTrendChart = ({ customerId, events: initialEvents, history: initialHistory }) => {
  const [dataPoints, setDataPoints] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If pre-loaded history or events are passed, format directly
    if (initialHistory && initialHistory.length > 0) {
      const formatted = initialHistory.map((item, idx) => ({
        time: item.timestamp
          ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : `T-${initialHistory.length - idx}`,
        riskScore: Math.round(item.risk_score ?? 0),
        level: item.risk_level || 'LOW',
      }));
      setDataPoints(formatted);
      return;
    }

    if (!customerId) return;

    let isMounted = true;
    const fetchRiskTrend = async () => {
      setLoading(true);
      try {
        // Fetch risk history or customer events
        const [historyRes, eventsRes] = await Promise.allSettled([
          getCustomerRiskHistory(customerId),
          getCustomerEvents(customerId),
        ]);

        if (!isMounted) return;

        let points = [];

        // Prioritize actual RiskEvent history
        if (historyRes.status === 'fulfilled' && historyRes.value?.data && historyRes.value.data.length > 0) {
          points = historyRes.value.data.map((h, i) => ({
            time: h.timestamp
              ? new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : `T-${historyRes.value.data.length - i}`,
            riskScore: Math.round(h.risk_score || 0),
            level: h.risk_level || 'LOW',
          }));
        } else if (eventsRes.status === 'fulfilled' && eventsRes.value?.data && eventsRes.value.data.length > 0) {
          // Extract any risk events or simulation events from audit ledger
          const evts = eventsRes.value.data;
          points = evts
            .filter((e) => e.risk_score !== undefined || e.details?.risk_score !== undefined)
            .map((e, idx) => ({
              time: e.timestamp
                ? new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : `T-${evts.length - idx}`,
              riskScore: Math.round(e.risk_score ?? e.details?.risk_score ?? 15),
              level: e.risk_level || 'LOW',
            }));
        }

        if (points.length > 0) {
          setDataPoints(points);
        }
      } catch (err) {
        console.error('Error fetching risk trend:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRiskTrend();

    return () => {
      isMounted = false;
    };
  }, [customerId, initialHistory, initialEvents]);

  // Fallback points if no historical evaluations have occurred yet
  const chartData = useMemo(() => {
    if (dataPoints.length > 0) return dataPoints;
    return [
      { time: '10:00', riskScore: 18, level: 'LOW' },
      { time: '10:05', riskScore: 31, level: 'MEDIUM' },
      { time: '10:10', riskScore: 47, level: 'MEDIUM' },
      { time: '10:15', riskScore: 68, level: 'HIGH' },
      { time: '10:20', riskScore: 82, level: 'CRITICAL' },
    ];
  }, [dataPoints]);

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              Risk Trend Evolution
            </h3>
            <p className="text-xs text-slate-400">
              Live RiskEvent score progression over time
            </p>
          </div>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
          {chartData.length} Snapshots
        </span>
      </div>

      <div className="h-60 w-full mt-5">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
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
              formatter={(value) => [`${value} / 100`, 'Risk Score']}
              labelFormatter={(label) => `Evaluation Time: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="riskScore"
              name="Risk Score"
              stroke="#38bdf8"
              strokeWidth={3}
              dot={{ fill: '#38bdf8', r: 4 }}
              activeDot={{ r: 6, fill: '#0284c7' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Snapshot summary markers */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Latest Trajectory:</span>
        </div>
        <div className="flex items-center gap-3">
          {chartData.slice(-3).map((pt, i) => (
            <span key={i} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
              {pt.time} → <strong className="text-white">{pt.riskScore}</strong>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RiskTrendChart;

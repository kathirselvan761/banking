import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCustomers, getCustomerRisk } from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import { Cpu, HelpCircle, AlertTriangle, ArrowUpRight, ArrowDownRight, User } from 'lucide-react';

export const Explainability = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCustomerId = searchParams.get('customer_id') || 'C101';
  
  const [customers, setCustomers] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const custList = await getCustomers();
        setCustomers(custList.customers || []);
        
        const riskData = await getCustomerRisk(selectedCustomerId);
        setCurrentProfile(riskData.profile || null);
      } catch (err) {
        console.error("Failed to load explainability data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedCustomerId]);

  const shapFactors = currentProfile?.shap_factors || [];
  const chartData = shapFactors.map(f => ({
    name: f.label || f.feature,
    contribution: Math.round(f.contribution * 1000) / 10,
    direction: f.direction,
    actualValue: f.actual_value
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              SHAP Model Explainability
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Explainable AI (XAI) feature attribution breakdown answering: <span className="text-sky-300 font-semibold">"Why is this borrower high risk?"</span>
          </p>
        </div>

        {/* Customer Switcher */}
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5">
          <User className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCustomerId}
            onChange={(e) => setSearchParams({ customer_id: e.target.value })}
            className="bg-transparent text-sm text-slate-200 focus:outline-none cursor-pointer"
          >
            {customers.map((c) => (
              <option key={c.customer_id} value={c.customer_id} className="bg-slate-900 text-white">
                {c.customer_id} - {c.name} ({c.risk_level})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center bg-slate-900/40 rounded-xl border border-slate-800 text-slate-400 text-sm">
          Computing SHAP TreeExplainer feature attributions...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Column */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Feature Risk Contribution (SHAP Values)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Positive values drive risk higher; negative values indicate stabilizing factors.
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Target: 90-Day Delinquency
              </span>
            </div>

            <div className="h-80 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
                >
                  <XAxis
                    type="number"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    domain={[-30, 30]}
                    unit="%"
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fill: '#cbd5e1', fontSize: 11 }}
                    width={160}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#f8fafc', fontSize: '12px' }}
                    formatter={(val, name, item) => [`${val}% Risk Impact`, `Actual: ${item.payload.actualValue}`]}
                  />
                  <ReferenceLine x={0} stroke="#475569" strokeDasharray="3 3" />
                  <Bar dataKey="contribution" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.contribution > 0 ? '#f43f5e' : '#10b981'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Explanation Summary Box */}
            <div className="mt-6 p-4 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400 mb-2">
                <HelpCircle className="w-4 h-4" />
                Plain-Language Risk Synthesis
              </div>
              <ul className="space-y-1.5">
                {(currentProfile?.shap_explanations || []).map((exp, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                    {exp}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Side Profile Card */}
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
                Active Assessment
              </h3>
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Customer ID</span>
                  <span className="text-sm font-bold text-white font-mono">{currentProfile?.customer_id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Customer Name</span>
                  <span className="text-sm font-semibold text-slate-200">{currentProfile?.customer_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Deterministic Risk</span>
                  <span className="text-sm font-bold px-2 py-0.5 rounded text-rose-300 bg-rose-950/50 border border-rose-800/60">
                    {currentProfile?.risk_score} / 100 ({currentProfile?.risk_level})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">XGBoost 90d Default</span>
                  <span className="text-sm font-bold text-amber-400 font-mono">
                    {Math.round((currentProfile?.future_risk_probability || 0) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Segment</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-800">
                    {currentProfile?.customer_segment}
                  </span>
                </div>
              </div>
            </div>

            {/* Regulatory Governance Note */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 space-y-2">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Fair Credit Reporting & Auditability
              </span>
              <p className="leading-relaxed">
                SHAP feature contributions guarantee regulatory traceability (FCRA / Model Risk Management compliance). Risk weights are calculated deterministically from model trees without black-box hallucination.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explainability;

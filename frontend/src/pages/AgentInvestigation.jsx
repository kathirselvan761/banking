import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCustomers, runInvestigation, getInvestigationTrail } from '../services/api';
import {
  Bot,
  Play,
  CheckCircle,
  Clock,
  ArrowDown,
  Wrench,
  FileSearch,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  User
} from 'lucide-react';

export const AgentInvestigation = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCustomerId = searchParams.get('customer_id') || 'C101';

  const [customers, setCustomers] = useState([]);
  const [investigationData, setInvestigationData] = useState(null);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const custList = await getCustomers();
        setCustomers(custList.customers || []);

        const trail = await getInvestigationTrail(selectedCustomerId);
        setInvestigationData(trail.decision_intelligence || null);
      } catch (err) {
        console.error("Failed to load investigation trail:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedCustomerId]);

  const handleRunInvestigation = async () => {
    try {
      setRunning(true);
      const res = await runInvestigation(selectedCustomerId);
      setInvestigationData(res.decision_intelligence || null);
    } catch (err) {
      console.error("Investigation execution failed:", err);
    } finally {
      setRunning(false);
    }
  };

  const trail = investigationData?.investigation_trail || [];
  const recommendations = investigationData?.recommendations || [];
  const contributingFactors = investigationData?.possible_contributing_factors || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              LangGraph Agentic AI Investigation Trail
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Iterative multi-agent evidence gathering loop executing tools autonomously to investigate risk signals and generate decision intelligence.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
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

          <button
            onClick={handleRunInvestigation}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-emerald-950"
          >
            <Play className="w-3.5 h-3.5" />
            {running ? "Executing Loop..." : "Re-Run Agent Loop"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center bg-slate-900/40 rounded-xl border border-slate-800 text-slate-400 text-sm">
          Loading agentic investigation audit trail...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Investigation Audit Trail (Timeline) */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Autonomous Investigation Execution Steps
                </h3>
                <p className="text-xs text-slate-400">
                  Concise action and tool summaries generated during the StateGraph evidence loop.
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                Loop Status: COMPLETE
              </span>
            </div>

            {/* Timeline */}
            <div className="relative pl-6 border-l border-slate-800 space-y-6">
              {trail.map((step, idx) => (
                <div key={idx} className="relative group">
                  {/* Step Dot */}
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-emerald-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold font-mono text-emerald-400">
                        STEP {step.step}: {step.agent}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {step.action}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {step.summary}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Contributing Factors & Recommendations */}
          <div className="space-y-6">
            {/* RCA Synthesis */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <FileSearch className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Possible Contributing Factors (RCA)
                </h3>
              </div>
              <div className="space-y-2">
                {contributingFactors.map((factor, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded bg-slate-950 border border-slate-850 text-xs text-slate-300 leading-relaxed"
                  >
                    {factor}
                  </div>
                ))}
              </div>
            </div>

            {/* Decision Recommendations */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">
                  Actionable Recommendations
                </h3>
              </div>
              <div className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-sky-300">
                        {rec.title}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        rec.priority === 'HIGH' ? 'bg-rose-950 text-rose-300' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {rec.description}
                    </p>
                    <div className="mt-2 text-[10px] text-amber-400/90 font-medium">
                      &bull; Requires Human Banking Officer Approval
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentInvestigation;

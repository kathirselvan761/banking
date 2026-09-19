import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCustomers, getCustomerRisk, simulateWhatIf } from '../services/api';
import { Sliders, RefreshCw, ArrowRight, TrendingDown, TrendingUp, AlertTriangle, User } from 'lucide-react';

export const WhatIf = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCustomerId = searchParams.get('customer_id') || 'C101';

  const [customers, setCustomers] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Slider State
  const [overdueAmount, setOverdueAmount] = useState(0);
  const [emiDelayCount, setEmiDelayCount] = useState(0);
  const [creditUtilization, setCreditUtilization] = useState(0.4);
  const [complaintCount, setComplaintCount] = useState(0);

  // Simulation Result
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const custList = await getCustomers();
        setCustomers(custList.customers || []);

        const riskData = await getCustomerRisk(selectedCustomerId);
        const p = riskData.profile;
        setCurrentProfile(p);

        if (p) {
          setOverdueAmount(p.overdue_amount || 0);
          setEmiDelayCount(p.emi_delay_count || 0);
          setCreditUtilization(p.credit_utilization || 0.4);
          setComplaintCount(p.complaint_count || 0);

          // Initial simulation
          const sim = await simulateWhatIf({
            customer_id: selectedCustomerId,
            overdue_amount: p.overdue_amount || 0,
            emi_delay_count: p.emi_delay_count || 0,
            credit_utilization: p.credit_utilization || 0.4,
            complaint_count: p.complaint_count || 0
          });
          setSimulationResult(sim.simulation || null);
        }
      } catch (err) {
        console.error("Failed to load what-if data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedCustomerId]);

  const handleSimulate = async (overdue, delays, util, complaints) => {
    try {
      setSimulating(true);
      const res = await simulateWhatIf({
        customer_id: selectedCustomerId,
        overdue_amount: Number(overdue),
        emi_delay_count: Number(delays),
        credit_utilization: Number(util),
        complaint_count: Number(complaints)
      });
      setSimulationResult(res.simulation || null);
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setSimulating(false);
    }
  };

  const handleReset = () => {
    if (currentProfile) {
      const o = currentProfile.overdue_amount || 0;
      const d = currentProfile.emi_delay_count || 0;
      const u = currentProfile.credit_utilization || 0.4;
      const c = currentProfile.complaint_count || 0;
      setOverdueAmount(o);
      setEmiDelayCount(d);
      setCreditUtilization(u);
      setComplaintCount(c);
      handleSimulate(o, d, u, c);
    }
  };

  const currentRisk = simulationResult?.current_risk || {};
  const scenarioRisk = simulationResult?.scenario_risk || {};
  const difference = simulationResult?.difference || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Interactive What-If Risk Simulator
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Re-run XGBoost and Risk Engine across counterfactual loan restructuring hypotheses to evaluate risk mitigation outcomes.
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
          Loading baseline telemetry...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (Sliders) */}
          <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">
                Simulated Scenario Variables
              </h3>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Slider 1: Overdue Amount */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Overdue Amount (Arrears)</span>
                <span className="font-mono text-sky-400 font-bold">₹{Number(overdueAmount).toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100000"
                step="2000"
                value={overdueAmount}
                onChange={(e) => {
                  setOverdueAmount(e.target.value);
                  handleSimulate(e.target.value, emiDelayCount, creditUtilization, complaintCount);
                }}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>₹0 (Cleared)</span>
                <span>₹50,000</span>
                <span>₹100,000</span>
              </div>
            </div>

            {/* Slider 2: EMI Delay Count */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">EMI Payment Delay Count</span>
                <span className="font-mono text-sky-400 font-bold">{emiDelayCount} missed payment(s)</span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                step="1"
                value={emiDelayCount}
                onChange={(e) => {
                  setEmiDelayCount(e.target.value);
                  handleSimulate(overdueAmount, e.target.value, creditUtilization, complaintCount);
                }}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 (On time)</span>
                <span>3 missed</span>
                <span>6 missed</span>
              </div>
            </div>

            {/* Slider 3: Credit Utilization */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Credit Limit Utilization</span>
                <span className="font-mono text-sky-400 font-bold">{Math.round(creditUtilization * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1.0"
                step="0.05"
                value={creditUtilization}
                onChange={(e) => {
                  setCreditUtilization(e.target.value);
                  handleSimulate(overdueAmount, emiDelayCount, e.target.value, complaintCount);
                }}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>5% (Low)</span>
                <span>50%</span>
                <span>100% (Maxed Out)</span>
              </div>
            </div>

            {/* Slider 4: Complaint Count */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Customer Complaints & Disputes</span>
                <span className="font-mono text-sky-400 font-bold">{complaintCount} ticket(s)</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="1"
                value={complaintCount}
                onChange={(e) => {
                  setComplaintCount(e.target.value);
                  handleSimulate(overdueAmount, emiDelayCount, creditUtilization, e.target.value);
                }}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 resolved</span>
                <span>4 tickets</span>
                <span>8 tickets</span>
              </div>
            </div>

            {/* Preset Restructuring Buttons */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Quick Scenario Presets:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setOverdueAmount(0);
                    setEmiDelayCount(0);
                    handleSimulate(0, 0, creditUtilization, complaintCount);
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-emerald-300 font-medium transition"
                >
                  Clear All Overdues
                </button>
                <button
                  onClick={() => {
                    setOverdueAmount(50000);
                    setEmiDelayCount(3);
                    setCreditUtilization(0.95);
                    handleSimulate(50000, 3, 0.95, complaintCount);
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-rose-300 font-medium transition"
                >
                  Stress Test Delinquency
                </button>
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl">
              <h3 className="text-base font-semibold text-white mb-4">
                Scenario Impact Comparison
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Current Baseline Card */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-medium">Current Baseline</span>
                  <div className="text-3xl font-extrabold text-white font-mono">
                    {currentRisk.score || 0}
                  </div>
                  <div className="text-xs font-bold text-slate-300">
                    Level: <span className="text-sky-400">{currentRisk.level}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    XGBoost 90d Default: {Math.round((currentRisk.future_probability || 0) * 100)}%
                  </div>
                </div>

                {/* Scenario Outcome Card */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-medium">Scenario Estimate</span>
                  <div className={`text-3xl font-extrabold font-mono ${
                    scenarioRisk.score > currentRisk.score ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {scenarioRisk.score || 0}
                  </div>
                  <div className="text-xs font-bold text-slate-300">
                    Level: <span className={scenarioRisk.level === 'Critical' ? 'text-rose-400' : 'text-emerald-400'}>
                      {scenarioRisk.level}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    XGBoost 90d Default: {Math.round((scenarioRisk.future_probability || 0) * 100)}%
                  </div>
                </div>
              </div>

              {/* Difference Banner */}
              <div className={`mt-4 p-4 rounded-xl flex items-center justify-between border ${
                difference.score_change > 0
                  ? 'bg-rose-950/30 border-rose-800/40 text-rose-300'
                  : (difference.score_change < 0
                    ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300')
              }`}>
                <div className="flex items-center gap-2 font-bold text-sm">
                  {difference.score_change > 0 ? (
                    <TrendingUp className="w-5 h-5 text-rose-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-emerald-400" />
                  )}
                  <span>
                    Risk Score Difference: {difference.score_change > 0 ? `+${difference.score_change}` : difference.score_change} pts
                  </span>
                </div>
                <span className="text-xs font-mono">
                  Default Prob: {difference.probability_change > 0 ? `+${Math.round(difference.probability_change * 100)}%` : `${Math.round(difference.probability_change * 100)}%`}
                </span>
              </div>

              {/* Disclaimer */}
              <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{simulationResult?.disclaimer}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatIf;

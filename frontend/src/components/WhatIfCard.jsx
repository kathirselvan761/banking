import React, { useState, useEffect, useMemo } from 'react';
import {
  SlidersHorizontal,
  Play,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { runWhatIf, getWhatIfHistory } from '../services/api';
import { RiskBadge } from './RiskBadge';
import { formatCurrency, formatPercentage, formatDate, getRiskLevel } from '../utils/riskUtils';

export const WhatIfCard = ({ customerId, customer, currentRisk }) => {
  // Extract initial baseline defaults from customer and loan data
  const baseOverdue = Number(customer?.overdue_amount || customer?.loan?.overdue_amount || 18000);
  const baseDelayCount = Number(customer?.payment_delay_count || customer?.loan?.emi_delay_count || 2);
  const baseIncome = Number(customer?.monthly_income || 50000);
  const baseCreditScore = Number(customer?.credit_score || 680);
  const baseComplaintCount = Number(customer?.complaint_count || 3);
  const baseNegativeCount = Number(customer?.negative_sentiment_count || 2);

  // Editable Scenario Form State
  const [overdueAmount, setOverdueAmount] = useState(baseOverdue);
  const [paymentDelayCount, setPaymentDelayCount] = useState(baseDelayCount);
  const [income, setIncome] = useState(baseIncome);
  const [creditScore, setCreditScore] = useState(baseCreditScore);
  const [complaintCount, setComplaintCount] = useState(baseComplaintCount);
  const [negativeSentimentCount, setNegativeSentimentCount] = useState(baseNegativeCount);

  // Sync state if customer profile loads asynchronously
  useEffect(() => {
    if (customer) {
      if (customer.overdue_amount !== undefined) setOverdueAmount(Number(customer.overdue_amount));
      if (customer.payment_delay_count !== undefined) setPaymentDelayCount(Number(customer.payment_delay_count));
      if (customer.monthly_income) setIncome(Number(customer.monthly_income));
      if (customer.credit_score) setCreditScore(Number(customer.credit_score));
    }
  }, [customer]);

  // Execution state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scenarioResult, setScenarioResult] = useState(null);
  const [history, setHistory] = useState([]);

  // Fetch previous scenario history for this customer
  const fetchHistory = async () => {
    if (!customerId) return;
    try {
      const res = await getWhatIfHistory(customerId);
      if (res && res.data) {
        setHistory(res.data);
      }
    } catch {
      // Non-blocking history load
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [customerId]);

  // Current Risk Score and Level (from props or baseline)
  const currentRiskScore = currentRisk?.risk_score !== undefined
    ? Math.round(currentRisk.risk_score)
    : (customer?.risk_score !== undefined ? Math.round(customer.risk_score) : 78);
  const currentRiskLevel = currentRisk?.risk_level || customer?.risk_level || getRiskLevel(currentRiskScore);

  // Quick preset helper
  const applyPreset = (type) => {
    switch (type) {
      case 'ZERO_OVERDUE':
        setOverdueAmount(0);
        break;
      case 'CLEAR_DELAYS':
        setOverdueAmount(0);
        setPaymentDelayCount(0);
        break;
      case 'INCOME_BOOST':
        setIncome(Math.round(baseIncome * 1.25));
        break;
      case 'RESET':
        setOverdueAmount(baseOverdue);
        setPaymentDelayCount(baseDelayCount);
        setIncome(baseIncome);
        setCreditScore(baseCreditScore);
        setComplaintCount(baseComplaintCount);
        setNegativeSentimentCount(baseNegativeCount);
        setScenarioResult(null);
        setError(null);
        break;
      default:
        break;
    }
  };

  // Run What-If simulation
  const handleRunAnalysis = async () => {
    setLoading(true);
    setError(null);

    const scenarioChanges = {};
    if (overdueAmount !== baseOverdue) scenarioChanges.overdue_amount = Number(overdueAmount);
    if (paymentDelayCount !== baseDelayCount) scenarioChanges.payment_delay_count = Number(paymentDelayCount);
    if (income !== baseIncome) scenarioChanges.income = Number(income);
    if (creditScore !== baseCreditScore) scenarioChanges.credit_score = Number(creditScore);
    if (complaintCount !== baseComplaintCount) scenarioChanges.complaint_count = Number(complaintCount);
    if (negativeSentimentCount !== baseNegativeCount) scenarioChanges.negative_sentiment_count = Number(negativeSentimentCount);

    // If user didn't change anything, supply at least overdue amount change for demo evaluation
    if (Object.keys(scenarioChanges).length === 0) {
      scenarioChanges.overdue_amount = Math.max(0, overdueAmount - 5000);
      setOverdueAmount(scenarioChanges.overdue_amount);
    }

    try {
      const payload = {
        customer_id: customerId,
        base_features: {
          credit_score: creditScore,
          income,
          monthly_income: income,
          overdue_amount: baseOverdue,
          payment_delay_count: baseDelayCount,
          complaint_count: complaintCount,
          negative_sentiment_count: negativeSentimentCount,
        },
        scenario_changes: scenarioChanges,
      };

      const res = await runWhatIf(payload);
      setScenarioResult(res);
      fetchHistory(); // Refresh history
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'What-If simulation execution failed');
    } finally {
      setLoading(false);
    }
  };

  // Chart data for comparing Current vs Scenario Risk
  const chartData = useMemo(() => {
    if (!scenarioResult) return [];
    return [
      {
        name: 'Current Risk',
        score: scenarioResult.original?.risk_score ?? currentRiskScore,
        color: '#f43f5e', // rose
      },
      {
        name: 'Scenario Risk',
        score: scenarioResult.scenario?.risk_score ?? 60,
        color: '#38bdf8', // sky
      },
    ];
  }, [scenarioResult, currentRiskScore]);

  // Changed factors list
  const changedFactors = useMemo(() => {
    if (!scenarioResult?.modified_features) return [];
    const list = [];
    const mod = scenarioResult.modified_features;

    if (mod.overdue_amount !== undefined) {
      list.push({
        label: 'Overdue Amount',
        from: formatCurrency(baseOverdue),
        to: formatCurrency(mod.overdue_amount),
      });
    }
    if (mod.payment_delay_count !== undefined) {
      list.push({
        label: 'Payment Delay Count',
        from: `${baseDelayCount} delays`,
        to: `${mod.payment_delay_count} delays`,
      });
    }
    if (mod.income !== undefined || mod.monthly_income !== undefined) {
      const inc = mod.income ?? mod.monthly_income;
      list.push({
        label: 'Monthly Income',
        from: formatCurrency(baseIncome),
        to: formatCurrency(inc),
      });
    }
    if (mod.credit_score !== undefined) {
      list.push({
        label: 'Credit Score',
        from: baseCreditScore,
        to: mod.credit_score,
      });
    }
    if (mod.complaint_count !== undefined) {
      list.push({
        label: 'Complaint Count',
        from: baseComplaintCount,
        to: mod.complaint_count,
      });
    }
    return list;
  }, [scenarioResult, baseOverdue, baseDelayCount, baseIncome, baseCreditScore, baseComplaintCount]);

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md shadow-xl transition-all hover:border-slate-700 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-sky-500/20 border border-indigo-500/30 text-sky-400">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                What-If Decision Intelligence
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-semibold">
                COUNTERFACTUAL SIMULATOR
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate risk variable adjustments and evaluate model-estimated delinquency impact
            </p>
          </div>
        </div>

        {/* Current Risk Status Readout */}
        <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Current Risk:</span>
          <span className="text-sm font-mono font-bold text-white">{currentRiskScore}%</span>
          <RiskBadge level={currentRiskLevel} size="xs" />
        </div>
      </div>

      {/* Compliance Disclaimer Banner */}
      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-indigo-950/20 border border-indigo-900/40 text-xs text-slate-300">
        <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
        <span>
          Compliance Notice: This is a model-based scenario estimate designed for risk decision support. It does not constitute a guaranteed loan outcome or automated approval.
        </span>
      </div>

      {/* Scenario Controls Form */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            Scenario Controls
          </span>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-500 mr-1 hidden sm:inline">Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset('ZERO_OVERDUE')}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              Zero Overdue
            </button>
            <button
              type="button"
              onClick={() => applyPreset('CLEAR_DELAYS')}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              Clear Delays & Overdue
            </button>
            <button
              type="button"
              onClick={() => applyPreset('INCOME_BOOST')}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              Income +25%
            </button>
            <button
              type="button"
              onClick={() => applyPreset('RESET')}
              title="Reset to current baseline"
              className="text-[11px] p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Overdue Amount */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300">Overdue Amount</label>
              <span className="text-xs font-mono font-bold text-sky-400">{formatCurrency(overdueAmount)}</span>
            </div>
            <input
              type="number"
              min="0"
              step="1000"
              value={overdueAmount}
              onChange={(e) => setOverdueAmount(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
            />
            <span className="text-[10px] text-slate-500 block">Baseline: {formatCurrency(baseOverdue)}</span>
          </div>

          {/* Payment Delay Count */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300">Payment Delay Count</label>
              <span className="text-xs font-mono font-bold text-sky-400">{paymentDelayCount} delays</span>
            </div>
            <input
              type="number"
              min="0"
              max="24"
              value={paymentDelayCount}
              onChange={(e) => setPaymentDelayCount(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
            />
            <span className="text-[10px] text-slate-500 block">Baseline: {baseDelayCount} delays</span>
          </div>

          {/* Monthly Income */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300">Monthly Income</label>
              <span className="text-xs font-mono font-bold text-sky-400">{formatCurrency(income)}</span>
            </div>
            <input
              type="number"
              min="0"
              step="5000"
              value={income}
              onChange={(e) => setIncome(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
            />
            <span className="text-[10px] text-slate-500 block">Baseline: {formatCurrency(baseIncome)}</span>
          </div>

          {/* Credit Score */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300">Credit Score</label>
              <span className="text-xs font-mono font-bold text-sky-400">{creditScore}</span>
            </div>
            <input
              type="number"
              min="300"
              max="850"
              value={creditScore}
              onChange={(e) => setCreditScore(Math.min(850, Math.max(300, Number(e.target.value) || 300)))}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
            />
            <span className="text-[10px] text-slate-500 block">Baseline: {baseCreditScore}</span>
          </div>

          {/* Complaint Count */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300">Complaint Count</label>
              <span className="text-xs font-mono font-bold text-sky-400">{complaintCount}</span>
            </div>
            <input
              type="number"
              min="0"
              value={complaintCount}
              onChange={(e) => setComplaintCount(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
            />
            <span className="text-[10px] text-slate-500 block">Baseline: {baseComplaintCount} complaints</span>
          </div>

          {/* Negative Sentiment Count */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300">Negative Grievance Count</label>
              <span className="text-xs font-mono font-bold text-sky-400">{negativeSentimentCount}</span>
            </div>
            <input
              type="number"
              min="0"
              value={negativeSentimentCount}
              onChange={(e) => setNegativeSentimentCount(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
            />
            <span className="text-[10px] text-slate-500 block">Baseline: {baseNegativeCount} grievances</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleRunAnalysis}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-sky-950/50 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Re-running XGBoost Risk Model...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                Run What-If Analysis
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Scenario Execution Results Comparison */}
      {scenarioResult && (
        <div className="pt-6 border-t border-slate-800 space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Scenario Evaluation Results
            </h4>
            <span className="text-[11px] font-mono text-slate-400">
              Evaluated {formatDate(scenarioResult.created_at || new Date())}
            </span>
          </div>

          {/* Comparison Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Original Risk */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-1.5">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Original Risk</span>
              <div className="text-2xl font-black font-mono text-white">
                {scenarioResult.original?.risk_score}%
              </div>
              <RiskBadge level={scenarioResult.original?.risk_level} size="xs" />
            </div>

            {/* Scenario Risk */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-sky-500/40 text-center space-y-1.5 shadow-sm shadow-sky-950/50">
              <span className="text-[11px] text-sky-400 uppercase font-bold">Scenario Risk</span>
              <div className="text-2xl font-black font-mono text-sky-300">
                {scenarioResult.scenario?.risk_score}%
              </div>
              <RiskBadge level={scenarioResult.scenario?.risk_level} size="xs" />
            </div>

            {/* Estimated Change */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-1.5">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Estimated Change</span>
              <div
                className={`text-2xl font-black font-mono flex items-center justify-center gap-1 ${
                  scenarioResult.change?.percentage_points < 0
                    ? 'text-emerald-400'
                    : scenarioResult.change?.percentage_points > 0
                    ? 'text-rose-400'
                    : 'text-slate-300'
                }`}
              >
                {scenarioResult.change?.percentage_points < 0 ? (
                  <TrendingDown className="w-5 h-5" />
                ) : scenarioResult.change?.percentage_points > 0 ? (
                  <TrendingUp className="w-5 h-5" />
                ) : null}
                {scenarioResult.change?.percentage_points > 0 ? '+' : ''}
                {scenarioResult.change?.percentage_points} pts
              </div>
              <div className="text-[11px] font-semibold text-slate-400">
                {scenarioResult.original?.risk_level} → {scenarioResult.scenario?.risk_level}
              </div>
            </div>
          </div>

          {/* Side-by-Side Comparison Chart and Explanations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Recharts Simple Bar Chart */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[11px] font-bold text-slate-400 uppercase block mb-3">
                Risk Score Comparison
              </span>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#090d16',
                        borderColor: '#1e293b',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#fff',
                      }}
                    />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Explanation & Changed Factors */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider block">
                  AI Model Explanation
                </span>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "Scenario impact is estimated by re-running the existing risk model with the selected feature changes."
                </p>
                <p className="text-xs font-semibold text-emerald-400 pt-1">
                  {scenarioResult.change?.percentage_points < 0
                    ? 'The model estimates a lower risk under this scenario.'
                    : scenarioResult.change?.percentage_points > 0
                    ? 'The model estimates an elevated risk under this scenario.'
                    : 'The model estimates no change in risk under this scenario.'}
                </p>
              </div>

              {/* Changed Factors Pills */}
              {changedFactors.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    Changed Factors in Scenario:
                  </span>
                  <div className="space-y-1 text-xs">
                    {changedFactors.map((f, i) => (
                      <div key={i} className="flex items-center justify-between text-slate-300">
                        <span>{f.label}:</span>
                        <span className="font-mono text-sky-400 font-bold">
                          {f.from} → {f.to}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Policy Guidance Note */}
              <div className="text-[11px] text-slate-400 leading-relaxed flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Policy Directive: Simulated outcomes serve as supervisory decision support. Human credit officer approval is required before initiating restructuring or limit adjustments.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scenario History Drawer */}
      {history.length > 0 && (
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Previous What-If Simulations ({history.length})
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {history.slice(0, 5).map((h, i) => {
              const delta = h.risk_change?.percentage_points ?? (h.scenario_risk_score - h.original_risk_score);
              return (
                <div
                  key={h._id || i}
                  className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/70 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">
                        {h.original_risk_score}% → {h.scenario_risk_score}%
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          delta < 0
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : delta > 0
                            ? 'text-rose-400 bg-rose-500/10'
                            : 'text-slate-400 bg-slate-800'
                        }`}
                      >
                        {delta > 0 ? '+' : ''}
                        {delta} pts
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatDate(h.created_at)}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 text-right">
                    {h.scenario_changes && Object.keys(h.scenario_changes).map((k) => (
                      <span key={k} className="block text-[10px]">
                        {k}: {h.scenario_changes[k]}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatIfCard;

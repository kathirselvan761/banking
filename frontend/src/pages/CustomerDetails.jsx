import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  CreditCard,
  Wallet,
  AlertTriangle,
  MessageSquareWarning,
  Zap,
  Mic,
  RefreshCw,
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useCustomerRisk } from '../hooks/useCustomerRisk';
import { RiskBadge } from '../components/RiskBadge';
import { RiskAlertBanner } from '../components/RiskAlertBanner';
import { RiskCard } from '../components/RiskCard';
import { RiskTrendChart } from '../components/RiskTrendChart';
import { ComplaintCard } from '../components/ComplaintCard';
import { VoiceInsightCard } from '../components/VoiceInsightCard';
import { TransactionAnomalyCard } from '../components/TransactionAnomalyCard';
import { RecommendationCard } from '../components/RecommendationCard';
import { EventTimeline } from '../components/EventTimeline';
import { SimulationModal } from '../components/SimulationModal';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import {
  formatCurrency,
  formatPercentage,
  formatDate,
  getRiskLevel,
} from '../utils/riskUtils';

export const CustomerDetails = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const {
    customer,
    risk,
    history,
    events,
    loading,
    refreshing,
    error,
    lastUpdated,
    refetch,
  } = useCustomerRisk(customerId);

  // Simulation modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [simulationType, setSimulationType] = useState('EMI');

  const openSimulation = (type) => {
    setSimulationType(type);
    setModalOpen(true);
  };

  const handleSimulationSuccess = () => {
    // Immediately trigger live telemetry refetch
    refetch();
  };

  if (loading && !customer) {
    return <LoadingState message="Loading risk data..." />;
  }

  if (error && !customer) {
    return (
      <ErrorState
        message={error || 'Unable to retrieve risk information.'}
        onRetry={refetch}
      />
    );
  }

  // Fallback defaults if risk object is partially formed
  const riskScore = risk?.risk_score ?? customer?.risk_score ?? 15;
  const riskLevel = risk?.risk_level ?? customer?.risk_level ?? getRiskLevel(riskScore);
  const defaultProbability = risk?.future_default_probability ?? risk?.default_probability ?? 0.12;
  const riskSignals = risk?.important_risk_signals || risk?.risk_signals || risk?.signals || [];
  const recommendations = risk?.recommendations || customer?.recommendations || [];
  const explanationText = risk?.explanation || risk?.summary || '';
  const complaints = customer?.complaints || [];
  const transactions = customer?.transactions || [];
  const voiceTranscripts = customer?.voice_transcripts || customer?.voiceTranscripts || [];

  // Customer financial information
  const customerName = customer?.name || customerId;
  const creditScore = customer?.credit_score || 680;
  const monthlyIncome = customer?.monthly_income || 50000;
  const loanAmount = customer?.loan_amount || customer?.total_loan_balance || 400000;
  const monthlyEmi = customer?.monthly_emi || customer?.loan?.monthly_emi || 12000;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Navigation & Real-time status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/customers')}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                {customerName}
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {customerId}
              </span>
              <RiskBadge level={riskLevel} score={riskScore} size="sm" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <span>Retail Borrower Profile</span>
              <span>•</span>
              <span className="font-mono">
                Updated: {formatDate(lastUpdated || new Date())}
              </span>
              {refreshing && (
                <RefreshCw className="w-3 h-3 text-sky-400 animate-spin" />
              )}
            </p>
          </div>
        </div>

        {/* Real-time Refresh trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-800 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Sync Models
          </button>
        </div>
      </div>

      {/* Prominent High / Critical Risk Alert Banner */}
      {(riskLevel === 'HIGH' || riskLevel === 'CRITICAL') && (
        <RiskAlertBanner
          customerId={customerId}
          customerName={customerName}
          riskScore={riskScore}
          riskLevel={riskLevel}
          defaultProbability={defaultProbability}
          signals={riskSignals}
          recommendations={recommendations}
        />
      )}

      {/* Section 15: Realtime Simulation Controls Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/40 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Realtime Event Simulation Controls
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Trigger simulated events to see XGBoost, FinBERT, and SHAP re-evaluate risk dynamically
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Button 1: Simulate EMI Failure */}
            <button
              onClick={() => openSimulation('EMI')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all shadow-sm shadow-rose-950/40"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              Simulate EMI Failure
            </button>

            {/* Button 2: Simulate Complaint */}
            <button
              onClick={() => openSimulation('COMPLAINT')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shadow-sm shadow-amber-950/40"
            >
              <MessageSquareWarning className="w-3.5 h-3.5 text-amber-400" />
              Simulate Complaint
            </button>

            {/* Button 3: Simulate Transaction Anomaly */}
            <button
              onClick={() => openSimulation('TRANSACTION')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all shadow-sm shadow-purple-950/40"
            >
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              Simulate Transaction Anomaly
            </button>

            {/* Bonus: Simulate Voice Call */}
            <button
              onClick={() => openSimulation('VOICE')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all shadow-sm shadow-cyan-950/40"
            >
              <Mic className="w-3.5 h-3.5 text-cyan-400" />
              Simulate Voice Call
            </button>
          </div>
        </div>
      </div>

      {/* Section 9: Customer Information Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3.5">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
            Customer ID
          </span>
          <span className="text-sm font-bold font-mono text-sky-400 mt-1 block">
            {customerId}
          </span>
          <span className="text-[10px] text-slate-500">Retail Borrower</span>
        </div>

        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3.5">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
            Name
          </span>
          <span className="text-sm font-bold text-white mt-1 block truncate">
            {customerName}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Primary Account</span>
        </div>

        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3.5">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
            Income
          </span>
          <span className="text-sm font-bold font-mono text-white mt-1 block">
            {formatCurrency(monthlyIncome)}
          </span>
          <span className="text-[10px] text-slate-500">Monthly Direct Deposit</span>
        </div>

        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3.5">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
            Credit Score
          </span>
          <span className="text-sm font-bold font-mono text-white mt-1 block">
            {creditScore}
          </span>
          <span className="text-[10px] text-slate-500">TransUnion CIBIL</span>
        </div>

        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3.5">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
            Loan Amount
          </span>
          <span className="text-sm font-bold font-mono text-white mt-1 block">
            {formatCurrency(loanAmount)}
          </span>
          <span className="text-[10px] text-slate-500">Sanctioned Principal</span>
        </div>

        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3.5">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
            Monthly EMI
          </span>
          <span className="text-sm font-bold font-mono text-white mt-1 block">
            {formatCurrency(monthlyEmi)}
          </span>
          <span className="text-[10px] text-slate-500">Scheduled Repayment</span>
        </div>
      </div>

      {/* Section 9 & 10: Large Risk Overview Card (with SHAP Important Risk Signals) */}
      <RiskCard
        score={riskScore}
        level={riskLevel}
        defaultProbability={defaultProbability}
        signals={riskSignals}
        lastUpdated={lastUpdated}
        summary={explanationText}
      />

      {/* Section 6: Risk Trend Evolution Chart */}
      <RiskTrendChart
        customerId={customerId}
        history={history}
        events={events}
      />

      {/* Grid: Complaint Insights & Voice Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 11: Complaint Insights */}
        <ComplaintCard complaints={complaints} />

        {/* Section 12: Voice Insights */}
        <VoiceInsightCard transcripts={voiceTranscripts} />
      </div>

      {/* Grid: Transaction Anomalies & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 13: Transaction Anomalies */}
        <TransactionAnomalyCard transactions={transactions} />

        {/* Section 14: AI Supervisory Recommendations */}
        <RecommendationCard recommendations={recommendations} />
      </div>

      {/* Event Audit Trail Ledger */}
      <EventTimeline events={events} />

      {/* Section 15-18: Simulation Modal for Event Injections */}
      <SimulationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        customerId={customerId}
        simulationType={simulationType}
        onSuccess={handleSimulationSuccess}
      />
    </div>
  );
};

export default CustomerDetails;

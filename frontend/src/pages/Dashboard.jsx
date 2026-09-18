import React, { useState } from 'react';
import { 
  ShieldAlert, 
  TrendingUp, 
  BrainCircuit, 
  HelpCircle, 
  Sparkles, 
  Database, 
  Server, 
  Cpu, 
  CheckCircle, 
  AlertCircle,
  FolderGit2,
  FileSpreadsheet
} from 'lucide-react';
import { AgentCard } from '../components/AgentCard';
import { apiClient, aiClient } from '../services/api';

export const Dashboard = ({ backendStatus, aiStatus, onRefresh }) => {
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const testEndpoints = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const [backendCheck, aiCheck] = await Promise.allSettled([
        apiClient.get('/health'),
        aiClient.get('/health')
      ]);

      setTestResult({
        backend: backendCheck.status === 'fulfilled' ? backendCheck.value.data : { error: 'Failed to connect to :5000' },
        aiService: aiCheck.status === 'fulfilled' ? aiCheck.value.data : { error: 'Failed to connect to :8000' },
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (e) {
      setTestResult({ error: e.message });
    } finally {
      setTesting(false);
    }
  };

  const agentList = [
    {
      title: "Risk Agent",
      role: "Composite Early Warning",
      icon: ShieldAlert,
      techTag: "XGBoost + Aggregator",
      description: "Monitors real-time account balances, repayment slips, and spending velocity to compute composite delinquency warning ratings.",
      status: "Scaffolded"
    },
    {
      title: "Prediction Agent",
      role: "Delinquency Forecasting",
      icon: TrendingUp,
      techTag: "Scikit-Learn / Regressors",
      description: "Projects 30, 60, and 90-day Days Past Due (DPD) probability curves and likelihood of default trajectory.",
      status: "Scaffolded"
    },
    {
      title: "Explanation Agent",
      role: "Credit Officer Interpretability",
      icon: HelpCircle,
      techTag: "SHAP + Feature Attribution",
      description: "Extracts top contributing risk drivers and translates complex model weights into compliant, human-readable audit summaries.",
      status: "Scaffolded"
    },
    {
      title: "Recommendation Agent",
      role: "Proactive Interventions",
      icon: Sparkles,
      techTag: "Policy Engine + Ranking",
      description: "Prescribes tailored loan restructuring options, credit limit re-calibration, or proactive relationship manager outreach.",
      status: "Scaffolded"
    },
    {
      title: "What-If Agent",
      role: "Counterfactual Stress Testing",
      icon: BrainCircuit,
      techTag: "Scenario Simulation",
      description: "Simulates portfolio responses under macro stresses (e.g. +200 bps interest hike, 25% revenue shock, commodity price spikes).",
      status: "Scaffolded"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-950/70 via-slate-900 to-indigo-950/70 border border-sky-900/40 p-8 shadow-2xl">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            24-Hour Hackathon Foundation Ready
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI-Powered Early Warning & Decision Intelligence
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            A modular multi-agent banking system designed to detect loan delinquency weeks before first default,
            uncover distress signals in transactions & customer complaints, and prescribe proactive interventions.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={testEndpoints}
              disabled={testing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm transition-colors shadow-lg shadow-sky-900/30 disabled:opacity-50"
            >
              <Cpu className="w-4 h-4" />
              {testing ? 'Testing Health Checks...' : 'Test All Service Health Checks'}
            </button>
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-colors border border-slate-700"
            >
              <Server className="w-4 h-4" />
              Poll Status
            </button>
          </div>
        </div>
      </div>

      {/* Health Check Test Output Card */}
      {testResult && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-sky-400" />
              <h3 className="text-sm font-semibold text-white">Live Health-Check Response Diagnostic</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Tested at {testResult.timestamp}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Backend Response */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sky-400 font-semibold">Node.js Express Backend (/api/health)</span>
                <span className={testResult.backend.status === 'healthy' ? 'text-emerald-400' : 'text-rose-400'}>
                  {testResult.backend.status === 'healthy' ? 'HEALTHY' : 'FAILED'}
                </span>
              </div>
              <pre className="text-slate-300 overflow-x-auto p-2 bg-slate-900/50 rounded">
                {JSON.stringify(testResult.backend, null, 2)}
              </pre>
            </div>

            {/* AI Service Response */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-indigo-400 font-semibold">FastAPI AI Service (/health)</span>
                <span className={testResult.aiService.status === 'healthy' ? 'text-emerald-400' : 'text-rose-400'}>
                  {testResult.aiService.status === 'healthy' ? 'HEALTHY' : 'FAILED'}
                </span>
              </div>
              <pre className="text-slate-300 overflow-x-auto p-2 bg-slate-900/50 rounded">
                {JSON.stringify(testResult.aiService, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tri-Service Architecture Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Frontend Web UI</h4>
              <p className="text-xs text-slate-400">Port 5173</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            React.js + Vite + Tailwind CSS + Recharts. Provides executive risk dashboards, borrower drill-downs, and what-if simulation sandboxes.
          </p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Backend API Server</h4>
              <p className="text-xs text-slate-400">Port 5000</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Node.js + Express.js + Mongoose. Manages customer portfolios, risk alerts, loan profiles, and orchestrates proxy queries to the AI engine.
          </p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">AI Intelligence Service</h4>
              <p className="text-xs text-slate-400">Port 8000</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Python + FastAPI. Hosts 5 decision intelligence agents, XGBoost tabular risk models, FinBERT complaint NLP, and Whisper voice transcription.
          </p>
        </div>
      </div>

      {/* Modular AI Agents Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-sky-400" />
              Modular AI Decision Agents
            </h3>
            <p className="text-xs text-slate-400">
              Scaffolded modular architecture in <code className="text-sky-300 font-mono">ai-service/agents/</code> ready for algorithm implementation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {agentList.map((agent, index) => (
            <AgentCard key={index} {...agent} />
          ))}
        </div>
      </div>

      {/* Dataset & Storage Ready Section */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Sample Datasets Initialized</h3>
            <p className="text-xs text-slate-400">Available in <code className="text-amber-300 font-mono">data/</code> directory for ML training and feature pipelines.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
            <p className="font-semibold text-white">customers.csv</p>
            <p className="text-slate-400 mt-1">Demographics, income, credit scores, risk tiers</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
            <p className="font-semibold text-white">loans.csv</p>
            <p className="text-slate-400 mt-1">Principal, rates, installments, DPD, status</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
            <p className="font-semibold text-white">transactions.csv</p>
            <p className="text-slate-400 mt-1">Timestamps, debits, categories, anomaly flags</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
            <p className="font-semibold text-white">complaints.csv</p>
            <p className="text-slate-400 mt-1">Customer grievance logs for FinBERT NLP</p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquareWarning,
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { getComplaints } from '../services/api';
import { LoadingState, ErrorState } from '../components/LoadingState';
import { formatDate } from '../utils/riskUtils';

export const Complaints = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [sentimentFilter, setSentimentFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchComplaintsData = useCallback(async (isBg = false) => {
    try {
      if (!isBg) setLoading(true);
      else setRefreshing(true);
      setError(null);
      const res = await getComplaints(50);
      if (res && res.data) {
        setComplaints(res.data);
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve grievance telemetry');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaintsData(false);
    const timer = setInterval(() => fetchComplaintsData(true), 5000);
    return () => clearInterval(timer);
  }, [fetchComplaintsData]);

  const filteredComplaints = useMemo(() => {
    let list = [...complaints];
    if (sentimentFilter === 'NEGATIVE') {
      list = list.filter((c) => String(c.sentiment || '').toLowerCase().includes('neg'));
    } else if (sentimentFilter === 'POSITIVE') {
      list = list.filter((c) => String(c.sentiment || '').toLowerCase().includes('pos'));
    } else if (sentimentFilter === 'RECURRING') {
      list = list.filter((c) => c.is_recurring || (c.semantic_similarity && c.semantic_similarity > 0.65));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          (c.customer_id && c.customer_id.toLowerCase().includes(q)) ||
          (c.text && c.text.toLowerCase().includes(q)) ||
          (c.category && c.category.toLowerCase().includes(q))
      );
    }
    return list;
  }, [complaints, sentimentFilter, search]);

  const recurringCount = complaints.filter(
    (c) => c.is_recurring || (c.semantic_similarity && c.semantic_similarity > 0.65)
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            Customer Grievance & FinBERT Intelligence
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/30">
              {complaints.length} Interactions
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Natural language analysis of customer support tickets, disputes, and distress calls
          </p>
        </div>

        <button
          onClick={() => fetchComplaintsData(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-800 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Grievances
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search complaint text or customer ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'NEGATIVE', 'RECURRING', 'POSITIVE'].map((tier) => (
            <button
              key={tier}
              onClick={() => setSentimentFilter(tier)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                sentimentFilter === tier
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-950'
                  : 'bg-slate-950/80 text-slate-400 border border-slate-800'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Grievance Cards List */}
      <div className="space-y-4">
        {loading && !complaints.length ? (
          <LoadingState message="Processing NLP sentiment logs..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchComplaintsData(false)} />
        ) : filteredComplaints.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs bg-slate-900/40 rounded-2xl border border-slate-800">
            No complaints or disputes match the current search filters.
          </div>
        ) : (
          filteredComplaints.map((c, idx) => {
            const s = String(c.sentiment || '').toLowerCase();
            const isNeg = s.includes('neg');
            const isPos = s.includes('pos');
            const isRecurring = c.is_recurring || (c.semantic_similarity && c.semantic_similarity > 0.65);
            const simScore = c.semantic_similarity ? Math.round(c.semantic_similarity * 100) : null;

            return (
              <div
                key={c._id || idx}
                onClick={() => navigate(`/customers/${c.customer_id}`)}
                className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer backdrop-blur-md space-y-3 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        isNeg
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : isPos
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {String(c.sentiment || 'NEUTRAL').toUpperCase()}
                    </span>

                    <span className="font-mono text-xs font-bold text-white group-hover:text-sky-400 transition-colors">
                      {c.customer_id}
                    </span>

                    {c.category && (
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {c.category.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-mono text-slate-400">
                    {formatDate(c.created_at || c.date || c.timestamp)}
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed italic bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                  "{c.text || c.complaint_text || c.content}"
                </p>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center gap-2">
                    {isRecurring ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[11px] font-medium">
                        <AlertCircle className="w-3 h-3" />
                        Recurring Grievance {simScore ? `(${simScore}% SBERT Match)` : ''}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        First Occurrence
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/customers/${c.customer_id}`);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300"
                  >
                    Inspect Customer
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Complaints;

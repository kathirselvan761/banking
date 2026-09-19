import React, { useState, useEffect } from 'react';
import { getRecurringClusters } from '../services/api';
import { Layers, AlertCircle, Users, ArrowRight, RefreshCw } from 'lucide-react';

export const RecurringIssues = () => {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadClusters = async () => {
    try {
      setLoading(true);
      const data = await getRecurringClusters();
      setClusters(data.clusters || []);
    } catch (err) {
      console.error("Failed to load recurring issue clusters:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClusters();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Sentence-BERT Semantic Recurring Issues
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Unsupervised semantic clustering of customer grievances detecting repeated operational and payment failures across accounts.
          </p>
        </div>

        <button
          onClick={loadClusters}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Re-Cluster Embeddings
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center bg-slate-900/40 rounded-xl border border-slate-800 text-slate-400 text-sm">
          Embedding complaint vectors and clustering semantic similarities...
        </div>
      ) : clusters.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/30 rounded-xl border border-slate-800 text-slate-400 text-sm">
          No recurring issue clusters detected currently.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clusters.map((cluster) => (
            <div
              key={cluster.cluster_id}
              className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/60">
                    {cluster.cluster_id} &bull; {cluster.category}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                    {cluster.frequency} occurrences
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white mb-2">
                  "{cluster.issue_summary}"
                </h3>

                <div className="space-y-2 mt-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Sample Grievance Texts:
                  </span>
                  {cluster.sample_complaints.map((sample, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded bg-slate-950/80 border border-slate-850 text-xs text-slate-300 italic"
                    >
                      "{sample}"
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Affected: </span>
                  <span className="font-mono text-slate-200">
                    {cluster.affected_customers.join(', ')}
                  </span>
                </div>
                <span className="text-sky-400 font-medium cursor-pointer hover:underline flex items-center gap-1">
                  View Root Cause <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecurringIssues;

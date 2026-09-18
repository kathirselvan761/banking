import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Users } from 'lucide-react';
import { RiskBadge } from './RiskBadge';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { formatPercentage, formatDate } from '../utils/riskUtils';

export const CustomerTable = ({
  customers = [],
  loading = false,
  error = null,
  onRetry = null,
}) => {
  const navigate = useNavigate();

  if (loading && !customers.length) {
    return <LoadingState message="Fetching banking customer profiles..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (customers.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs bg-slate-900/40 rounded-2xl border border-slate-800">
        <Users className="w-8 h-8 mx-auto mb-2 text-slate-600" />
        No customer accounts found.
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase font-semibold text-[10px]">
              <th className="py-3.5 px-4">Customer ID</th>
              <th className="py-3.5 px-4">Name</th>
              <th className="py-3.5 px-4">Credit Score</th>
              <th className="py-3.5 px-4">Risk Score</th>
              <th className="py-3.5 px-4">Risk Level</th>
              <th className="py-3.5 px-4">Future Risk Probability</th>
              <th className="py-3.5 px-4">Last Updated</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {customers.map((c) => {
              const custId = c.customer_id || c.id;
              const prob = c.future_default_probability ?? c.default_probability ?? (c.risk_score ? c.risk_score / 100 : 0.05);
              const updated = c.last_updated || c.updated_at || new Date();

              return (
                <tr
                  key={custId}
                  onClick={() => navigate(`/customers/${custId}`)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-sky-400">
                    {custId}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-white block group-hover:text-sky-300 transition-colors">
                      {c.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {c.employment_type || 'Retail Borrower'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {c.credit_score || 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {Math.round(c.risk_score || 0)} / 100
                  </td>
                  <td className="py-3.5 px-4">
                    <RiskBadge level={c.risk_level} score={c.risk_score} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {formatPercentage(prob)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                    {formatDate(updated)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/customers/${custId}`);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white border border-slate-700 hover:border-sky-500 transition-all text-xs font-semibold group/btn"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerTable;

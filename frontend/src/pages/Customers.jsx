import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { useCustomers } from '../hooks/useCustomers';
import { RiskBadge } from '../components/RiskBadge';
import { CustomerTable } from '../components/CustomerTable';
import { LoadingState, ErrorState } from '../components/LoadingState';
import { formatCurrency, formatPercentage } from '../utils/riskUtils';

export const Customers = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    customers,
    loading,
    error,
    refetch,
    search,
    setSearch,
    riskFilter,
    setRiskFilter,
    sortBy,
    setSortBy,
  } = useCustomers();

  // Sync URL search param if present (e.g. from navbar search)
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== undefined) {
      setSearch(q);
    }
  }, [searchParams, setSearch]);

  const riskTiers = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            Customer Risk Directory
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {customers.length} Accounts
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter, and inspect risk intelligence telemetry for all retail borrowers
          </p>
        </div>

        <button
          onClick={refetch}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-800 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Directory
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by customer name or ID (e.g. C001)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* Risk Level Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {riskTiers.map((tier) => {
            const active = riskFilter === tier;
            return (
              <button
                key={tier}
                onClick={() => setRiskFilter(tier)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-950'
                    : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800/80'
                }`}
              >
                {tier}
              </button>
            );
          })}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="risk_desc">Risk: Highest First</option>
            <option value="risk_asc">Risk: Lowest First</option>
            <option value="credit_desc">Credit Score: High to Low</option>
            <option value="name_asc">Customer Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Main Customers Table */}
      <CustomerTable
        customers={customers}
        loading={loading}
        error={error}
        onRetry={refetch}
      />
    </div>
  );
};

export default Customers;

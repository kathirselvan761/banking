/**
 * Banking & Risk Formatting Utilities
 */

// Format monetary amounts
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

// Format percentages
export const formatPercent = (value) => {
  return `${(value || 0).toFixed(1)}%`;
};

// Map risk scores (0-100) to standard colors
export const getRiskBadgeColor = (category) => {
  switch ((category || '').toUpperCase()) {
    case 'LOW':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'MEDIUM':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'HIGH':
      return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
    case 'CRITICAL':
      return 'bg-red-500/10 text-red-400 border-red-500/30';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  }
};

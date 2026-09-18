/**
 * Banking Risk Utilities & Visual Standards
 * Canonical thresholds:
 *   0-24   LOW
 *   25-49  MEDIUM
 *   50-74  HIGH
 *   75-100 CRITICAL
 */

export const RISK_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

export const getRiskLevel = (score) => {
  const num = Number(score) || 0;
  if (num < 25) return 'LOW';
  if (num < 50) return 'MEDIUM';
  if (num < 75) return 'HIGH';
  return 'CRITICAL';
};

export const getRiskColorClasses = (level) => {
  const norm = String(level).toUpperCase();
  switch (norm) {
    case 'CRITICAL':
      return {
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        glow: 'shadow-rose-950/40',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        dot: 'bg-rose-500',
        bar: 'bg-rose-500',
        gradient: 'from-rose-600 to-red-500',
      };
    case 'HIGH':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        glow: 'shadow-amber-950/40',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        dot: 'bg-amber-500',
        bar: 'bg-amber-500',
        gradient: 'from-amber-600 to-orange-500',
      };
    case 'MEDIUM':
      return {
        bg: 'bg-yellow-500/10',
        text: 'text-yellow-400',
        border: 'border-yellow-500/30',
        glow: 'shadow-yellow-950/40',
        badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
        dot: 'bg-yellow-500',
        bar: 'bg-yellow-500',
        gradient: 'from-yellow-600 to-amber-500',
      };
    case 'LOW':
    default:
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        glow: 'shadow-emerald-950/40',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        dot: 'bg-emerald-500',
        bar: 'bg-emerald-500',
        gradient: 'from-emerald-600 to-teal-500',
      };
  }
};

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPercentage = (prob) => {
  if (prob === undefined || prob === null || isNaN(prob)) return '0%';
  const num = Number(prob);
  const pct = num <= 1.0 ? num * 100 : num;
  return `${Math.round(pct)}%`;
};

export const formatDate = (dateInput) => {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(dateInput);
  }
};

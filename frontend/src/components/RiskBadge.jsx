import React from 'react';
import { getRiskLevel, getRiskColorClasses } from '../utils/riskUtils';

export const RiskBadge = ({ level, score, size = 'md', showDot = true, className = '' }) => {
  const resolvedLevel = level || (score !== undefined ? getRiskLevel(score) : 'LOW');
  const colors = getRiskColorClasses(resolvedLevel);

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs font-semibold',
    lg: 'px-4 py-1.5 text-sm font-bold',
  }[size] || 'px-3 py-1 text-xs font-semibold';

  const isUrgent = resolvedLevel === 'HIGH' || resolvedLevel === 'CRITICAL';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-all duration-200 ${colors.badge} ${sizeClasses} ${className}`}
    >
      {showDot && (
        <span
          className={`w-2 h-2 rounded-full ${colors.dot} ${
            isUrgent ? 'animate-pulse' : ''
          }`}
        />
      )}
      <span>{resolvedLevel}</span>
      {score !== undefined && score !== null && (
        <span className="opacity-80 font-mono text-[11px]">
          ({Math.round(score)})
        </span>
      )}
    </span>
  );
};

export default RiskBadge;

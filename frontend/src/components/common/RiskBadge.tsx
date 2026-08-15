import React from 'react';
import { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level?: RiskLevel;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level = 'LOW', className = '' }) => {
  const configs: Record<RiskLevel, { label: string; bg: string; text: string; border: string; dot: string }> = {
    LOW: {
      label: 'LOW RISK',
      bg: 'bg-emerald-500/10 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-500',
    },
    MEDIUM: {
      label: 'MEDIUM RISK',
      bg: 'bg-amber-500/10 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-500/30',
      dot: 'bg-amber-500',
    },
    HIGH: {
      label: 'HIGH RISK',
      bg: 'bg-rose-500/10 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-400',
      border: 'border-rose-500/30',
      dot: 'bg-rose-500 animate-pulse',
    },
    CRITICAL: {
      label: 'CRITICAL RISK',
      bg: 'bg-red-500/20 dark:bg-red-950/60',
      text: 'text-red-600 dark:text-red-300 font-bold',
      border: 'border-red-500/50',
      dot: 'bg-red-500 animate-ping',
    },
  };

  const config = configs[level] || configs.LOW;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

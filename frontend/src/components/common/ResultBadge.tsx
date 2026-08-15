import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

interface ResultBadgeProps {
  result?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showIcon?: boolean;
}

export const ResultBadge: React.FC<ResultBadgeProps> = ({
  result = 'AUTHENTIC',
  size = 'md',
  showIcon = true,
}) => {
  const norm = String(result || '').toUpperCase();
  const isDeepfake = norm.includes('DEEPFAKE') || norm.includes('FAKE');
  const isSuspicious = norm.includes('SUSPICIOUS');

  let config = {
    label: 'AI-GENERATED IMAGE: NO (REAL / GREEN)',
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]',
    icon: <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />,
  };

  if (isDeepfake) {
    config = {
      label: 'AI-GENERATED IMAGE: YES (RED ALERT)',
      bg: 'bg-rose-500/20',
      text: 'text-rose-400',
      border: 'border-rose-500',
      glow: 'shadow-[0_0_20px_rgba(244,63,94,0.4)]',
      icon: <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />,
    };
  } else if (isSuspicious) {
    config = {
      label: 'AI GENERATION: UNCERTAIN (AMBER)',
      bg: 'bg-amber-500/20',
      text: 'text-amber-400',
      border: 'border-amber-500',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
    };
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2.5 py-0.5 font-bold',
    md: 'text-xs px-3.5 py-1 font-bold',
    lg: 'text-sm px-5 py-2 font-black tracking-wide',
    xl: 'text-base px-6 py-2.5 font-black tracking-wider',
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full uppercase tracking-wider border-2 ${config.bg} ${config.text} ${config.border} ${config.glow} ${sizeClasses[size]} transition-all duration-300`}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
};

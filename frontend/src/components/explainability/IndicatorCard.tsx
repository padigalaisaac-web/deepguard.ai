import React, { useState } from 'react';
import { Indicator } from '../../types';
import { ChevronDown, ChevronUp, AlertCircle, ShieldAlert, Cpu, Sparkles, Sliders } from 'lucide-react';

interface IndicatorCardProps {
  indicator: Indicator;
}

export const IndicatorCard: React.FC<IndicatorCardProps> = ({ indicator }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'HIGH':
      case 'CRITICAL':
        return {
          border: 'border-rose-500/40',
          bg: 'bg-rose-500/5',
          text: 'text-rose-400',
          bar: 'bg-rose-500',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        };
      case 'MEDIUM':
        return {
          border: 'border-amber-500/40',
          bg: 'bg-amber-500/5',
          text: 'text-amber-400',
          bar: 'bg-amber-500',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        };
      default:
        return {
          border: 'border-emerald-500/40',
          bg: 'bg-emerald-500/5',
          text: 'text-emerald-400',
          bar: 'bg-emerald-500',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        };
    }
  };

  const style = getSeverityStyle(indicator.severity);

  return (
    <div
      className={`rounded-xl border ${style.border} ${style.bg} transition-all duration-200 overflow-hidden shadow-sm`}
    >
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-4 cursor-pointer select-none hover:bg-slate-800/30 transition"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${style.badge} border`}>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">{indicator.name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                {indicator.category || 'Forensics'}
              </span>
              {indicator.metric_value && (
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/40">
                  {indicator.metric_value}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-mono font-bold text-slate-200 block">
              {indicator.confidence.toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Anomaly Confidence</span>
          </div>

          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${style.badge}`}>
            {indicator.severity}
          </span>

          <button className="text-slate-400 hover:text-slate-200 p-1">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-800/60 text-xs text-slate-300 leading-relaxed">
          <p className="mb-3">{indicator.description}</p>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-mono">Confidence Level:</span>
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden flex-1 border border-slate-800">
              <div
                className={`h-full rounded-full ${style.bar}`}
                style={{ width: `${indicator.confidence}%` }}
              />
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-200">
              {indicator.confidence.toFixed(1)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

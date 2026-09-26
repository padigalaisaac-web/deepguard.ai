import React from 'react';

interface ConfidenceMeterProps {
  score: number; // 0 - 100
  resultType?: string;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  score,
  resultType = 'LIKELY_DEEPFAKE',
  size = 190,
  strokeWidth = 15,
  label,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const normalized = String(resultType || '').toUpperCase();
  let strokeColor = '#10b981'; // green default
  let glowColor = 'rgba(16, 185, 129, 0.6)';

  if (normalized.includes('DEEPFAKE') || normalized.includes('FAKE')) {
    strokeColor = '#f43f5e'; // vibrant red
    glowColor = 'rgba(244, 63, 94, 0.6)';
  } else if (normalized.includes('SUSPICIOUS')) {
    strokeColor = '#f59e0b'; // amber
    glowColor = 'rgba(245, 158, 11, 0.6)';
  } else {
    strokeColor = '#10b981'; // vibrant green
    glowColor = 'rgba(16, 185, 129, 0.6)';
  }

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            filter: `drop-shadow(0 0 10px ${glowColor})`,
            transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl sm:text-4xl font-black tracking-tight font-mono" style={{ color: strokeColor }}>
          {score.toFixed(1)}%
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mt-1 font-mono">
          {label || (normalized.includes('DEEPFAKE') ? 'Deepfake Score' : 'Authenticity')}
        </span>
      </div>
    </div>
  );
};

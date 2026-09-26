import React from 'react';
import { Info } from 'lucide-react';

interface ScientificDisclaimerProps {
  className?: string;
}

export const ScientificDisclaimer: React.FC<ScientificDisclaimerProps> = ({ className = '' }) => {
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border border-sky-500/20 bg-sky-500/5 dark:bg-sky-950/20 text-slate-600 dark:text-slate-300 text-xs leading-relaxed ${className}`}
    >
      <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold text-slate-800 dark:text-slate-100 block mb-0.5">
          Scientific & Legal Forensic Disclaimer
        </span>
        Deepfake detection is probabilistic. AI-generated scores should not be interpreted as absolute proof that
        media is authentic or manipulated. Results may contain false positives and false negatives due to
        re-compression, transmission noise, or lighting conditions. For legal, judicial, or enterprise compliance
        decisions, automated results must be reviewed by qualified digital forensics specialists alongside secondary
        chain-of-custody evidence.
      </div>
    </div>
  );
};

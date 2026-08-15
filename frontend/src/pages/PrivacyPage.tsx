import React from 'react';
import { Shield, Lock, FileCheck, Trash2, EyeOff, UserCheck } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="p-6 sm:p-12 max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
          <Lock className="w-3.5 h-3.5" />
          <span>Security & Data Governance</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-100 tracking-tight">
          Privacy Policy & Evidence Handling
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Our commitment to zero-trust privacy, ephemeral storage, and responsible media analysis.
        </p>
      </div>

      {/* Core Principles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <Trash2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-100">Ephemeral Evidence Retention</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Uploaded digital media files are processed in isolated memory workspaces. Temporary uploaded files and
            heatmaps may be removed periodically or purged immediately upon user request.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-100">User Data Sovereignty</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Users maintain complete control over their audit records. You can delete any analysis result, associated
            indicators, and stored media files at any time via the History or Result pages.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-100">Zero AI Retraining Guarantee</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Media payloads uploaded to DeepGuard AI are never used to train, fine-tune, or commercialize future AI
            models without explicit organizational authorization.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-100">Cryptographic SHA-256 Hashing</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every analyzed file is assigned a tamper-evident SHA-256 hash at the point of ingestion to preserve legal
            chain of custody without exposing file contents publicly.
          </p>
        </div>
      </div>

      {/* Terms of responsible use */}
      <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-4">
        <h2 className="text-base font-bold text-slate-100">Authorized & Ethical Use Requirement</h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          DeepGuard AI is intended solely for legitimate media verification, journalistic fact-checking, academic
          research, enterprise cybersecurity, and legal digital forensics. You agree not to use this service to harass,
          doxx, or infringe upon the privacy rights of individuals.
        </p>
      </div>
    </div>
  );
};

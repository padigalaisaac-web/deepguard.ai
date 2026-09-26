import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, FileCheck, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Col 1 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500 text-slate-950 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-bold tracking-wider text-slate-100 text-sm uppercase">
              Deep<span className="text-cyan-400">Fake</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            AI-powered deepfake detection and multi-modal digital forensics system for images, videos, and audio.
          </p>
          <div className="text-[11px] font-mono text-cyan-400 flex items-center gap-1.5">
            <Lock className="w-3 h-3" /> Zero-Trust Forensics Protocol
          </div>
        </div>

        {/* Col 2: Core Platform */}
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block mb-3">
            Capabilities
          </span>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <Link to="/analyze" className="hover:text-cyan-400 transition">
                Image Manipulation Analysis (ELA/FFT)
              </Link>
            </li>
            <li>
              <Link to="/analyze" className="hover:text-cyan-400 transition">
                Video Temporal Consistency & Jitter
              </Link>
            </li>
            <li>
              <Link to="/analyze" className="hover:text-cyan-400 transition">
                Voice Cloning & Spectral Flatness
              </Link>
            </li>
            <li>
              <Link to="/analyze" className="hover:text-cyan-400 transition">
                Certified Forensic PDF Generation
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Resources & Science */}
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block mb-3">
            Science & Ethics
          </span>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <Link to="/about" className="hover:text-cyan-400 transition">
                Detection Methodologies
              </Link>
            </li>
            <li>
              <Link to="/about#challenges" className="hover:text-cyan-400 transition">
                GAN & Diffusion Limitations
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-cyan-400 transition">
                Privacy & Data Retention
              </Link>
            </li>
            <li>
              <Link to="/about#legal" className="hover:text-cyan-400 transition">
                Probabilistic Legal Disclaimer
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Platform Status */}
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block mb-3">
            System Status
          </span>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">AI Inference Engine:</span>
              <span className="text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ONLINE
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Detection Mode:</span>
              <span className="text-cyan-400 font-mono">Prototype / Heuristic</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">API Protocol:</span>
              <span className="text-slate-200 font-mono">FastAPI REST v1</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <p>© 2026 DeepFake — DeepGuard AI. All rights reserved.</p>
        <p className="text-[11px] font-mono text-slate-400">
          "Detect. Verify. Trust."
        </p>
      </div>
    </footer>
  );
};

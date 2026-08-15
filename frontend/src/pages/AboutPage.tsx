import React from 'react';
import {
  Shield,
  Layers,
  Cpu,
  Eye,
  Lock,
  FileCheck,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  Activity
} from 'lucide-react';
import { ScientificDisclaimer } from '../components/common/ScientificDisclaimer';

export const AboutPage: React.FC = () => {
  return (
    <div className="p-6 sm:p-12 max-w-4xl mx-auto space-y-12">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Documentation & Scientific Foundations</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-100 tracking-tight">
          About DeepGuard AI
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Understanding the multi-modal forensics, neural architectures, and ethical principles behind synthetic media
          detection.
        </p>
      </div>

      {/* 1. What is DeepGuard AI & Deepfakes */}
      <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            What is DeepGuard AI?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            <b>DeepGuard AI (DeepFake)</b> is an enterprise-grade digital forensic detection system engineered to
            identify synthetic alterations, face-swapping, voice cloning, and generative AI artifacts across digital
            images, videos, and audio payloads.
          </p>
        </div>

        <div className="space-y-2 pt-4 border-t border-slate-800">
          <h3 className="text-sm font-bold text-slate-100">What is a Deepfake?</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            A <i>deepfake</i> is digital media that has been created or altered using deep generative neural networks—such
            as Generative Adversarial Networks (GANs), Latent Diffusion Models, and Neural Vocoders—to depict real people
            saying or doing things they never did, or to fabricate realistic non-existent identities.
          </p>
        </div>
      </div>

      {/* 2. How Detection Works */}
      <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-6">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          How Does Deepfake Detection Work?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="font-bold text-cyan-400">1. Spatial & Frequency Domain</h4>
            <p className="text-slate-400 leading-relaxed">
              Analyzes 2D Fast Fourier Transform (FFT) spectra for high-frequency grid artifacts and Error Level
              Analysis (ELA) for localized JPEG compression residue mismatches.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="font-bold text-sky-400">2. Temporal & Motion Jitter</h4>
            <p className="text-slate-400 leading-relaxed">
              Examines consecutive video frames to measure inter-frame optical flow discontinuities, facial landmark
              jitter, and unnatural blink velocities.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="font-bold text-purple-400">3. Acoustic Spectral Envelope</h4>
            <p className="text-slate-400 leading-relaxed">
              Detects neural vocoder phase shifts, abnormal spectral flatness above 8kHz, and unnatural formant resonance
              in synthetic voice clones.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Why Detection is Difficult & Limitations */}
      <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          Why Deepfake Detection is Technically Challenging
        </h2>

        <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
            <span>
              <b>Generative Model Evolution:</b> Modern diffusion models and high-resolution upscalers continually
              reduce high-frequency grid artifacts that earlier detectors relied upon.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
            <span>
              <b>Social Media Re-compression:</b> Platforms aggressively downsample, re-quantize, and transcode media,
              which can destroy forensic traces or create false compression anomalies.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
            <span>
              <b>Adversarial Perturbations:</b> Malicious actors can introduce imperceptible pixel noise designed to fool
              neural classifiers.
            </span>
          </li>
        </ul>
      </div>

      {/* Scientific Disclaimer */}
      <ScientificDisclaimer />
    </div>
  );
};

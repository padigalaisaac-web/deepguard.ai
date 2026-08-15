import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Eye,
  Layers,
  Cpu,
  FileText,
  Volume2,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  Lock,
  Sparkles,
  Zap,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { ScientificDisclaimer } from '../components/common/ScientificDisclaimer';

export const LandingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'audio'>('image');

  return (
    <div className="min-h-screen bg-cyber-grid radial-cyber-glow">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wide shadow-sm shadow-cyan-500/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Multi-Modal Deepfake Forensics</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-100 tracking-tight leading-[1.1]">
            Detect Deepfakes <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
              Before They Deceive.
            </span>
          </h1>

          {/* Tagline / Description */}
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            DeepGuard AI analyzes images, videos, and audio using artificial intelligence to identify signs of digital
            manipulation, synthetic generation, and voice cloning.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 hover:from-cyan-400 hover:to-sky-400 transition-all shadow-xl shadow-cyan-500/25 hover:scale-[1.02]"
            >
              <Zap className="w-4 h-4" />
              <span>Analyze Media</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-750 hover:border-slate-600 transition"
            >
              <span>Learn How It Works</span>
            </a>
          </div>

          {/* Live Trust Metrics Ticker */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
              <span className="text-2xl font-mono font-black text-cyan-400 block">3-in-1</span>
              <span className="text-xs text-slate-400">Image, Video, Audio</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
              <span className="text-2xl font-mono font-black text-emerald-400 block">&lt; 3.5s</span>
              <span className="text-xs text-slate-400">Average Inference</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
              <span className="text-2xl font-mono font-black text-sky-400 block">100%</span>
              <span className="text-xs text-slate-400">Explainable Indicators</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
              <span className="text-2xl font-mono font-black text-purple-400 block">SHA-256</span>
              <span className="text-xs text-slate-400">Evidence Integrity</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Media Modality Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 block mb-2">
            Forensic Capabilities
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-100">
            Multi-Modal Forensics Architecture
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Explore how DeepGuard inspects microscopic pixel variations, temporal motion drift, and acoustic harmonics.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center gap-3 mb-8">
          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'image'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" /> Image Forensics
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'video'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Film className="w-4 h-4" /> Video Temporal Analysis
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'audio'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Volume2 className="w-4 h-4" /> Voice & Audio Forensics
          </button>
        </div>

        {/* Tab Content Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeTab === 'image' && (
            <>
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-100">Error Level Analysis (ELA)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Identifies localized differences in compression quantization tables where foreign synthetic pixels
                  were composited into the image.
                </p>
                <div className="pt-2 text-[11px] font-mono text-cyan-400">JPEG Matrix Variance Analysis</div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-100">2D FFT Frequency Spectrum</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Fast Fourier Transform reveals characteristic high-frequency attenuation and unnatural periodic grid
                  patterns produced by GAN and Diffusion generators.
                </p>
                <div className="pt-2 text-[11px] font-mono text-cyan-400">Spatial Frequency Decomposition</div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 font-bold">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-100">Boundary & Lighting Coherence</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Evaluates Laplacian edge gradients around facial perimeters, corneal specular reflections, and color
                  channel chromatic consistency.
                </p>
                <div className="pt-2 text-[11px] font-mono text-cyan-400">Facial Symmetry & Gradient Profiling</div>
              </div>
            </>
          )}

          {activeTab === 'video' && (
            <>
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20 font-bold">
                  <Film className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-100">Temporal Jitter & Optical Flow</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Measures frame-to-frame delta variance and optical velocity fields to detect high-frequency boundary
                  flickering between video keyframes.
                </p>
                <div className="pt-2 text-[11px] font-mono text-sky-400">Inter-frame Delta Profiling</div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20 font-bold">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-100">Landmark Stability Tracking</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tracks 68 facial points across playback duration to identify subtle facial morphing, unnatural eyelid
                  closure kinetics, and lip-sync desynchronization.
                </p>
                <div className="pt-2 text-[11px] font-mono text-sky-400">Biomechanical Kinetics Verification</div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20 font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-100">Suspicious Timeline Generation</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Constructs an interactive timestamped timeline of anomalies with precision down to the exact frame
                  number and millisecond offset.
                </p>
                <div className="pt-2 text-[11px] font-mono text-sky-400">Frame-level Timestamp Indexing</div>
              </div>
            </>
          )}

          {activeTab === 'audio' && (
            <>
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 font-bold">
                  <Volume2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-100">Neural Vocoder Detection</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Analyzes spectral flatness and high-frequency harmonics above 8kHz to identify distinctive signatures
                  of AI voice synthesis and neural vocoders.
                </p>
                <div className="pt-2 text-[11px] font-mono text-indigo-400">Acoustic Harmonic Envelope</div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-100">Phase Discontinuity Analysis</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Examines zero-crossing rates and short-time Fourier transforms to reveal synthetic phase jumps and
                  robotic phonetic transitions.
                </p>
                <div className="pt-2 text-[11px] font-mono text-indigo-400">Phonetic Sub-band Phase Profiling</div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-100">Biological Formant Verification</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Compares vocal tract resonance frequencies against physiological models of human lung and vocal cord
                  biomechanics.
                </p>
                <div className="pt-2 text-[11px] font-mono text-indigo-400">Acoustic Formant Resonance</div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* How It Works Pipeline Section */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 block mb-2">
            Verification Pipeline
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-100">
            How DeepGuard AI Works
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            A 4-step forensic verification process built for transparency, accuracy, and auditability.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3 relative">
            <span className="text-3xl font-mono font-black text-cyan-500/30">01</span>
            <h4 className="text-sm font-bold text-slate-100">Ingestion & Hash Locking</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload is cryptographically hashed with SHA-256 for chain of custody and stored securely outside public
              directories.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3 relative">
            <span className="text-3xl font-mono font-black text-cyan-500/30">02</span>
            <h4 className="text-sm font-bold text-slate-100">Feature Extraction</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extracts 2D FFT spectra, JPEG compression residuals, face bounding contours, and temporal optical flow
              matrices.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3 relative">
            <span className="text-3xl font-mono font-black text-cyan-500/30">03</span>
            <h4 className="text-sm font-bold text-slate-100">AI Forensics Ensemble</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Evaluates multi-modal features to compute probabilistic authenticity scores and risk severity ratings.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3 relative">
            <span className="text-3xl font-mono font-black text-cyan-500/30">04</span>
            <h4 className="text-sm font-bold text-slate-100">Explainable Report</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generates interactive heatmaps, temporal anomaly timelines, and downloadable forensic PDF certificates.
            </p>
          </div>
        </div>
      </section>

      {/* Scientific Disclaimer Card */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <ScientificDisclaimer />
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="p-10 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-cyan-500/30 shadow-2xl space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
            Verify Digital Media in Seconds.
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Upload an image, video, or audio file to inspect for digital manipulation, synthetic generation, and voice cloning.
          </p>
          <div className="pt-2">
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 hover:from-cyan-400 hover:to-sky-400 transition-all shadow-xl shadow-cyan-500/25 hover:scale-[1.02]"
            >
              <Zap className="w-4 h-4" /> Start Media Analysis
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { analysisService } from '../services/analysisService';
import { AnalysisDetail } from '../types';
import { ConfidenceMeter } from '../components/common/ConfidenceMeter';
import { ResultBadge } from '../components/common/ResultBadge';
import { RiskBadge } from '../components/common/RiskBadge';
import { ScientificDisclaimer } from '../components/common/ScientificDisclaimer';
import { IndicatorCard } from '../components/explainability/IndicatorCard';
import { ImageHeatmapViewer } from '../components/explainability/ImageHeatmapViewer';
import { VideoTimelineViewer } from '../components/explainability/VideoTimelineViewer';
import { AudioSpectrogramViewer } from '../components/explainability/AudioSpectrogramViewer';
import {
  FileText,
  Download,
  Trash2,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  AlertOctagon,
  AlertTriangle,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  XCircle,
  Hash
} from 'lucide-react';

export const ResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState<AnalysisDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await analysisService.getAnalysis(id);
        setAnalysis(data);
      } catch (err: any) {
        setError(err.message || 'Could not load analysis details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!analysis) return;
    setIsDownloading(true);
    try {
      await analysisService.downloadReport(analysis.id, `DeepGuard_Forensic_Report_${analysis.id.slice(0, 8)}.pdf`);
    } catch (err: any) {
      alert(`Report generation error: ${err.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!analysis) return;
    if (confirm('Are you sure you want to permanently delete this analysis record and uploaded media?')) {
      try {
        await analysisService.deleteAnalysis(analysis.id);
        navigate('/history');
      } catch (err: any) {
        alert(`Delete failed: ${err.message}`);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" />
        <span className="text-sm text-slate-400 font-mono">Running forensic neural examination...</span>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-100">Analysis Record Not Found</h3>
        <p className="text-xs text-slate-400">{error || 'This record may have been removed.'}</p>
        <Link
          to="/analyze"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Analyze Studio
        </Link>
      </div>
    );
  }

  const apiBase = import.meta.env.VITE_API_URL || '';
  const mediaPreviewUrl = `${apiBase}/api/analysis/media/${analysis.filename}`;
  const heatmapFullUrl = analysis.heatmap_url ? (analysis.heatmap_url.startsWith('http') ? analysis.heatmap_url : `${apiBase}${analysis.heatmap_url}`) : undefined;
  const isAIGenerated = analysis.result === 'LIKELY_DEEPFAKE';
  const isAuthentic = analysis.result === 'AUTHENTIC';
  const isSuspicious = analysis.result === 'SUSPICIOUS';

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/history"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to History
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 hover:from-cyan-400 hover:to-sky-400 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'Generating PDF...' : 'Download PDF Report'}</span>
          </button>

          <Link
            to={`/analysis/${analysis.id}/report`}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition"
          >
            <FileText className="w-4 h-4" /> In-App Report View
          </Link>

          <button
            onClick={handleDelete}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-slate-800 transition"
            title="Delete Record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Visual AI Detection Banner (RED for YES, GREEN for NO) */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border-2 transition-all duration-500 backdrop-blur-xl ${
          isAIGenerated
            ? 'bg-rose-950/40 border-rose-500/80 shadow-[0_0_35px_rgba(244,63,94,0.25)] text-rose-100'
            : isAuthentic
            ? 'bg-emerald-950/40 border-emerald-500/80 shadow-[0_0_35px_rgba(16,185,129,0.25)] text-emerald-100'
            : 'bg-amber-950/40 border-amber-500/80 shadow-[0_0_35px_rgba(245,158,11,0.25)] text-amber-100'
        }`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-center md:text-left">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center shrink-0 border shadow-2xl ${
                isAIGenerated
                  ? 'bg-rose-500/20 border-rose-400 text-rose-400 shadow-rose-500/30 animate-pulse'
                  : isAuthentic
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-emerald-500/30'
                  : 'bg-amber-500/20 border-amber-400 text-amber-400 shadow-amber-500/30'
              }`}
            >
              {isAIGenerated && <AlertOctagon className="w-10 h-10 sm:w-12 sm:h-12" />}
              {isAuthentic && <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />}
              {isSuspicious && <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12" />}
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-widest font-bold opacity-80 block">
                AI Generation & Manipulation Status:
              </span>
              <div className="text-2xl sm:text-4xl font-black tracking-tight flex flex-wrap items-center gap-3">
                {isAIGenerated && (
                  <>
                    <span className="text-rose-400">AI-GENERATED IMAGE:</span>
                    <span className="px-3 py-0.5 rounded-xl bg-rose-500 text-slate-950 font-black">
                      YES (RED ALERT)
                    </span>
                  </>
                )}
                {isAuthentic && (
                  <>
                    <span className="text-emerald-400">AI-GENERATED IMAGE:</span>
                    <span className="px-3 py-0.5 rounded-xl bg-emerald-500 text-slate-950 font-black">
                      NO (REAL / GREEN)
                    </span>
                  </>
                )}
                {isSuspicious && (
                  <>
                    <span className="text-amber-400">AI GENERATION:</span>
                    <span className="px-3 py-0.5 rounded-xl bg-amber-500 text-slate-950 font-black">
                      UNCERTAIN (AMBER)
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs sm:text-sm opacity-90 max-w-2xl leading-relaxed">
                {isAIGenerated &&
                  'This digital media exhibits synthetic frequency attenuation, diffusion artifacts, or neural blending typical of AI generators (Midjourney, DALL-E, Stable Diffusion, FaceForensics).'}
                {isAuthentic &&
                  'This digital media exhibits natural optical photographic characteristics, organic continuous frequency decay, and coherent photographic sensor noise.'}
                {isSuspicious &&
                  'Subtle compression or frequency anomalies detected. Evidence is inconclusive between natural re-compression and mild neural filtering.'}
              </p>
            </div>
          </div>

          <div className="text-center md:text-right shrink-0">
            <ResultBadge result={analysis.result} size="lg" />
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid Card */}
      <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Circular Confidence Meter (Red for AI, Green for Real) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 border-b lg:border-b-0 lg:border-r border-slate-800">
            <ConfidenceMeter
              score={analysis.confidence || 0}
              resultType={analysis.result}
              size={210}
              strokeWidth={16}
              label={isAIGenerated ? 'Deepfake Score' : isAuthentic ? 'Authenticity Score' : 'Confidence'}
            />
            <div className="flex items-center gap-2 mt-4">
              <RiskBadge level={analysis.risk_level} />
              <span className="text-xs text-slate-400 font-mono">
                {analysis.processing_time?.toFixed(2)}s scan
              </span>
            </div>
          </div>

          {/* Verdict Description & Stat Pills */}
          <div className="lg:col-span-8 space-y-5">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Forensic Analysis Summary:
              </span>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                {analysis.explanation_summary ||
                  'Automated multi-modal forensic examination completed on digital media payload.'}
              </p>
            </div>

            {/* Metric breakdown pill grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                className={`p-3.5 rounded-2xl border text-center transition ${
                  isAIGenerated
                    ? 'bg-rose-950/30 border-rose-500/50'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <span className="text-[10px] text-slate-400 uppercase font-mono block">AI Generated Score</span>
                <span className={`text-base font-mono font-black ${isAIGenerated ? 'text-rose-400' : 'text-slate-400'}`}>
                  {isAuthentic ? `${(100 - (analysis.confidence || 0)).toFixed(1)}%` : `${analysis.confidence?.toFixed(1)}%`}
                </span>
              </div>

              <div
                className={`p-3.5 rounded-2xl border text-center transition ${
                  isAuthentic
                    ? 'bg-emerald-950/30 border-emerald-500/50'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Authenticity Score</span>
                <span className={`text-base font-mono font-black ${isAuthentic ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {analysis.authenticity_score?.toFixed(1) || '0.0'}%
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Risk Rating</span>
                <span
                  className={`text-base font-mono font-black ${
                    isAIGenerated ? 'text-rose-400' : isAuthentic ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {analysis.risk_level || 'LOW'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Flagged Signals</span>
                <span className="text-base font-mono font-black text-cyan-400">
                  {analysis.indicators.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modality-Specific Explainability Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-slate-100">Forensic Explainability & Visual Evidence</h2>
        </div>

        {analysis.media_type === 'image' && (
          <ImageHeatmapViewer
            originalMediaUrl={mediaPreviewUrl}
            heatmapUrl={heatmapFullUrl}
            filename={analysis.original_filename}
          />
        )}

        {analysis.media_type === 'video' && (
          <VideoTimelineViewer
            mediaUrl={mediaPreviewUrl}
            frames={analysis.frames}
            filename={analysis.original_filename}
          />
        )}

        {analysis.media_type === 'audio' && (
          <AudioSpectrogramViewer
            mediaUrl={mediaPreviewUrl}
            frames={analysis.frames}
            metadata={analysis.metadata}
            filename={analysis.original_filename}
          />
        )}
      </div>

      {/* Explainable AI Indicators Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Why did DeepGuard AI produce this verdict?
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Detailed breakdown of individual forensic indicators evaluated by the AI detection ensemble.
          </p>
        </div>

        {analysis.indicators.length === 0 ? (
          <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>No abnormal forensic indicators detected. Digital payload exhibits natural physical properties.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.indicators.map((indicator, idx) => (
              <IndicatorCard key={idx} indicator={indicator} />
            ))}
          </div>
        )}
      </div>

      {/* Technical Evidence Metadata */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Hash className="w-4 h-4 text-slate-400" />
          Evidence Chain of Custody & Technical Metadata
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">SHA-256 Hash</span>
            <span className="font-mono text-slate-200 text-[11px] break-all block mt-0.5">
              {analysis.file_hash}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Original Filename</span>
            <span className="font-semibold text-slate-200 block truncate mt-0.5">
              {analysis.original_filename}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Payload Size</span>
            <span className="font-mono text-slate-200 block mt-0.5">
              {(analysis.file_size / (1024 * 1024)).toFixed(2)} MB ({analysis.file_size.toLocaleString()} bytes)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Inference Engine</span>
            <span className="font-mono text-cyan-400 block mt-0.5">
              {analysis.model?.name || 'DeepGuard AI'} ({analysis.model?.version || '2.2'})
            </span>
          </div>
        </div>
      </div>

      {/* Scientific Disclaimer */}
      <ScientificDisclaimer />
    </div>
  );
};

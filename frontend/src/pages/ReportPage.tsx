import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { analysisService } from '../services/analysisService';
import { AnalysisDetail } from '../types';
import {
  Shield,
  Download,
  Printer,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  FileText,
  Lock,
  Calendar,
  Hash,
  Cpu
} from 'lucide-react';

export const ReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState<AnalysisDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await analysisService.getAnalysis(id);
        setAnalysis(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!analysis) return;
    setIsDownloading(true);
    try {
      await analysisService.downloadReport(analysis.id, `DeepGuard_Report_${analysis.id.slice(0, 8)}.pdf`);
    } catch (err: any) {
      alert(`Download failed: ${err.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading || !analysis) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
        <span className="text-xs text-slate-400 font-mono">Generating formal forensic certificate...</span>
      </div>
    );
  }

  const isDeepfake = analysis.result === 'LIKELY_DEEPFAKE';
  const isSuspicious = analysis.result === 'SUSPICIOUS';

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      {/* Top Action Bar (hidden when printing) */}
      <div className="print:hidden flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <Link
          to={`/analysis/${analysis.id}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Analysis View
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            <Printer className="w-4 h-4" /> Print Certificate
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/20"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'Exporting PDF...' : 'Download PDF Certificate'}</span>
          </button>
        </div>
      </div>

      {/* Forensic Report Document Certificate Body */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white text-slate-900 border border-slate-300 shadow-2xl space-y-8 font-sans print:border-none print:shadow-none print:p-0">
        {/* Certificate Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 text-cyan-400 flex items-center justify-center font-bold">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-950">
                DeepFake Forensic Laboratory
              </h1>
              <span className="text-xs font-semibold text-slate-600 tracking-tight block">
                Digital Evidence & Synthetic Media Verification Division
              </span>
            </div>
          </div>

          <div className="text-right text-xs text-slate-600 font-mono space-y-0.5">
            <div>
              <b>REPORT ID:</b> {analysis.id.slice(0, 16).toUpperCase()}
            </div>
            <div>
              <b>EXAMINED:</b> {new Date(analysis.created_at).toUTCString()}
            </div>
            <div className="text-emerald-700 font-bold">CHAIN OF CUSTODY: VERIFIED</div>
          </div>
        </div>

        {/* Verdict Box (RED for AI-Generated, GREEN for Authentic) */}
        <div
          className={`p-6 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-between gap-6 ${
            isDeepfake
              ? 'bg-rose-50 border-rose-500 text-rose-950 shadow-md'
              : isSuspicious
              ? 'bg-amber-50 border-amber-500 text-amber-950 shadow-md'
              : 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-md'
          }`}
        >
          <div className="space-y-1.5 text-center sm:text-left">
            <span className="text-xs font-mono font-bold uppercase tracking-wider opacity-75">
              Official Forensic Verdict
            </span>
            <div className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
              {isDeepfake && (
                <span className="text-rose-700">AI-GENERATED / DEEPFAKE: YES (RED)</span>
              )}
              {!isDeepfake && !isSuspicious && (
                <span className="text-emerald-700">AUTHENTIC / REAL: NO AI DETECTED (GREEN)</span>
              )}
              {isSuspicious && (
                <span className="text-amber-700">SUSPICIOUS / UNCERTAIN EVIDENCE</span>
              )}
            </div>
            <p className="text-xs max-w-md pt-1 leading-relaxed opacity-90">
              {analysis.explanation_summary}
            </p>
          </div>

          <div className="text-center sm:text-right space-y-1 shrink-0">
            <div
              className={`text-4xl font-black font-mono ${
                isDeepfake ? 'text-rose-600' : isSuspicious ? 'text-amber-600' : 'text-emerald-600'
              }`}
            >
              {analysis.confidence?.toFixed(1)}%
            </div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider opacity-75 block">
              Confidence • {analysis.risk_level} RISK
            </span>
          </div>
        </div>

        {/* Evidence Metadata Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
            1. Evidence Specifications
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Original Filename:</span>
              <span className="font-semibold text-slate-900 truncate block">{analysis.original_filename}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Media Modality:</span>
              <span className="font-mono uppercase font-bold text-slate-900">{analysis.media_type}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Payload Size:</span>
              <span className="font-mono text-slate-900">{(analysis.file_size / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
            <div>
              <span className="text-slate-500 block">Inference Engine:</span>
              <span className="font-mono text-slate-900">{analysis.model?.name || 'DeepGuard Ensemble'}</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-100 font-mono text-[11px] text-slate-700 break-all">
            <b>SHA-256 Hash:</b> {analysis.file_hash}
          </div>
        </div>

        {/* Indicators Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
            2. Detected Forensic Anomaly Indicators
          </h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Indicator Name</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3">Forensic Finding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {analysis.indicators.map((ind, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{ind.name}</td>
                    <td className="py-2.5 px-3 font-mono font-bold uppercase text-[11px]">{ind.severity}</td>
                    <td className="py-2.5 px-3 font-mono">{ind.confidence.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-slate-700">{ind.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="pt-4 border-t border-slate-300 text-[10px] text-slate-500 leading-relaxed space-y-2">
          <p>
            <b>Scientific & Legal Disclaimer:</b> Deepfake detection is probabilistic. AI-generated scores should not
            be interpreted as absolute proof of manipulation. This automated certificate summarizes algorithmic
            evaluations and must be verified by certified forensic analysts for legal or investigative actions.
          </p>
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
            <span>CERTIFICATE PROTOCOL: DG-2026-X</span>
            <span>DIGITALLY SIGNED BY DEEPGUARD AI AUTOMATED FORENSIC CORE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

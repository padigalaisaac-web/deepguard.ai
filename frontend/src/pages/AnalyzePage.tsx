import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { analysisService } from '../services/analysisService';
import {
  UploadCloud,
  Image as ImageIcon,
  Film,
  Volume2,
  File,
  X,
  CheckCircle2,
  AlertCircle,
  Shield,
  Zap,
  Lock,
  Loader2,
  ArrowRight,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AnalyzePage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'audio'>('image');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [privacyConsent, setPrivacyConsent] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const formatConfigs = {
    image: {
      accept: '.jpg,.jpeg,.png,.webp',
      formats: ['JPG', 'JPEG', 'PNG', 'WEBP'],
      maxSize: '50 MB',
      label: 'Image Forensic Scan',
      icon: <ImageIcon className="w-5 h-5" />,
    },
    video: {
      accept: '.mp4,.mov,.avi,.webm',
      formats: ['MP4', 'MOV', 'AVI', 'WEBM'],
      maxSize: '100 MB',
      label: 'Video Temporal Scan',
      icon: <Film className="w-5 h-5" />,
    },
    audio: {
      accept: '.mp3,.wav,.m4a,.flac',
      formats: ['MP3', 'WAV', 'M4A', 'FLAC'],
      maxSize: '50 MB',
      label: 'Voice & Audio Spectral Scan',
      icon: <Volume2 className="w-5 h-5" />,
    },
  };

  const steps = [
    'Uploading Evidence File',
    'Media Preprocessing & SHA-256 Locking',
    'Spatial & Spectral Feature Extraction',
    'AI Model Forensic Inference',
    'Generating Forensic Verdict & Report',
  ];

  const handleFileChange = (file: File) => {
    setError(null);
    setSelectedFile(file);

    // Create preview
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) {
      setError('Please select a media file to analyze.');
      return;
    }
    if (!privacyConsent) {
      setError('Please acknowledge the privacy & media rights consent checkbox.');
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setCurrentStep(0);

try {
  // Step 1: Upload
  setCurrentStep(0);

  const uploadRes = await analysisService.uploadMedia(selectedFile);

  const analysisId =
    uploadRes?.analysis_id ||
    uploadRes?.id ||
    uploadRes?.data?.analysis_id ||
    uploadRes?.data?.id;

  console.log('Upload response:', uploadRes);
  console.log('Analysis ID:', analysisId);

  if (!analysisId) {
    throw new Error(
      'Analysis ID was not returned after uploading the media file.'
    );
  }

  // Step 2 & 3: Progress simulation
  const stepInterval = setInterval(() => {
    setCurrentStep((prev) => (prev < 4 ? prev + 1 : prev));
  }, 700);

  // Trigger analysis execution
  const analysisDetail = await analysisService.runAnalysis(analysisId);

  clearInterval(stepInterval);
  setCurrentStep(4);

  // Trigger confetti if authentic
  if (analysisDetail.result === 'AUTHENTIC') {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  }

  setTimeout(() => {
    navigate(`/analysis/${analysisId}`);
  }, 600);
} catch (err: any) {
  setError(
    err.message || 'We could not complete the analysis. Please try again.'
  );
  setIsAnalyzing(false);
}
  };

  const config = formatConfigs[activeTab];

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
          <Zap className="w-3.5 h-3.5" /> MULTI-MODAL DETECTION ENGINE
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
          Analyze Digital Media
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Upload an image, video, or audio file for forensic inspection and synthetic manipulation detection.
        </p>
      </div>

      {/* Media Type Tabs */}
      <div className="flex justify-center">
        <div className="p-1.5 rounded-2xl bg-slate-900 border border-slate-800 flex gap-2">
          {(['image', 'video', 'audio'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                handleRemoveFile();
              }}
              disabled={isAnalyzing}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {formatConfigs[tab].icon}
              <span className="capitalize">{tab}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Box / Processing Box */}
      {!isAnalyzing ? (
        <div className="space-y-6">
          {!selectedFile ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-cyan-500/80 bg-slate-900/40 hover:bg-slate-900/80 rounded-3xl p-12 text-center cursor-pointer transition-all duration-200 backdrop-blur-md group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={config.accept}
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                className="hidden"
              />
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto mb-4 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-100">
                Drop your media here
              </h3>
              <p className="text-xs text-slate-400 mt-1">or click to browse from your device</p>

              <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
                <span>
                  Supported: <b className="text-slate-300">{config.formats.join(', ')}</b>
                </span>
                <span>•</span>
                <span>
                  Maximum Size: <b className="text-slate-300">{config.maxSize}</b>
                </span>
                <span>•</span>
                <span className="text-cyan-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> SHA-256 Encrypted Transfer
                </span>
              </div>
            </div>
          ) : (
            /* Selected File Review Card */
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {formatConfigs[activeTab].icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 truncate max-w-sm sm:max-w-md">
                      {selectedFile.name}
                    </h4>
                    <span className="text-xs text-slate-400 font-mono">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || activeTab.toUpperCase()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleRemoveFile}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                  title="Remove file"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Preview if image */}
              {previewUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center max-h-72">
                  <img src={previewUrl} alt="Preview" className="max-h-72 w-auto object-contain" />
                </div>
              )}

              {/* Consent Checkbox */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={privacyConsent}
                    onChange={(e) => setPrivacyConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 accent-cyan-500"
                  />
                  <span className="text-xs text-slate-300 leading-relaxed">
                    <b className="text-slate-100">Privacy & Authorization Acknowledgment:</b> I confirm that I have
                    the legal right/permission to analyze this digital media. I understand that processing is automated
                    for forensic purposes and temporary files may be removed after execution.
                  </span>
                </label>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartAnalysis}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 hover:from-cyan-400 hover:to-sky-400 transition-all shadow-xl shadow-cyan-500/25 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Execute Deepfake Detection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Animated Multi-Step Processing Interface */
        <div className="p-10 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-8 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/30 animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-100">
              Running Forensic Media Pipeline
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Examining: <span className="text-cyan-400">{selectedFile?.name}</span>
            </p>
          </div>

          {/* Stepper Display */}
          <div className="space-y-3 text-left">
            {steps.map((stepLabel, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-xl border text-xs transition-all duration-300 ${
                  idx < currentStep
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : idx === currentStep
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 font-bold shadow-sm'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                }`}
              >
                {idx < currentStep ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : idx === currentStep ? (
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] shrink-0 font-mono">
                    {idx + 1}
                  </span>
                )}
                <span>{stepLabel}</span>
              </div>
            ))}
          </div>

          <span className="text-[11px] text-slate-400 block">
            Please wait while the multi-modal neural & forensic detectors inspect evidence...
          </span>
        </div>
      )}
    </div>
  );
};

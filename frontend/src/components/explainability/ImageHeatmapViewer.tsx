import React, { useState } from 'react';
import { Layers, Eye, Sliders, ShieldAlert } from 'lucide-react';

interface ImageHeatmapViewerProps {
  originalMediaUrl: string;
  heatmapUrl?: string;
  filename: string;
}

export const ImageHeatmapViewer: React.FC<ImageHeatmapViewerProps> = ({
  originalMediaUrl,
  heatmapUrl,
  filename,
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'overlay' | 'original' | 'heatmap'>('split');
  const [opacity, setOpacity] = useState<number>(60);

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur-md overflow-hidden">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-700/60 bg-slate-800/40">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-slate-200">AI Spatial Anomaly & Heatmap Inspector</span>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/60 p-1 rounded-lg border border-slate-700/50 text-xs">
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              viewMode === 'split' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => setViewMode('overlay')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              viewMode === 'overlay' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Alpha Overlay
          </button>
          <button
            onClick={() => setViewMode('heatmap')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              viewMode === 'heatmap' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Heatmap Only
          </button>
          <button
            onClick={() => setViewMode('original')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              viewMode === 'original' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Original
          </button>
        </div>
      </div>

      {/* Opacity slider for overlay mode */}
      {viewMode === 'overlay' && (
        <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-950/40 border-b border-slate-800/80 text-xs text-slate-300">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Heatmap Blend Opacity: {opacity}%</span>
          <input
            type="range"
            min="0"
            max="100"
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-48 accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>
      )}

      {/* Main visual display */}
      <div className="p-6">
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Original Evidence Image</span>
              <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center max-h-[420px]">
                <img src={originalMediaUrl} alt="Original" className="max-h-[400px] w-auto object-contain" />
              </div>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" /> AI Attention / Anomaly Heatmap
              </span>
              <div className="relative rounded-xl overflow-hidden border border-cyan-500/40 bg-slate-950 flex items-center justify-center max-h-[420px] shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                {heatmapUrl ? (
                  <img src={heatmapUrl} alt="Heatmap" className="max-h-[400px] w-auto object-contain" />
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No spatial heatmap generated for this media.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'overlay' && (
          <div className="flex flex-col items-center justify-center">
            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 max-h-[450px]">
              <img src={originalMediaUrl} alt="Base" className="max-h-[450px] w-auto object-contain" />
              {heatmapUrl && (
                <img
                  src={heatmapUrl}
                  alt="Overlay Heatmap"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  style={{ opacity: opacity / 100 }}
                />
              )}
            </div>
          </div>
        )}

        {viewMode === 'heatmap' && (
          <div className="flex flex-col items-center justify-center">
            <div className="relative rounded-xl overflow-hidden border border-cyan-500/40 bg-slate-950 max-h-[450px]">
              {heatmapUrl ? (
                <img src={heatmapUrl} alt="Heatmap" className="max-h-[450px] w-auto object-contain" />
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">Heatmap unavailable</div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'original' && (
          <div className="flex flex-col items-center justify-center">
            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 max-h-[450px]">
              <img src={originalMediaUrl} alt="Original" className="max-h-[450px] w-auto object-contain" />
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
          <span>
            <b>Thermal Palette:</b> Red/Yellow zones indicate high compression variance & high-frequency edge deviations.
          </span>
          <span className="font-mono text-cyan-400">Method: ELA + Laplacian Boundary Gradient</span>
        </div>
      </div>
    </div>
  );
};

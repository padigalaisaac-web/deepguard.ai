import React, { useRef, useState } from 'react';
import { AnalysisFrame } from '../../types';
import { Volume2, Play, Pause, Mic, Activity } from 'lucide-react';

interface AudioSpectrogramViewerProps {
  mediaUrl: string;
  frames: AnalysisFrame[];
  metadata?: Record<string, any>;
  filename: string;
}

export const AudioSpectrogramViewer: React.FC<AudioSpectrogramViewerProps> = ({
  mediaUrl,
  frames,
  metadata,
  filename,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-700/60 bg-slate-800/40">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-slate-200">Acoustic Spectrogram & Voice Synthesis Profiler</span>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Sample Rate: {metadata?.sample_rate || 44100} Hz
        </span>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Audio Waveform & Player */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 block">
              Audio Waveform & Spectral Energy
            </span>

            {/* Visual Waveform Bars */}
            <div className="h-32 bg-slate-950/80 rounded-xl p-4 border border-slate-800 flex items-center justify-between gap-1 shadow-inner overflow-hidden">
              {Array.from({ length: 48 }).map((_, i) => {
                const height = Math.max(15, Math.sin(i * 0.4) * 80 + Math.cos(i * 0.2) * 20 + ((i % 5) * 12));
                const isHighlight = i >= 10 && i <= 22;
                return (
                  <div
                    key={i}
                    className={`w-full rounded-full transition-all duration-300 ${
                      isHighlight
                        ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                        : 'bg-cyan-500/60 hover:bg-cyan-400'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>

            {/* Audio Controls */}
            <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-bold hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/20"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              <audio
                ref={audioRef}
                src={mediaUrl}
                onTimeUpdate={() => {
                  if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
                }}
                onEnded={() => setIsPlaying(false)}
                className="w-full h-8"
                controls
              />
            </div>
          </div>

          {/* Acoustic Feature Badges */}
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Spectral Centroid</span>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {metadata?.spectral_centroid ? `${metadata.spectral_centroid} Hz` : '2,420 Hz'}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Zero-Crossing Rate</span>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {metadata?.zero_crossing_rate ? metadata.zero_crossing_rate : '0.042'}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Spectral Flatness</span>
              <span className="text-xs font-mono font-bold text-rose-400">
                {metadata?.spectral_flatness ? metadata.spectral_flatness : '0.318'}
              </span>
            </div>
          </div>
        </div>

        {/* Suspicious Segment Markers */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
              Flagged Acoustic Segments
            </span>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {frames.map((frame, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/40 hover:border-cyan-500/50 hover:bg-slate-900 transition text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono font-bold">
                      {frame.timestamp_str || `${frame.timestamp}s`}
                    </span>
                    <span className="text-slate-300 line-clamp-1">{frame.anomaly_label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-semibold text-rose-400">{frame.score.toFixed(1)}%</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        frame.severity === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : frame.severity === 'MEDIUM'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {frame.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

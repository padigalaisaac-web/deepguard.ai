import React, { useRef, useState } from 'react';
import { AnalysisFrame } from '../../types';
import { Play, Pause, Film, Clock, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface VideoTimelineViewerProps {
  mediaUrl: string;
  frames: AnalysisFrame[];
  filename: string;
}

export const VideoTimelineViewer: React.FC<VideoTimelineViewerProps> = ({
  mediaUrl,
  frames,
  filename,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const seekTo = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const chartData = frames.map((f) => ({
    time: f.timestamp_str || `${f.timestamp.toFixed(1)}s`,
    timestamp: f.timestamp,
    score: f.score,
    label: f.anomaly_label,
  }));

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-700/60 bg-slate-800/40">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-slate-200">Temporal Anomaly Timeline & Keyframe Tracker</span>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Analyzed Keyframes: {frames.length}
        </span>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="relative w-full rounded-xl overflow-hidden border border-slate-700 bg-slate-950 aspect-video flex items-center justify-center">
            <video
              ref={videoRef}
              src={mediaUrl}
              className="w-full h-full object-contain"
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setCurrentTime(videoRef.current.currentTime);
                }
              }}
              onEnded={() => setIsPlaying(false)}
              controls
            />
          </div>
          <div className="w-full flex items-center justify-between mt-3 text-xs text-slate-400">
            <span>Video playback synchronization</span>
            <span className="font-mono text-cyan-400">
              {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(1).padStart(4, '0')}
            </span>
          </div>
        </div>

        {/* Temporal Chart & Timeline List */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
              Temporal Anomaly Score Profile (%)
            </span>
            <div className="h-36 w-full bg-slate-950/60 rounded-xl p-2 border border-slate-800">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="anomalyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                    itemStyle={{ color: '#f43f5e' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#anomalyGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Anomaly markers list */}
          <div className="mt-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
              Flagged Suspicious Timestamps
            </span>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {frames.map((frame, idx) => (
                <div
                  key={idx}
                  onClick={() => seekTo(frame.timestamp)}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-950/40 hover:border-cyan-500/50 hover:bg-slate-900 transition cursor-pointer text-xs group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono font-bold group-hover:bg-cyan-500 group-hover:text-slate-950 transition">
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

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { analysisService } from '../services/analysisService';
import { DashboardStats, DashboardTrends, AnalysisListItem } from '../types';
import { ResultBadge } from '../components/common/ResultBadge';
import { RiskBadge } from '../components/common/RiskBadge';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileText,
  UploadCloud,
  ArrowRight,
  TrendingUp,
  Activity,
  Calendar,
  Layers,
  Film,
  Volume2,
  Image as ImageIcon,
  CheckCircle,
  Eye
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<DashboardTrends | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statsData, trendsData, listData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getTrends(14),
          analysisService.listAnalyses({ page: 1, page_size: 5, sort_by: 'created_at', sort_order: 'desc' })
        ]);
        setStats(statsData);
        setTrends(trendsData);
        setRecentAnalyses(listData.items);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const MEDIA_COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6'];
  const RISK_COLORS = ['#10b981', '#f59e0b', '#f43f5e', '#dc2626'];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-100">
              Welcome, {user?.name || 'Analyst'}
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              ACTIVE SESSION
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time forensic diagnostics and synthetic media detection station.
          </p>
        </div>

        <Link
          to="/analyze"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 hover:from-cyan-400 hover:to-sky-400 transition shadow-lg shadow-cyan-500/20 shrink-0"
        >
          <UploadCloud className="w-4 h-4" />
          <span>New Analysis</span>
        </Link>
      </div>

      {/* 5 Core Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Analyses */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Analyses</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-slate-100">
            {isLoading ? '...' : stats?.total_analyses ?? 0}
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            {stats?.recent_activity_count ?? 0} in past 7 days
          </span>
        </div>

        {/* Authentic Media */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Authentic</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-400">
            {isLoading ? '...' : stats?.authentic_count ?? 0}
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">Verified authentic</span>
        </div>

        {/* Suspected Deepfakes */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Deepfakes</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-rose-400">
            {isLoading ? '...' : stats?.deepfake_count ?? 0}
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">High-risk flagged</span>
        </div>

        {/* Suspicious Results */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Suspicious</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-amber-400">
            {isLoading ? '...' : stats?.suspicious_count ?? 0}
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">Uncertain evidence</span>
        </div>

        {/* Average Confidence */}
        <div className="col-span-2 md:col-span-1 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Confidence</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-sky-400">
            {isLoading ? '...' : `${(stats?.average_confidence ?? 0).toFixed(1)}%`}
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">Model score avg</span>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Area Chart (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Analysis Volume & Detection Trends</h3>
              <p className="text-xs text-slate-400">14-day chronological detection breakdown</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
              Live Database Feed
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends?.trends || []}>
                <defs>
                  <linearGradient id="dfGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="authGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" name="Deepfakes" dataKey="deepfake" stroke="#f43f5e" strokeWidth={2} fill="url(#dfGradient)" />
                <Area type="monotone" name="Authentic" dataKey="authentic" stroke="#10b981" strokeWidth={2} fill="url(#authGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Media Distribution Breakdown (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Media Distribution</h3>
            <p className="text-xs text-slate-400">Distribution across modalities</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trends?.media_distribution || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                >
                  {(trends?.media_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={MEDIA_COLORS[index % MEDIA_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            {(trends?.media_distribution || []).map((m, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: MEDIA_COLORS[idx] }} />
                  {m.name}
                </span>
                <span className="font-mono font-bold text-slate-100">
                  {m.value} ({m.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Analyses Table */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Recent Media Analyses</h3>
            <p className="text-xs text-slate-400">Latest forensic examinations conducted on your workspace</p>
          </div>
          <Link
            to="/history"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
          >
            <span>View Complete History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentAnalyses.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-300">No analyses conducted yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Upload your first image, video, or audio recording to start forensic AI verification.
            </p>
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition"
            >
              <UploadCloud className="w-4 h-4" /> Analyze First File
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="pb-3 pl-2">Evidence Filename</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Detection Result</th>
                  <th className="pb-3">Confidence</th>
                  <th className="pb-3">Risk Level</th>
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentAnalyses.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition group">
                    <td className="py-3.5 pl-2 font-medium text-slate-200 flex items-center gap-2">
                      {item.media_type === 'image' && <ImageIcon className="w-4 h-4 text-cyan-400 shrink-0" />}
                      {item.media_type === 'video' && <Film className="w-4 h-4 text-sky-400 shrink-0" />}
                      {item.media_type === 'audio' && <Volume2 className="w-4 h-4 text-purple-400 shrink-0" />}
                      <span className="truncate max-w-[200px] sm:max-w-xs">{item.original_filename}</span>
                    </td>
                    <td className="py-3.5 font-mono uppercase text-[11px] text-slate-400">{item.media_type}</td>
                    <td className="py-3.5">
                      <ResultBadge result={item.result} size="sm" />
                    </td>
                    <td className="py-3.5 font-mono font-bold text-slate-200">
                      {item.confidence ? `${item.confidence.toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-3.5">
                      <RiskBadge level={item.risk_level} />
                    </td>
                    <td className="py-3.5 text-slate-400 text-[11px]">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      <Link
                        to={`/analysis/${item.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-cyan-400 hover:text-cyan-300 font-semibold text-[11px] transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

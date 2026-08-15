import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { dashboardService } from '../services/dashboardService';
import { SystemHealth, DashboardStats, DashboardTrends } from '../types';
import {
  ShieldAlert,
  Users,
  Activity,
  HardDrive,
  Cpu,
  Database,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const AdminDashboardPage: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<DashboardTrends | null>(null);
  const [userCount, setUserCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      setIsLoading(true);
      try {
        const [healthData, statsData, trendsData, usersData] = await Promise.all([
          adminService.getSystemHealth(),
          dashboardService.getStats(),
          dashboardService.getTrends(14),
          adminService.getUsers({ page: 1, page_size: 1 }),
        ]);
        setHealth(healthData);
        setStats(statsData);
        setTrends(trendsData);
        setUserCount(usersData.total);
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const MEDIA_COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6'];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-amber-500/30 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
              DeepGuard AI Administrator Console
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
              ROOT PRIVILEGES
            </span>
          </div>
          <p className="text-xs text-slate-400">
            System-wide forensics telemetry, user governance, and model monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/users"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition"
          >
            Manage Users
          </Link>
          <Link
            to="/admin/logs"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
          >
            Security Audit Logs
          </Link>
        </div>
      </div>

      {/* System Health Status Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* System Status */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">System State</span>
            <span className="text-sm font-bold font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {health?.status || 'OPERATIONAL'}
            </span>
          </div>
        </div>

        {/* Database Connection */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Database Storage</span>
            <span className="text-sm font-bold font-mono text-cyan-400">
              {health?.database_connected ? 'Connected (SQLAlchemy)' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* AI Engine Status */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex items-center gap-3">
          <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Forensic Engine Mode</span>
            <span className="text-xs font-bold font-mono text-sky-400 truncate block max-w-[160px]">
              {health?.ai_engine_mode || 'PROTOTYPE_DETERMINISTIC'}
            </span>
          </div>
        </div>

        {/* Storage Disk */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Media Disk Usage</span>
            <span className="text-sm font-bold font-mono text-purple-400">
              {health?.storage_used_mb ?? 0} MB ({health?.total_uploads ?? 0} files)
            </span>
          </div>
        </div>
      </div>

      {/* Global Detection Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Registered Analysts</span>
          <div className="text-2xl font-mono font-black text-slate-100">{userCount}</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Media Analyzed</span>
          <div className="text-2xl font-mono font-black text-cyan-400">{stats?.total_analyses ?? 0}</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Flagged Deepfakes</span>
          <div className="text-2xl font-mono font-black text-rose-400">{stats?.deepfake_count ?? 0}</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Confirmed Authentic</span>
          <div className="text-2xl font-mono font-black text-emerald-400">{stats?.authentic_count ?? 0}</div>
        </div>
      </div>

      {/* Recharts Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-slate-100">Global Detection Volume by Date</h3>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends?.trends || []}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="deepfake" name="Deepfakes" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="authentic" name="Authentic" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="suspicious" name="Suspicious" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-4 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-100">Modality Breakdown</h3>
          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trends?.media_distribution || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={5}
                >
                  {(trends?.media_distribution || []).map((_, index) => (
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
    </div>
  );
};

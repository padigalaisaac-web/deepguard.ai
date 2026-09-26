import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  UploadCloud,
  History,
  FileText,
  User,
  ShieldAlert,
  Users,
  Activity,
  HelpCircle,
  Shield
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, isAdmin } = useAuth();

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-gradient-to-r from-cyan-500/20 to-sky-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
    }`;

  const adminNavItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 border border-amber-500/30 shadow-sm'
        : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900/60'
    }`;

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col justify-between border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-xl p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* User Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-md shadow-cyan-500/20">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-sm text-slate-100 truncate block">{user?.name}</span>
              <span className="text-[11px] font-mono text-cyan-400 block">{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div>
          <span className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Forensic Workspace
          </span>
          <nav className="space-y-1">
            <NavLink to="/dashboard" className={navItemClass}>
              <LayoutDashboard className="w-4 h-4 text-cyan-400" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/analyze" className={navItemClass}>
              <UploadCloud className="w-4 h-4 text-cyan-400" />
              <span>Analyze Media</span>
            </NavLink>
            <NavLink to="/history" className={navItemClass}>
              <History className="w-4 h-4 text-cyan-400" />
              <span>Analysis History</span>
            </NavLink>
            <NavLink to="/profile" className={navItemClass}>
              <User className="w-4 h-4 text-cyan-400" />
              <span>User Profile</span>
            </NavLink>
          </nav>
        </div>

        {/* Admin Navigation */}
        {isAdmin && (
          <div>
            <span className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block mb-2 flex items-center gap-1.5">
              <Shield className="w-3 h-3" /> System Administration
            </span>
            <nav className="space-y-1">
              <NavLink to="/admin" end className={adminNavItemClass}>
                <Activity className="w-4 h-4 text-amber-400" />
                <span>Admin Dashboard</span>
              </NavLink>
              <NavLink to="/admin/users" className={adminNavItemClass}>
                <Users className="w-4 h-4 text-amber-400" />
                <span>User Management</span>
              </NavLink>
              <NavLink to="/admin/logs" className={adminNavItemClass}>
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Security Audit Logs</span>
              </NavLink>
            </nav>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800/80">
        <NavLink to="/about" className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-slate-200">
          <HelpCircle className="w-4 h-4" />
          <span>Documentation & Science</span>
        </NavLink>
        <div className="px-3 pt-2 text-[10px] text-slate-400 font-mono">
          Engine: DeepGuard v2.1.0-forensic
        </div>
      </div>
    </aside>
  );
};

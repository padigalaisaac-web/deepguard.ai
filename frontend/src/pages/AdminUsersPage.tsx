import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { AdminUserItem } from '../types';
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Power
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(15);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getUsers({
        page,
        page_size: pageSize,
        search: searchQuery,
      });
      setUsers(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggleStatus = async (user: AdminUserItem) => {
    const action = user.is_active ? 'disable' : 'enable';
    if (confirm(`Are you sure you want to ${action} account for ${user.email}?`)) {
      try {
        await adminService.updateUserStatus(user.id, !user.is_active);
        fetchUsers();
      } catch (err: any) {
        alert(`Status update failed: ${err.message}`);
      }
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/admin" className="text-slate-400 hover:text-slate-200 text-xs">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 flex items-center gap-2">
              <Users className="w-6 h-6 text-amber-400" />
              User Governance & Access Control
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage authenticated investigators, roles, and account access states.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by name or email address..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-500 text-xs text-slate-200 outline-none"
        />
      </form>

      {/* Table */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px] bg-slate-950/40">
                <th className="py-3.5 pl-6">Analyst / Name</th>
                <th className="py-3.5">Email Address</th>
                <th className="py-3.5">Role</th>
                <th className="py-3.5">Analyses Run</th>
                <th className="py-3.5">Account State</th>
                <th className="py-3.5">Registered</th>
                <th className="py-3.5 text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-4 pl-6 font-semibold text-slate-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center font-bold text-xs">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td className="py-4 font-mono text-slate-300">{u.email}</td>
                  <td className="py-4 font-mono text-xs">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                        u.role === 'ADMIN'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 font-mono font-bold text-slate-200">{u.analysis_count}</td>
                  <td className="py-4">
                    {u.is_active ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-rose-400 font-semibold text-[11px]">
                        <XCircle className="w-3.5 h-3.5" /> Disabled
                      </span>
                    )}
                  </td>
                  <td className="py-4 text-slate-400 text-[11px]">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 text-right pr-6">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition border ${
                        u.is_active
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      <span>{u.is_active ? 'Disable' : 'Enable'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import {
  User as UserIcon,
  Mail,
  Lock,
  Shield,
  Key,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Calendar
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState<string>(user?.name || '');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (password && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsUpdating(true);
    try {
      await authService.updateProfile({
        name: name.trim(),
        password: password ? password : undefined,
      });
      await refreshUser();
      setSuccessMsg('Profile updated successfully.');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Profile update failed.');
    } finally {
      setIsUpdating(false);
    }
  };

  const dummyApiKey = `dg_live_sk_${user?.id || 1}_${Math.random().toString(36).substring(2, 15)}98f4e2`;

  const copyApiKey = () => {
    navigator.clipboard.writeText(dummyApiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100">User Profile & Security Settings</h1>
        <p className="text-xs text-slate-400">Manage your analyst account credentials and developer API access.</p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 to-sky-500 text-slate-950 flex items-center justify-center font-black text-2xl mx-auto shadow-xl shadow-cyan-500/20">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-100">{user?.name}</h3>
            <span className="text-xs font-mono text-cyan-400 block">{user?.email}</span>
            <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-mono font-bold text-slate-300">
              <Shield className="w-3 h-3 text-cyan-400" /> {user?.role}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-left text-xs space-y-2 text-slate-400">
            <div className="flex items-center justify-between">
              <span>Account Status:</span>
              <span className="text-emerald-400 font-bold font-mono">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Station ID:</span>
              <span className="font-mono text-slate-300">USR-00{user?.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Member Since:</span>
              <span className="text-slate-300">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '2026'}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form & API Key */}
        <div className="md:col-span-2 space-y-6">
          {/* Edit Profile Form */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-cyan-400" /> Account Information
            </h3>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password (optional)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-slate-100 outline-none"
                />
              </div>

              {password && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-slate-100 outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isUpdating}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition cursor-pointer disabled:opacity-50"
              >
                {isUpdating ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Developer API Key */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" /> Developer & Enterprise API Token
            </h3>
            <p className="text-xs text-slate-400">
              Use this secret bearer token to interact with the DeepGuard AI detection API from automated forensic pipelines.
            </p>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-mono text-xs text-cyan-400 truncate flex-1">{dummyApiKey}</span>
              <button
                onClick={copyApiKey}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition shrink-0"
                title="Copy Token"
              >
                {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

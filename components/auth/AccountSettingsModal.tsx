'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Mail, Lock, ShieldCheck, Save, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface AccountSettingsModalProps {
  user: any;
  onClose: () => void;
  onUpdateSuccess: (updatedUser: any) => void;
}

export function AccountSettingsModal({
  user,
  onClose,
  onUpdateSuccess,
}: AccountSettingsModalProps) {
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim() || !username.trim() || !email.trim()) {
      setError('Full Name, Username, and Email Address are required fields.');
      return;
    }

    if (newPassword.trim() && !currentPassword.trim()) {
      setError('Please enter your current password to authorize password changes.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          email: email.trim(),
          currentPassword: currentPassword.trim() || undefined,
          newPassword: newPassword.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        setSuccess('Profile updated successfully! Refreshing...');
        localStorage.setItem('poke_user', JSON.stringify(data.user));
        onUpdateSuccess(data.user);
        setTimeout(() => {
          window.location.reload();
        }, 600);
      } else {
        setError(data.error || 'Failed to update profile.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-md bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-900 dark:text-gray-100 transition-colors my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-gray-100 dark:border-white/10 mb-4 sm:mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-extrabold text-sm shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                Account Settings
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Update your name, username, email & password
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span>Full Name <span className="text-rose-500 font-bold ml-0.5">*</span></span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-gray-400 outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
              <span>Username <span className="text-rose-500 font-bold ml-0.5">*</span></span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-gray-400 outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              <span>Email Address <span className="text-rose-500 font-bold ml-0.5">*</span></span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dev@poke-app.dev"
              className="w-full bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-gray-400 outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
            />
          </div>

          {/* Password update section */}
          <div className="pt-2 pb-1 border-t border-gray-100 dark:border-white/10">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span>Change Password <span className="text-gray-400 font-normal">(Optional)</span></span>
            </h4>

            {/* Current Password */}
            <div className="mb-3">
              <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password..."
                  className="w-full bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-xl pl-3.5 pr-10 py-2 text-xs text-slate-900 dark:text-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-900 dark:hover:text-white"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password..."
                  className="w-full bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-xl pl-3.5 pr-10 py-2 text-xs text-slate-900 dark:text-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-900 dark:hover:text-white"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-full bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-slate-900 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}


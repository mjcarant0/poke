'use client';

import React, { useState } from 'react';
import { X, LogIn, UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

export function AuthModal({
  initialMode = 'login',
  onClose,
  onAuthSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form Fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Visibility Toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Touched state
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmailValid = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  // Clear errors when user types
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    if (error) setError(null);
  };

  // Validation checks
  const getFieldErrors = () => {
    const errs: Record<string, string> = {};
    if (mode === 'login') {
      if (!emailOrUsername.trim()) errs.emailOrUsername = 'Email or Username is required.';
      if (!password) errs.password = 'Password is required.';
    } else {
      if (!name.trim()) errs.name = 'Full Name is required.';
      if (!username.trim()) errs.username = 'Username is required.';
      if (!email.trim()) {
        errs.email = 'Email address is required.';
      } else if (!isEmailValid(email)) {
        errs.email = 'Please enter a valid email address (e.g. name@domain.com).';
      }
      if (!password) {
        errs.password = 'Password is required.';
      } else if (password.length < 6) {
        errs.password = 'Password must be at least 6 characters.';
      }

      // Confirm password match check
      if (!confirmPassword) {
        errs.confirmPassword = 'Please re-enter your password.';
      } else if (password.trim() !== confirmPassword.trim()) {
        if (touched.confirmPassword || confirmPassword.length >= password.length) {
          errs.confirmPassword = 'Passwords do not match.';
        }
      }
    }
    return errs;
  };

  const fieldErrors = getFieldErrors();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      name: true,
      username: true,
      emailOrUsername: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (mode === 'register' && password.trim() !== confirmPassword.trim()) {
      setError('Passwords do not match. Please verify your passwords.');
      return;
    }

    if (Object.keys(fieldErrors).length > 0) {
      setError('Please fix the highlighted input errors before submitting.');
      return;
    }

    setLoading(true);
    setError(null);

    const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
    const payload =
      mode === 'register'
        ? {
            name: name.trim(),
            username: username.trim(),
            email: email.trim(),
            password: password.trim(),
            confirmPassword: confirmPassword.trim(),
          }
        : { emailOrUsername: emailOrUsername.trim(), password: password.trim() };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        onAuthSuccess(data.user);
        onClose();
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-gray-100 transition-colors">
        {/* Header with Mode Switch Tabs */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10 mb-6">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#161b22] p-1 rounded-full border border-gray-200 dark:border-white/10">
            <button
              onClick={() => {
                setMode('login');
                setError(null);
                setTouched({});
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>

            <button
              onClick={() => {
                setMode('register');
                setError(null);
                setTouched({});
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' ? (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                  Full Name <span className="text-rose-500 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                  onChange={(e) => handleInputChange(setName, e.target.value)}
                  placeholder="e.g. Marcell"
                  className={`w-full bg-white dark:bg-[#161b22] border rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-gray-400 outline-none transition-colors ${
                    touched.name && fieldErrors.name
                      ? 'border-rose-500 focus:border-rose-600 ring-2 ring-rose-500/20'
                      : 'border-gray-200 dark:border-white/10 focus:border-slate-900 dark:focus:border-white'
                  }`}
                />
                {touched.name && fieldErrors.name && (
                  <p className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{fieldErrors.name}</span>
                  </p>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                  Username <span className="text-rose-500 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onBlur={() => setTouched((prev) => ({ ...prev, username: true }))}
                  onChange={(e) => handleInputChange(setUsername, e.target.value)}
                  placeholder="e.g. marcell_dev"
                  className={`w-full bg-white dark:bg-[#161b22] border rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-gray-400 outline-none transition-colors ${
                    touched.username && fieldErrors.username
                      ? 'border-rose-500 focus:border-rose-600 ring-2 ring-rose-500/20'
                      : 'border-gray-200 dark:border-white/10 focus:border-slate-900 dark:focus:border-white'
                  }`}
                />
                {touched.username && fieldErrors.username && (
                  <p className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{fieldErrors.username}</span>
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                  Email Address <span className="text-rose-500 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                  onChange={(e) => handleInputChange(setEmail, e.target.value)}
                  placeholder="dev@poke-app.dev"
                  className={`w-full bg-white dark:bg-[#161b22] border rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-gray-400 outline-none transition-colors ${
                    touched.email && fieldErrors.email
                      ? 'border-rose-500 focus:border-rose-600 ring-2 ring-rose-500/20'
                      : 'border-gray-200 dark:border-white/10 focus:border-slate-900 dark:focus:border-white'
                  }`}
                />
                {touched.email && fieldErrors.email && (
                  <p className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{fieldErrors.email}</span>
                  </p>
                )}
              </div>

              {/* Password with Show/Hide Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                  Password <span className="text-rose-500 font-bold ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                    onChange={(e) => handleInputChange(setPassword, e.target.value)}
                    placeholder="••••••••"
                    className={`w-full bg-white dark:bg-[#161b22] border rounded-xl pl-3.5 pr-10 py-2 text-xs text-slate-900 dark:text-white placeholder-gray-400 outline-none transition-colors ${
                      touched.password && fieldErrors.password
                        ? 'border-rose-500 focus:border-rose-600 ring-2 ring-rose-500/20'
                        : 'border-gray-200 dark:border-white/10 focus:border-slate-900 dark:focus:border-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {touched.password && fieldErrors.password && (
                  <p className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{fieldErrors.password}</span>
                  </p>
                )}
              </div>

              {/* Re-enter Password with Show/Hide Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                  Re-enter Password <span className="text-rose-500 font-bold ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
                    onChange={(e) => handleInputChange(setConfirmPassword, e.target.value)}
                    placeholder="••••••••"
                    className={`w-full bg-white dark:bg-[#161b22] border rounded-xl pl-3.5 pr-10 py-2 text-xs text-slate-900 dark:text-white placeholder-gray-400 outline-none transition-colors ${
                      touched.confirmPassword && fieldErrors.confirmPassword
                        ? 'border-rose-500 focus:border-rose-600 ring-2 ring-rose-500/20'
                        : 'border-gray-200 dark:border-white/10 focus:border-slate-900 dark:focus:border-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {touched.confirmPassword && fieldErrors.confirmPassword && (
                  <p className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{fieldErrors.confirmPassword}</span>
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Email OR Username */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                  Email Address OR Username <span className="text-rose-500 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  value={emailOrUsername}
                  onBlur={() => setTouched((prev) => ({ ...prev, emailOrUsername: true }))}
                  onChange={(e) => handleInputChange(setEmailOrUsername, e.target.value)}
                  placeholder="e.g. marcell_dev or dev@poke-app.dev"
                  className={`w-full bg-white dark:bg-[#161b22] border rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-gray-400 outline-none transition-colors ${
                    touched.emailOrUsername && fieldErrors.emailOrUsername
                      ? 'border-rose-500 focus:border-rose-600 ring-2 ring-rose-500/20'
                      : 'border-gray-200 dark:border-white/10 focus:border-slate-900 dark:focus:border-white'
                  }`}
                />
                {touched.emailOrUsername && fieldErrors.emailOrUsername && (
                  <p className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{fieldErrors.emailOrUsername}</span>
                  </p>
                )}
              </div>

              {/* Password with Show/Hide Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                  Password <span className="text-rose-500 font-bold ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                    onChange={(e) => handleInputChange(setPassword, e.target.value)}
                    placeholder="••••••••"
                    className={`w-full bg-white dark:bg-[#161b22] border rounded-xl pl-3.5 pr-10 py-2 text-xs text-slate-900 dark:text-white placeholder-gray-400 outline-none transition-colors ${
                      touched.password && fieldErrors.password
                        ? 'border-rose-500 focus:border-rose-600 ring-2 ring-rose-500/20'
                        : 'border-gray-200 dark:border-white/10 focus:border-slate-900 dark:focus:border-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {touched.password && fieldErrors.password && (
                  <p className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{fieldErrors.password}</span>
                  </p>
                )}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-full bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-slate-900 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            {mode === 'register' ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Creating Account...' : 'Create Developer Account'}</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Logging In...' : 'Log In'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

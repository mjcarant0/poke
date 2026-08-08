'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, MessageSquareText, SlidersHorizontal, Plus, Sun, Moon, LogOut, User } from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';
import { AccountSettingsModal } from '@/components/auth/AccountSettingsModal';

interface NavbarProps {
  onOpenCreatePostModal?: () => void;
}

function NavbarContent({ onOpenCreatePostModal }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Check current session & theme
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);

    // Initial check from localStorage
    try {
      const stored = localStorage.getItem('poke_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      // Ignore
    }

    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
            localStorage.setItem('poke_user', JSON.stringify(data.user));
          }
        }
      } catch (err) {
        // Silent catch
      }
    }

    checkAuth();

    const handleAuthChange = () => {
      try {
        const stored = localStorage.getItem('poke_user');
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          setUser(null);
        }
      } catch (e) {
        // Ignore
      }
    };

    window.addEventListener('poke_auth_change', handleAuthChange);
    return () => window.removeEventListener('poke_auth_change', handleAuthChange);
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('poke_theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('poke_theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      localStorage.removeItem('poke_user');
      window.dispatchEvent(new Event('poke_auth_change'));
      window.location.reload();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    localStorage.setItem('poke_user', JSON.stringify(userData));
    window.dispatchEvent(new Event('poke_auth_change'));
    window.location.reload();
  };

  const isHomeActive = pathname === '/';
  const isFeedActive = pathname === '/feed' || pathname?.startsWith('/post/');
  const isDashboardActive = pathname?.startsWith('/dashboard');

  return (
    <nav className="w-full bg-white dark:bg-[#090d16] border-b border-gray-200 dark:border-white/10 px-6 py-3.5 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Clean Brand Title & Navigation Links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center group">
            <span className="font-black text-2xl text-slate-900 dark:text-white tracking-tight">
              POKE
            </span>
          </Link>

          {/* Navigation Bar Links */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#161b22] p-1 rounded-full border border-gray-200 dark:border-white/10">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                isHomeActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>

            <Link
              href="/feed"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                isFeedActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageSquareText className="w-3.5 h-3.5" />
              <span>Reviewer Feed</span>
            </Link>

            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                isDashboardActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Developer Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-100 dark:bg-white/10 text-slate-800 dark:text-gray-200 border border-gray-200 dark:border-white/15 hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
            title="Toggle Light / Dark Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* User Auth Section */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-xs font-bold text-slate-900 dark:text-white border border-gray-200 dark:border-white/10 transition-colors cursor-pointer"
                title="Account Settings (Click to Edit)"
              >
                <User className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                <span>@{user.username || user.name}</span>
              </button>

              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-gray-200 text-xs font-bold transition-colors flex items-center gap-1"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAuthModalMode('login')}
                className="px-3.5 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-900 dark:text-white text-xs font-bold transition-all"
              >
                Log In
              </button>

              <button
                onClick={() => setAuthModalMode('register')}
                className="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-slate-900 text-xs font-bold transition-all shadow-sm"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Create Post Button */}
          {onOpenCreatePostModal && (
            <button
              onClick={() => {
                if (!user) {
                  setAuthModalMode('login');
                } else {
                  onOpenCreatePostModal();
                }
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-slate-900 font-extrabold text-xs shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Post</span>
            </button>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      {authModalMode && (
        <AuthModal
          initialMode={authModalMode}
          onClose={() => setAuthModalMode(null)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* Account Settings Modal */}
      {isSettingsModalOpen && user && (
        <AccountSettingsModal
          user={user}
          onClose={() => setIsSettingsModalOpen(false)}
          onUpdateSuccess={(updatedUser) => {
            setUser(updatedUser);
          }}
        />
      )}
    </nav>
  );
}

export function Navbar({ onOpenCreatePostModal }: NavbarProps) {
  return (
    <Suspense fallback={<div className="w-full h-16 bg-white dark:bg-[#090d16] border-b border-gray-200 dark:border-white/10" />}>
      <NavbarContent onOpenCreatePostModal={onOpenCreatePostModal} />
    </Suspense>
  );
}

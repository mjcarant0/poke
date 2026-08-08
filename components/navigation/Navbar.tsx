'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, MessageSquareText, SlidersHorizontal, Plus, Sun, Moon, LogOut, User, Menu, X } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);

    try {
      const stored = localStorage.getItem('poke_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      // Ignore storage read errors
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
        // Ignore auth check errors
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
        // Ignore storage change errors
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
    <nav className="w-full bg-white dark:bg-[#090d16] border-b border-gray-200 dark:border-white/10 px-4 sm:px-6 py-3.5 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand title and desktop navigation */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link href="/" className="flex items-center group">
            <span className="font-black text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight">
              POKE
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 bg-gray-100 dark:bg-[#161b22] p-1 rounded-full border border-gray-200 dark:border-white/10">
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

        {/* Desktop Action Controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-100 dark:bg-white/10 text-slate-800 dark:text-gray-200 border border-gray-200 dark:border-white/15 hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
            title="Toggle Light / Dark Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* User Auth Controls */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-xs font-bold text-slate-900 dark:text-white border border-gray-200 dark:border-white/10 transition-colors cursor-pointer"
                title="Account Settings"
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

        {/* Mobile Navbar Right Controls */}
        <div className="flex md:hidden items-center gap-2">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-100 dark:bg-white/10 text-slate-800 dark:text-gray-200 border border-gray-200 dark:border-white/15"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-full bg-gray-100 dark:bg-white/10 text-slate-900 dark:text-white border border-gray-200 dark:border-white/10"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Overlay Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 w-full bg-white/95 dark:bg-[#090d16]/95 backdrop-blur-md border-b border-gray-200 dark:border-white/10 shadow-2xl p-4 z-50 space-y-3 animate-fadeIn">
          {/* Mobile Nav Links */}
          <div className="flex flex-col gap-1.5">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isHomeActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>

            <Link
              href="/feed"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isFeedActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <MessageSquareText className="w-4 h-4" />
              <span>Reviewer Feed</span>
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isDashboardActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Developer Dashboard</span>
            </Link>
          </div>

          {/* Mobile Auth and Action Section */}
          <div className="pt-2 border-t border-gray-200 dark:border-white/10 flex flex-col gap-2">
            {user ? (
              <>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsSettingsModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-gray-100 dark:bg-white/10 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Account Settings</span>
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">@{user.username || user.name}</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setAuthModalMode('login');
                  }}
                  className="py-2.5 rounded-2xl bg-gray-100 dark:bg-white/10 text-slate-900 dark:text-white text-xs font-bold text-center"
                >
                  Log In
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setAuthModalMode('register');
                  }}
                  className="py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold text-center"
                >
                  Sign Up
                </button>
              </div>
            )}

            {onOpenCreatePostModal && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (!user) {
                    setAuthModalMode('login');
                  } else {
                    onOpenCreatePostModal();
                  }
                }}
                className="w-full py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create Post</span>
              </button>
            )}
          </div>
        </div>
      )}


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


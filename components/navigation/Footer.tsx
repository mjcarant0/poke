'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-[#0d1117] border-t border-gray-200 dark:border-white/10 py-6 transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        {/* Brand Text */}
        <div className="font-extrabold text-slate-900 dark:text-white tracking-tight">
          POKE — QA Review Platform
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-6 font-semibold text-gray-600 dark:text-gray-400">
          <Link
            href="/"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Home
          </Link>
          <Link
            href="/feed"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Reviewer Feed
          </Link>
          <Link
            href="/dashboard"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Developer Dashboard
          </Link>
        </div>
      </div>
    </footer>
  );
}

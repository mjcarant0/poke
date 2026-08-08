'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Plus, LayoutGrid, SlidersHorizontal, Sparkles, ExternalLink } from 'lucide-react';

interface ModeHeaderProps {
  onOpenSubmitModal?: () => void;
}

function HeaderNavigationContent({ onOpenSubmitModal }: ModeHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isDemo = searchParams ? searchParams.get('demo') === 'true' : true;
  const isDeveloperMode = pathname?.startsWith('/dashboard') || pathname === '/';
  const isReviewerMode = pathname?.startsWith('/reviewer');

  const handleToggleDemoMode = () => {
    const targetPath = pathname || '/dashboard';
    if (isDemo) {
      router.push(targetPath);
    } else {
      router.push(`${targetPath}?demo=true`);
    }
  };

  return (
    <header className="w-full bg-[#090d16] border-b border-white/10 px-4 sm:px-6 py-3.5 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Brand and mode switcher */}
        <div className="flex items-center justify-between sm:justify-start gap-4 flex-wrap">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white text-black flex items-center justify-center font-black text-xs sm:text-sm">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg text-white tracking-tight flex items-center gap-1.5">
                Poke
                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/15">
                  v2.0
                </span>
              </span>
            </div>
          </Link>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 bg-[#161b22] p-1 rounded-xl border border-white/10">
            <Link
              href="/dashboard?demo=true"
              className={`flex items-center gap-1 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                isDeveloperMode
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Developer</span>
            </Link>

            <Link
              href="/reviewer?demo=true"
              className={`flex items-center gap-1 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                isReviewerMode
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Reviewer</span>
            </Link>
          </div>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={handleToggleDemoMode}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold border transition-all ${
              isDemo
                ? 'bg-white/15 text-white border-white/30'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isDemo ? 'Demo Active' : 'Demo Data'}</span>
          </button>

          <Link
            href="/p/pulse-analytics"
            target="_blank"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] sm:text-xs font-semibold text-gray-300 transition-colors"
          >
            <span>Roadmap</span>
            <ExternalLink className="w-3 h-3 text-gray-500" />
          </Link>

          {onOpenSubmitModal && (
            <button
              onClick={onOpenSubmitModal}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg bg-white hover:bg-gray-200 text-black font-extrabold text-[11px] sm:text-xs shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Project</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export function ModeHeader(props: ModeHeaderProps) {
  return (
    <Suspense
      fallback={
        <header className="w-full bg-[#090d16] border-b border-white/10 px-4 sm:px-6 py-3.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="font-extrabold text-lg text-white">Poke</span>
          </div>
        </header>
      }
    >
      <HeaderNavigationContent {...props} />
    </Suspense>
  );
}


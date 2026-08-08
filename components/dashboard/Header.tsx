'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Target, Code2, Plus, Globe, ExternalLink, ChevronDown } from 'lucide-react';
import { Project } from '@/types';

interface HeaderProps {
  currentProject: Project;
  onOpenEmbedModal: () => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
}

export function Header({
  currentProject,
  onOpenEmbedModal,
  isDemoMode,
  onToggleDemoMode,
}: HeaderProps) {
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  return (
    <header className="w-full bg-[#090d16] border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & Project Selector */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-black text-sm">
              P
            </div>
            <span className="font-extrabold text-lg text-white tracking-tight">
              Poke
            </span>
          </Link>

          {/* Project Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 transition-colors"
            >
              <span>{currentProject.title}</span>
              <span className="text-[11px] text-gray-500 font-normal">({currentProject.category})</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {showProjectDropdown && (
              <div className="absolute left-0 mt-2 w-56 bg-[#0d1117] rounded-xl p-2 z-50 shadow-2xl border border-white/15">
                <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Active Project
                </div>
                <div className="px-3 py-2 rounded-lg bg-white/10 text-xs font-semibold text-white flex items-center justify-between">
                  <span>{currentProject.title}</span>
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Active</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleDemoMode}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isDemoMode
                ? 'bg-white/15 text-white border-white/30'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            {isDemoMode ? 'Demo Mode Active' : 'Enable Demo Data'}
          </button>

          <Link
            href={`/p/${currentProject.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-gray-400" />
            <span>Public Portal</span>
            <ExternalLink className="w-3 h-3 text-gray-500" />
          </Link>

          <button
            onClick={onOpenEmbedModal}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white hover:bg-gray-200 text-black font-extrabold text-xs transition-all shadow-sm"
          >
            <Code2 className="w-4 h-4" />
            <span>Embed Widget</span>
          </button>
        </div>
      </div>
    </header>
  );
}

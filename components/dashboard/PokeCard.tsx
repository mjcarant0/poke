'use client';

import React from 'react';
import { Feedback, FeedbackStatus } from '@/types';
import { Bug, Lightbulb, MessageSquare, ThumbsUp, ChevronRight, Globe } from 'lucide-react';

interface PokeCardProps {
  poke: Feedback;
  onSelect: (poke: Feedback) => void;
  onStatusChange: (pokeId: string, status: FeedbackStatus) => void;
  onUpvote: (pokeId: string) => void;
}

export function PokeCard({ poke, onSelect, onStatusChange, onUpvote }: PokeCardProps) {
  const getRelativeTime = (dateStr: string | Date) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getStatusStyle = (status: FeedbackStatus) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'REVIEWING':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'IN_PROGRESS':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'FIXED':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'CLOSED':
        return 'bg-gray-500/15 text-gray-400 border-gray-500/30';
      default:
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'BUG':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 shrink-0">
            <Bug className="w-3.5 h-3.5" />
            Bug
          </span>
        );
      case 'FEATURE':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
            <Lightbulb className="w-3.5 h-3.5" />
            Feature
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 shrink-0">
            <MessageSquare className="w-3.5 h-3.5" />
            General
          </span>
        );
    }
  };

  const displayTitle = poke.title || (poke as any).message || 'Poke Item';
  const routePath = poke.pageUrl
    ? new URL(poke.pageUrl, 'https://localhost').pathname
    : '/';

  return (
    <div className="poke-card p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 cursor-pointer group dark:bg-[#0d1117] dark:border-white/10 border border-gray-200">
      {/* Main details */}
      <div className="flex items-start gap-3 flex-1 min-w-0" onClick={() => onSelect(poke)}>
        <div className="mt-0.5">{getTypeBadge(poke.type)}</div>

        <div className="flex-1 min-w-0">
          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors line-clamp-1 mb-0.5">
            {displayTitle}
          </h4>

          {poke.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-1.5 font-normal">
              {poke.description}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-[11px] font-mono text-slate-800 dark:text-gray-300 truncate max-w-[180px]">
              <Globe className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="truncate">{routePath}</span>
            </span>

            {poke.browser && (
              <span className="text-[11px] text-gray-400 font-mono truncate">
                {poke.browser} • {poke.os}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action controls */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-white/5 w-full sm:w-auto justify-between sm:justify-end">
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpvote(poke.id);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-gray-300 transition-colors"
          >
            <ThumbsUp className="w-3.5 h-3.5 text-amber-500" />
            <span>{poke.upvotes || 0}</span>
          </button>

          <div onClick={(e) => e.stopPropagation()}>
            <select
              value={poke.status}
              onChange={(e) => onStatusChange(poke.id, e.target.value as FeedbackStatus)}
              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border outline-none cursor-pointer ${getStatusStyle(
                poke.status
              )}`}
            >
              <option value="NEW" className="bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400">NOT VIEWED</option>
              <option value="REVIEWING" className="bg-white dark:bg-gray-900 text-purple-600 dark:text-purple-400">REVIEWING</option>
              <option value="IN_PROGRESS" className="bg-white dark:bg-gray-900 text-amber-600 dark:text-amber-400">IN_PROGRESS</option>
              <option value="FIXED" className="bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400">FIXED</option>
              <option value="CLOSED" className="bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">CLOSED</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400 font-medium">
            {getRelativeTime(poke.createdAt)}
          </span>

          <button
            onClick={() => onSelect(poke)}
            className="p-1 rounded-md text-gray-400 hover:text-slate-900 dark:hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}


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
      default:
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'BUG':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <Bug className="w-3.5 h-3.5" />
            Bug
          </span>
        );
      case 'FEATURE':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Lightbulb className="w-3.5 h-3.5" />
            Feature
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
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
    <div className="glass-panel glass-panel-hover p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group">
      {/* Main Content */}
      <div className="flex items-start gap-3.5 flex-1 min-w-0" onClick={() => onSelect(poke)}>
        <div className="mt-0.5">{getTypeBadge(poke.type)}</div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1 mb-1">
            {displayTitle}
          </h4>

          {poke.description && (
            <p className="text-xs text-gray-400 line-clamp-1 mb-1.5 font-normal">
              {poke.description}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap text-xs text-gray-400">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 text-[11px] font-mono text-gray-300">
              <Globe className="w-3 h-3 text-gray-500" />
              <span>{routePath}</span>
            </span>

            {poke.browser && (
              <span className="text-[11px] text-gray-500 font-mono">
                {poke.browser} • {poke.os}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 self-end md:self-center shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpvote(poke.id);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 transition-colors"
        >
          <ThumbsUp className="w-3.5 h-3.5 text-amber-400" />
          <span>{poke.upvotes || 0}</span>
        </button>

        <div onClick={(e) => e.stopPropagation()}>
          <select
            value={poke.status}
            onChange={(e) => onStatusChange(poke.id, e.target.value as FeedbackStatus)}
            className={`px-3 py-1 rounded-lg text-xs font-bold border outline-none cursor-pointer ${getStatusStyle(
              poke.status
            )}`}
          >
            <option value="NEW" className="bg-gray-900 text-blue-400">NEW</option>
            <option value="REVIEWING" className="bg-gray-900 text-purple-400">REVIEWING</option>
            <option value="IN_PROGRESS" className="bg-gray-900 text-amber-400">IN_PROGRESS</option>
            <option value="FIXED" className="bg-gray-900 text-emerald-400">FIXED</option>
          </select>
        </div>

        <span className="text-[11px] text-gray-500 font-medium min-w-[55px] text-right">
          {getRelativeTime(poke.createdAt)}
        </span>

        <button
          onClick={() => onSelect(poke)}
          className="p-1 rounded-md text-gray-500 hover:text-white hover:bg-white/5"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { QAComment, FeedbackStatus, QAReply } from '@/types';
import { Monitor, Globe, Clock, ChevronDown, CheckCircle2, AlertCircle, Sparkles, MessageSquare, Reply, CornerDownRight, Send, XCircle, ImageIcon } from 'lucide-react';

interface QACommentThreadProps {
  comments: QAComment[];
  onUpvoteComment?: (commentId: string) => void;
  onStatusChange?: (commentId: string, status: FeedbackStatus) => void;
  isDeveloperView?: boolean;
  developerName?: string;
}

export function QACommentThread({
  comments,
  onStatusChange,
  isDeveloperView = false,
  developerName,
}: QACommentThreadProps) {
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');
  const [replyAuthor, setReplyAuthor] = useState('');
  const [localReplies, setLocalReplies] = useState<Record<string, QAReply[]>>({});
  const [submittingReply, setSubmittingReply] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (comments.length === 0) {
    return (
      <div className="poke-card p-8 sm:p-10 text-center rounded-3xl dark:bg-[#0d1117] dark:border-white/10">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
          No QA reports submitted yet. Be the first reviewer to leave feedback!
        </p>
      </div>
    );
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'BUG':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>Bug Report</span>
          </span>
        );
      case 'FEATURE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Feature Request</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            <span>General Feedback</span>
          </span>
        );
    }
  };

  const getStatusBadge = (status: FeedbackStatus) => {
    switch (status) {
      case 'FIXED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>FIXED</span>
          </span>
        );
      case 'CLOSED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gray-200 text-gray-800 dark:bg-white/20 dark:text-gray-200 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            <span>CLOSED</span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300">
            IN PROGRESS
          </span>
        );
      case 'REVIEWING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300">
            REVIEWING
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300">
            NEW
          </span>
        );
    }
  };

  const handlePostReply = async (commentId: string) => {
    if (!replyInput.trim()) return;

    setSubmittingReply(true);

    const defaultRole = isDeveloperView ? 'DEVELOPER' : 'REVIEWER';
    const defaultName = isDeveloperView
      ? (developerName ? `@${developerName} (Developer)` : 'Developer')
      : (replyAuthor.trim() || 'Reviewer');

    try {
      const res = await fetch(`/api/comments/${commentId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyInput.trim(),
          authorName: defaultName,
          authorRole: defaultRole,
        }),
      });

      if (res.ok) {
        const createdReply = await res.json();
        setLocalReplies((prev) => ({
          ...prev,
          [commentId]: [...(prev[commentId] || []), createdReply],
        }));
        setReplyInput('');
        setActiveReplyId(null);
      }
    } catch (err) {
      // Ignore reply post errors
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const allReplies = [
          ...(comment.replies || []),
          ...(localReplies[comment.id] || []),
        ];

        const screenshotsList = comment.screenshots && comment.screenshots.length > 0
          ? comment.screenshots
          : (comment.screenshotUrl ? [comment.screenshotUrl] : []);

        return (
          <div
            key={comment.id}
            className="poke-card p-4 sm:p-5 rounded-3xl dark:bg-[#0d1117] dark:border-white/10 border border-gray-200 shadow-sm transition-all"
          >
            {/* Header Row */}
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {getTypeBadge(comment.type)}

                {comment.pageTested && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gray-100 dark:bg-white/10 text-slate-800 dark:text-gray-200 truncate max-w-[200px]">
                    Route: {comment.pageTested}
                  </span>
                )}
              </div>

              {/* Status Dropdown or Badge */}
              {isDeveloperView && onStatusChange ? (
                <div className="relative">
                  <select
                    value={comment.status}
                    onChange={(e) => onStatusChange(comment.id, e.target.value as FeedbackStatus)}
                    className="bg-gray-100 dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-full px-3 py-1 text-[11px] font-extrabold text-slate-900 dark:text-white outline-none cursor-pointer pr-6 appearance-none"
                  >
                    <option value="NEW">Status: NEW</option>
                    <option value="REVIEWING">Status: REVIEWING</option>
                    <option value="IN_PROGRESS">Status: IN PROGRESS</option>
                    <option value="FIXED">Status: FIXED</option>
                    <option value="CLOSED">Status: CLOSED</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              ) : (
                getStatusBadge(comment.status)
              )}
            </div>

            {/* QA Notes Content */}
            <p className="text-xs text-slate-900 dark:text-white font-medium leading-relaxed mb-4 whitespace-pre-wrap">
              {comment.qaNotes}
            </p>

            {/* Screenshots Preview */}
            {screenshotsList.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-bold text-gray-500 dark:text-gray-400">
                  <ImageIcon className="w-3 h-3" />
                  <span>Attached Screenshot Proofs ({screenshotsList.length})</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {screenshotsList.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className="flex-shrink-0 w-28 h-16 sm:w-32 sm:h-20 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 hover:scale-105 transition-transform"
                    >
                      <img src={img} alt={`Proof ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Context Bar */}
            <div className="bg-gray-50 dark:bg-[#161b22] p-3 rounded-2xl border border-gray-200/80 dark:border-white/10 text-[10px] text-gray-500 dark:text-gray-400 font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                <div className="flex items-center gap-1 truncate">
                  <Monitor className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{comment.browser || 'Chrome'} · {comment.os || 'Windows'}</span>
                </div>

                <div className="flex items-center gap-1 truncate">
                  <Globe className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="truncate">Res: {comment.screenResolution || '1920x1080'}</span>
                </div>

                <div className="flex items-center gap-1 truncate">
                  <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{comment.timestamp || 'Just now'}</span>
                </div>
              </div>

              {/* Reply Trigger */}
              <button
                onClick={() => {
                  setActiveReplyId(activeReplyId === comment.id ? null : comment.id);
                  setReplyInput('');
                }}
                className="inline-flex items-center gap-1 text-slate-900 dark:text-white font-bold hover:underline self-end sm:self-auto cursor-pointer"
              >
                <Reply className="w-3 h-3" />
                <span>Reply ({allReplies.length})</span>
              </button>
            </div>

            {/* Replies List */}
            {allReplies.length > 0 && (
              <div className="pl-3 border-l-2 border-gray-200 dark:border-white/10 space-y-2 mt-3 mb-3">
                {allReplies.map((r, idx) => (
                  <div
                    key={r.id || idx}
                    className="bg-gray-100/70 dark:bg-[#161b22]/70 p-3 rounded-2xl border border-gray-200/60 dark:border-white/5 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
                        <CornerDownRight className="w-3 h-3 text-gray-400" />
                        {r.authorName}
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                          r.authorRole === 'DEVELOPER'
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'
                        }`}
                      >
                        {r.authorRole}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 font-medium pl-4">
                      {r.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Input Box */}
            {activeReplyId === comment.id && (
              <div className="mt-3 p-3 rounded-2xl bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-white/10 animate-fadeIn">
                {!isDeveloperView && (
                  <input
                    type="text"
                    placeholder="Your Name (e.g. QA Reviewer)"
                    value={replyAuthor}
                    onChange={(e) => setReplyAuthor(e.target.value)}
                    className="w-full bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white mb-2 outline-none"
                  />
                )}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    placeholder={
                      isDeveloperView
                        ? 'Reply to this report as Developer...'
                        : 'Reply to this report...'
                    }
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handlePostReply(comment.id);
                    }}
                    className="flex-1 bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white"
                  />
                  <button
                    onClick={() => handlePostReply(comment.id)}
                    disabled={submittingReply || !replyInput.trim()}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-slate-900 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
            <img src={selectedImage} alt="Enlarged screenshot" className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
            <p className="text-center text-xs font-bold text-gray-300 mt-2">Click anywhere to close preview</p>
          </div>
        </div>
      )}
    </div>
  );
}


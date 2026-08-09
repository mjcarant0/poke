'use client';

import React, { useState } from 'react';
import { QAComment, FeedbackStatus, QAReply, formatDisplayDate } from '@/types';
import { Monitor, Globe, Clock, ChevronDown, CheckCircle2, AlertCircle, Sparkles, MessageSquare, Reply, CornerDownRight, ThumbsUp, XCircle, ImageIcon, Send, RefreshCw } from 'lucide-react';

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

  const [commentUpvotes, setCommentUpvotes] = useState<Record<string, number>>({});
  const [commentHasUpvoted, setCommentHasUpvoted] = useState<Record<string, boolean>>({});
  const [commentUpvoteMsg, setCommentUpvoteMsg] = useState<{ id: string; text: string } | null>(null);

  const handleUpvoteCommentItem = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}/upvote`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setCommentUpvotes((prev) => ({ ...prev, [commentId]: data.upvotes }));
        setCommentHasUpvoted((prev) => ({ ...prev, [commentId]: data.hasUpvoted }));
        setCommentUpvoteMsg({ id: commentId, text: data.hasUpvoted ? 'Liked!' : 'Like removed' });
      } else {
        setCommentUpvoteMsg({ id: commentId, text: data.error || 'Cannot like.' });
      }
    } catch (e) {
      setCommentUpvoteMsg({ id: commentId, text: 'Connection error.' });
    } finally {
      setTimeout(() => setCommentUpvoteMsg(null), 3000);
    }
  };

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
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300">
            NOT VIEWED
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
        const extraReplies = localReplies[comment.id] || [];
        const allReplies = [...(comment.replies || []), ...extraReplies];

        return (
          <div
            key={comment.id}
            className="poke-card p-4 sm:p-5 rounded-3xl dark:bg-[#0d1117] dark:border-white/10 border border-gray-200 shadow-sm"
          >
            {/* Main Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-2 flex-wrap">
                {getTypeBadge(comment.type)}

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Status:</span>
                  {onStatusChange ? (
                    <div onClick={(e) => e.stopPropagation()}>
                      <select
                        value={comment.status}
                        onChange={(e) => onStatusChange(comment.id, e.target.value as FeedbackStatus)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border outline-none cursor-pointer ${
                          comment.status === 'FIXED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30'
                            : comment.status === 'CLOSED'
                            ? 'bg-gray-200 text-gray-800 border-gray-300 dark:bg-white/20 dark:text-gray-200 dark:border-white/30'
                            : comment.status === 'REVIEWING'
                            ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30'
                            : comment.status === 'IN_PROGRESS'
                            ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30'
                            : 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30'
                        }`}
                      >
                        <option value="NEW" className="bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400">NOT VIEWED</option>
                        <option value="REVIEWING" className="bg-white dark:bg-gray-900 text-purple-600 dark:text-purple-400">REVIEWING</option>
                        <option value="IN_PROGRESS" className="bg-white dark:bg-gray-900 text-amber-600 dark:text-amber-400">IN PROGRESS</option>
                        <option value="FIXED" className="bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400">FIXED</option>
                        <option value="CLOSED" className="bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400">CLOSED</option>
                      </select>
                    </div>
                  ) : (
                    getStatusBadge(comment.status)
                  )}
                </div>
              </div>

              {/* Author Attribution */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span>By:</span>
                <strong className="text-slate-900 dark:text-white font-extrabold">
                  {comment.authorName || 'Anonymous'}
                </strong>
              </div>
            </div>

            {/* Comment Body */}
            <div className="text-xs text-slate-800 dark:text-gray-200 leading-relaxed font-medium mb-3 whitespace-pre-line">
              {comment.qaNotes}
            </div>

            {/* Screenshots grid */}
            {comment.screenshots && comment.screenshots.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-1 mb-1.5 text-[11px] font-bold text-gray-500 dark:text-gray-400">
                  <ImageIcon className="w-3 h-3" />
                  <span>Screenshots ({comment.screenshots.length})</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {comment.screenshots.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className="flex-shrink-0 w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 hover:scale-105 transition-transform"
                    >
                      <img src={img} alt={`Proof ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Specs & Metadata */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-white/5 text-[11px] text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-3 flex-wrap">
                {comment.pageTested && (
                  <div className="flex items-center gap-1 truncate text-slate-800 dark:text-gray-200 font-bold">
                    <Globe className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{comment.pageTested}</span>
                  </div>
                )}

                {comment.browser && (
                  <div className="flex items-center gap-1 text-slate-800 dark:text-gray-200 font-bold">
                    <Monitor className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span>{comment.browser} · {comment.os}</span>
                  </div>
                )}

                <div className="flex items-center gap-1 truncate text-slate-800 dark:text-gray-200 font-bold">
                  <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="truncate">
                    {formatDisplayDate(comment.createdAt)}
                    {comment.timestamp ? ` · ${comment.timestamp}` : ''}
                  </span>
                </div>
              </div>

              {/* Upvote & Reply Actions */}
              <div className="flex items-center gap-3 self-end sm:self-auto relative">
                {commentUpvoteMsg?.id === comment.id && (
                  <span className="absolute -top-7 right-0 z-10 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md">
                    {commentUpvoteMsg.text}
                  </span>
                )}

                {(() => {
                  const isUpvoted = commentHasUpvoted[comment.id] !== undefined
                    ? commentHasUpvoted[comment.id]
                    : (comment.hasUpvoted || false);
                  return (
                    <button
                      type="button"
                      onClick={() => handleUpvoteCommentItem(comment.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold transition-all border shadow-sm ${
                        isUpvoted
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white'
                          : 'bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-900 dark:text-white border-gray-200 dark:border-white/10'
                      }`}
                      title={isUpvoted ? 'Remove like' : 'Like QA report (Account required, cannot like own comment)'}
                    >
                      <ThumbsUp className={`w-3 h-3 ${isUpvoted ? 'fill-current' : ''}`} />
                      <span>{commentUpvotes[comment.id] !== undefined ? commentUpvotes[comment.id] : (comment.upvotes || 0)}</span>
                    </button>
                  );
                })()}

                <button
                  onClick={() => {
                    setActiveReplyId(activeReplyId === comment.id ? null : comment.id);
                    setReplyInput('');
                  }}
                  className="inline-flex items-center gap-1 text-slate-900 dark:text-white text-xs font-bold hover:underline cursor-pointer"
                >
                  <Reply className="w-3.5 h-3.5" />
                  <span>Reply ({allReplies.length})</span>
                </button>
              </div>
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
                    {submittingReply ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send</span>
                      </>
                    )}
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


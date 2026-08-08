'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProjectPost, formatDisplayDate } from '@/types';
import { ExternalLink, MessageSquareText, Globe, ImageIcon, ThumbsUp } from 'lucide-react';

interface PostCardProps {
  post: ProjectPost;
  onUpvotePost?: (postId: string) => void;
}

export function PostCard({ post }: PostCardProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [upvotes, setUpvotes] = useState(post.upvotes || 0);
  const [hasUpvoted, setHasUpvoted] = useState(post.hasUpvoted || false);
  const [upvoteMsg, setUpvoteMsg] = useState<string | null>(null);

  const developerName =
    post.author?.name ||
    post.author?.username ||
    (post.authorEmail && post.authorEmail.includes('@')
      ? post.authorEmail.split('@')[0]
      : post.authorEmail || 'Developer');

  const imagesList = post.images || [];

  const handleUpvote = async () => {
    try {
      const res = await fetch(`/api/posts/${post.id}/upvote`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setUpvotes(data.upvotes);
        setHasUpvoted(data.hasUpvoted);
        setUpvoteMsg(data.hasUpvoted ? 'Upvoted!' : 'Upvote removed');
      } else {
        setUpvoteMsg(data.error || 'Cannot upvote.');
      }
    } catch (e) {
      setUpvoteMsg('Connection error.');
    } finally {
      setTimeout(() => setUpvoteMsg(null), 3000);
    }
  };

  return (
    <div className="poke-card p-4 sm:p-5 rounded-3xl dark:bg-[#0d1117] dark:border-white/10 shadow-sm transition-all hover:shadow-md border border-gray-200 relative">
      {upvoteMsg && (
        <div className="absolute top-3 right-4 z-10 px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md transition-all">
          {upvoteMsg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Main Post Details */}
        <div className="flex-1 min-w-0">
          {/* Category Badge & Developer Info */}
          <div className="flex items-center gap-2 mb-2 flex-wrap text-xs">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-900 text-white dark:bg-white dark:text-slate-900 uppercase">
              {post.category}
            </span>

            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5 flex-wrap">
              <span>Posted by <strong className="text-slate-800 dark:text-gray-200">{developerName}</strong></span>
              <span>· {formatDisplayDate(post.createdAt)}</span>
            </span>
          </div>

          {/* Post Title */}
          <Link href={`/post/${post.id}`} className="block group">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight group-hover:underline mb-1">
              {post.title}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4">
            {post.description}
          </p>

          {/* Screenshot thumbnails */}
          {imagesList.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-2 text-[11px] font-bold text-gray-500 dark:text-gray-400">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Project Screenshots ({imagesList.length})</span>
              </div>
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className="flex-shrink-0 w-24 h-16 sm:w-28 sm:h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 hover:scale-105 transition-transform"
                  >
                    <img src={img} alt={`${post.title} screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Links */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={handleUpvote}
              className={`inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-extrabold transition-all border shadow-sm ${
                hasUpvoted
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white'
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-900 dark:text-white border-gray-200 dark:border-white/10'
              }`}
              title={hasUpvoted ? 'Remove upvote' : 'Upvote post (Account required, cannot upvote own post)'}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-current' : ''}`} />
              <span>{upvotes} Upvotes</span>
            </button>

            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-slate-900 text-xs font-extrabold shadow-sm transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Test Live App</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>

            <Link
              href={`/post/${post.id}`}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-900 dark:text-white text-xs font-extrabold transition-colors border border-gray-200 dark:border-white/10"
            >
              <MessageSquareText className="w-3.5 h-3.5" />
              <span>{post.commentsCount || 0} QA Reports & Comments</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
            <img src={selectedImage} alt="Enlarged view" className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
            <p className="text-center text-xs font-bold text-gray-300 mt-2">Click anywhere to close preview</p>
          </div>
        </div>
      )}
    </div>
  );
}


'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProjectPost, QAComment } from '@/types';
import { Navbar } from '@/components/navigation/Navbar';
import { QACommentThread } from '@/components/qa/QACommentThread';
import { QACommentForm } from '@/components/qa/QACommentForm';
import { ArrowLeft } from 'lucide-react';

export default function PublicPortalPage({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<ProjectPost | null>(null);
  const [comments, setComments] = useState<QAComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPortalData() {
      setLoading(true);
      try {
        const postsRes = await fetch('/api/posts');
        if (postsRes.ok) {
          const posts = await postsRes.json();
          const found = posts.find((p: any) => p.id === params.slug || p.title.toLowerCase().replace(/\s+/g, '-') === params.slug);
          if (found) {
            setPost(found);
            const commentsRes = await fetch(`/api/posts/${found.id}/comments`);
            if (commentsRes.ok) {
              const commentsData = await commentsRes.json();
              setComments(Array.isArray(commentsData) ? commentsData : []);
            }
          }
        }
      } catch (err) {
        // Ignore fetch error
      } finally {
        setLoading(false);
      }
    }
    loadPortalData();
  }, [params.slug]);

  const handleUpvoteComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, upvotes: c.upvotes + 1 } : c))
    );
  };

  const handleCommentSubmitted = (newComment: QAComment) => {
    setComments((prev) => [newComment, ...prev]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f4f6] dark:bg-[#090d16] text-slate-900 dark:text-gray-100 flex flex-col transition-colors">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6 text-sm text-gray-500 font-bold">
          Loading project portal...
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#f4f4f6] dark:bg-[#090d16] text-slate-900 dark:text-gray-100 flex flex-col transition-colors">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center">
          <Link
            href="/feed"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Feed</span>
          </Link>
          <div className="poke-card p-8">
            <h2 className="text-lg font-bold">Project Portal Not Found</h2>
            <p className="text-xs text-gray-500 mt-2">The requested web application could not be found.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f6] dark:bg-[#090d16] text-slate-900 dark:text-gray-100 flex flex-col transition-colors">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Link
          href="/feed"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </Link>

        {/* Portal Info Card */}
        <div className="poke-card p-5 sm:p-6 mb-6 sm:mb-8 dark:bg-[#0d1117] dark:border-white/10">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-900 text-white dark:bg-white dark:text-slate-900 uppercase">
            {post.category}
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-2 mb-1">
            {post.title}
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {post.description}
          </p>
        </div>

        <QACommentForm postId={post.id} onCommentSubmitted={handleCommentSubmitted} />

        <div className="mb-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-3">
            Public QA Roadmap & Feedback Thread
          </h3>
          <QACommentThread comments={comments} onUpvoteComment={handleUpvoteComment} />
        </div>
      </main>
    </div>
  );
}


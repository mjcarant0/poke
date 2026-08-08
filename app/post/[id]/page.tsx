'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { ProjectPost, QAComment } from '@/types';
import { MOCK_POSTS, MOCK_QA_COMMENTS } from '@/lib/mock-data';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import { PostCard } from '@/components/feed/PostCard';
import { QACommentForm } from '@/components/qa/QACommentForm';
import { QACommentThread } from '@/components/qa/QACommentThread';
import { ArrowLeft, RefreshCw, Code2 } from 'lucide-react';

function PostDetailPageContent({ postId }: { postId: string }) {
  const [post, setPost] = useState<ProjectPost | null>(null);
  const [comments, setComments] = useState<QAComment[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPostData() {
      setLoading(true);
      try {
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const authData = await meRes.json();
          if (authData.authenticated && authData.user) {
            setCurrentUser(authData.user);
          }
        }

        const postsRes = await fetch('/api/posts');
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          const found = postsData.find((p: any) => p.id === postId);
          if (found) {
            setPost(found);
          } else {
            setPost(MOCK_POSTS.find((p) => p.id === postId) || MOCK_POSTS[0] || null);
          }
        } else {
          setPost(MOCK_POSTS.find((p) => p.id === postId) || MOCK_POSTS[0] || null);
        }

        const commentsRes = await fetch(`/api/posts/${postId}/comments`);
        if (commentsRes.ok) {
          const commentsData = await commentsRes.json();
          setComments(commentsData);
        } else {
          setComments([...MOCK_QA_COMMENTS]);
        }
      } catch (err) {
        setPost(MOCK_POSTS.find((p) => p.id === postId) || MOCK_POSTS[0] || null);
        setComments([...MOCK_QA_COMMENTS]);
      } finally {
        setLoading(false);
      }
    }

    loadPostData();
  }, [postId]);

  const handleCommentSubmitted = (newComment: QAComment) => {
    setComments((prev) => [newComment, ...prev]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f4f6] dark:bg-[#090d16] text-slate-900 dark:text-gray-100 flex items-center justify-center gap-2">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-900 dark:text-white" />
        <span className="text-sm font-semibold">Loading post details...</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#f4f4f6] dark:bg-[#090d16] text-slate-900 dark:text-gray-100 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-extrabold mb-2">Project Post Not Found</h2>
        <p className="text-xs text-gray-500 mb-6">The requested post does not exist or has been deleted.</p>
        <Link
          href="/feed"
          className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold"
        >
          Back to Feed
        </Link>
      </div>
    );
  }

  const isAuthor =
    currentUser &&
    ((post.authorId && post.authorId === currentUser.id) ||
      (post.authorEmail && post.authorEmail.toLowerCase() === currentUser.email?.toLowerCase()) ||
      (post.author?.username && post.author.username.toLowerCase() === currentUser.username?.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#f4f4f6] dark:bg-[#090d16] text-slate-900 dark:text-gray-100 flex flex-col transition-colors overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Back Link */}
        <Link
          href="/feed"
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reviewer Feed</span>
        </Link>

        {/* Post Detail Card */}
        <div className="mb-6 sm:mb-8">
          <PostCard post={post} />
        </div>

        {/* Comment form or developer workspace banner */}
        {isAuthor ? (
          <div className="poke-card p-5 sm:p-6 rounded-3xl mb-8 dark:bg-[#0d1117] dark:border-white/10 flex items-center gap-3 border border-gray-200">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center flex-shrink-0">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white mb-0.5">
                Developer Workspace View
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                You are the author of this post. You can view reviewer reports and reply directly to feedback in the discussion thread below.
              </p>
            </div>
          </div>
        ) : (
          <QACommentForm postId={post.id} onCommentSubmitted={handleCommentSubmitted} />
        )}

        {/* QA Reports Thread Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
            QA Reports & Discussion Thread ({comments.length})
          </h3>
        </div>

        {/* Thread List */}
        <QACommentThread
          comments={comments}
          isDeveloperView={isAuthor}
          developerName={currentUser?.username || currentUser?.name}
        />
      </main>

      {/* Footer Component */}
      <Footer />
    </div>
  );
}

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const postId = params.id || 'post_101';
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f4f4f6] dark:bg-[#090d16] flex items-center justify-center text-slate-900 dark:text-white">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
      }
    >
      <PostDetailPageContent postId={postId} />
    </Suspense>
  );
}


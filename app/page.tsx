'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import { PostCard } from '@/components/feed/PostCard';
import { SubmitProjectModal } from '@/components/developer/SubmitProjectModal';
import { MOCK_POSTS } from '@/lib/mock-data';
import { ProjectPost } from '@/types';
import { ArrowRight, MessageSquareText, SlidersHorizontal } from 'lucide-react';

export default function HomePage() {
  const [posts, setPosts] = useState<ProjectPost[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.length > 0 ? data : [...MOCK_POSTS]);
      } else {
        setPosts([...MOCK_POSTS]);
      }
    } catch (err) {
      setPosts([...MOCK_POSTS]);
    }
  };

  useEffect(() => {
    loadPosts();

    const handleNewPost = () => {
      loadPosts();
    };

    window.addEventListener('poke_post_created', handleNewPost);
    return () => window.removeEventListener('poke_post_created', handleNewPost);
  }, []);

  const handleUpvotePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p))
    );
  };

  const handlePostCreated = () => {
    loadPosts();
  };


  return (
    <div className="min-h-screen bg-[#f4f4f6] dark:bg-[#090d16] text-slate-900 dark:text-gray-100 flex flex-col transition-colors overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar onOpenCreatePostModal={() => setIsCreateModalOpen(true)} />

      {/* Hero Section */}
      <section className="max-w-5xl w-full mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-8 sm:pb-12 text-center">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-4 sm:mb-6">
          The Direct Feedback Platform for Web Applications
        </h1>

        <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed mb-6 sm:mb-8">
          Developers submit project URLs to gather real-user QA inspection reports. Reviewers test web apps and log detailed feedback without friction.
        </p>

        {/* Action button triggers */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto">
          <Link
            href="/feed"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-slate-900 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <MessageSquareText className="w-4 h-4" />
            <span>Explore Reviewer Feed</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-white hover:bg-gray-100 dark:bg-white/10 dark:hover:bg-white/15 text-slate-900 dark:text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border border-gray-200 dark:border-white/10"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Developer Dashboard</span>
          </Link>
        </div>
      </section>

      {/* Submissions Feed Preview */}
      <section className="max-w-5xl w-full mx-auto px-4 sm:px-6 pb-16 sm:pb-20 flex-1">
        <div className="flex items-center justify-between mb-4 sm:mb-6 pb-2 border-b border-gray-200 dark:border-white/10">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Recent Submissions
          </h2>

          <Link
            href="/feed"
            className="text-xs font-extrabold text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="poke-card p-8 sm:p-12 text-center flex flex-col items-center justify-center dark:bg-[#0d1117] rounded-3xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No Projects Submitted Yet</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Be the first developer to submit a project for community review.</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold"
            >
              Create Post
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onUpvotePost={handleUpvotePost} />
            ))}
          </div>
        )}
      </section>

      {/* Footer Component */}
      <Footer />

      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <SubmitProjectModal
          onClose={() => setIsCreateModalOpen(false)}
          onProjectCreated={handlePostCreated}
        />
      )}
    </div>
  );
}


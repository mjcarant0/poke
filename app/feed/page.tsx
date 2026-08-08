'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { ProjectPost, ProjectCategory } from '@/types';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import { PostCard } from '@/components/feed/PostCard';
import { SubmitProjectModal } from '@/components/developer/SubmitProjectModal';
import { Search, RefreshCw, Inbox } from 'lucide-react';

function FeedPageContent() {
  const [posts, setPosts] = useState<ProjectPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setPosts([]);
    } finally {
      setLoading(false);
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

  const handleUpvotePost = async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p))
    );
  };

  const handlePostCreated = () => {
    loadPosts();
  };


  const filteredPosts = posts.filter((p) => {
    if (activeCategory !== 'ALL' && p.category !== activeCategory) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchUrl = p.url.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchUrl) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f4f4f6] dark:bg-[#090d16] text-slate-900 dark:text-gray-100 flex flex-col transition-colors overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar onOpenCreatePostModal={() => setIsCreateModalOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Banner */}
        <div className="poke-card p-5 sm:p-6 rounded-3xl mb-6 sm:mb-8 dark:bg-[#0d1117] dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 shadow-sm">
          <div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Test Web Apps & Leave Structured QA Reports
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xl leading-relaxed">
              Browse submitted projects, test live user flows, and submit QA inspection comments with auto-captured technical metadata.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-full pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-gray-400 outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-extrabold transition-all whitespace-nowrap ${
              activeCategory === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10'
            }`}
          >
            All Categories
          </button>

          {(['SaaS App', 'E-Commerce Web', 'Web Tool & Utility', 'Web Dashboard & Portal', 'Landing & Portfolio', 'Content & Media Web'] as ProjectCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-extrabold transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-white hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Feed Posts */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-slate-900 dark:text-white" />
            <span className="text-xs font-semibold">Loading feed...</span>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="poke-card p-8 sm:p-12 text-center flex flex-col items-center justify-center dark:bg-[#0d1117] rounded-3xl">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-400 mb-3">
              <Inbox className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No Posts Found</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Be the first developer to submit a project for review.</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold"
            >
              Create Post
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onUpvotePost={handleUpvotePost}
              />
            ))}
          </div>
        )}
      </main>

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

export default function FeedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f4f4f6] dark:bg-[#090d16] flex items-center justify-center text-slate-900 dark:text-white">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
      }
    >
      <FeedPageContent />
    </Suspense>
  );
}


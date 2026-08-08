'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { ProjectPost, ProjectCategory } from '@/types';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import { PostCard } from '@/components/feed/PostCard';
import { SubmitProjectModal } from '@/components/developer/SubmitProjectModal';
import { Search, RefreshCw, Inbox, Filter, X, SlidersHorizontal, Tag, Clock, Check, ThumbsUp, MessageSquare } from 'lucide-react';

type SortOption = 'NEWEST' | 'OLDEST' | 'MOST_LIKES' | 'LEAST_LIKES' | 'MOST_REPORTS';

function FeedPageContent() {
  const [posts, setPosts] = useState<ProjectPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | 'ALL'>('ALL');
  const [sortOrder, setSortOrder] = useState<SortOption>('NEWEST');
  const [timeframe, setTimeframe] = useState<'today' | 'yesterday' | 'week' | 'month' | 'all' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

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

    if (timeframe !== 'all') {
      const now = new Date();
      const postDate = new Date(p.createdAt);

      if (timeframe === 'today') {
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (postDate < startOfToday) return false;
      } else if (timeframe === 'yesterday') {
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
        if (postDate < startOfYesterday || postDate >= startOfToday) return false;
      } else if (timeframe === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (postDate < weekAgo) return false;
      } else if (timeframe === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (postDate < monthAgo) return false;
      } else if (timeframe === 'custom' && customStartDate) {
        const startD = new Date(customStartDate);
        const endD = customEndDate ? new Date(`${customEndDate}T23:59:59.999Z`) : new Date();
        if (postDate < startD || postDate > endD) return false;
      }
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchUrl = p.url.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchUrl) return false;
    }
    return true;
  });

  filteredPosts.sort((a, b) => {
    if (sortOrder === 'NEWEST') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortOrder === 'OLDEST') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortOrder === 'MOST_LIKES') {
      return (b.upvotes || 0) - (a.upvotes || 0);
    } else if (sortOrder === 'LEAST_LIKES') {
      return (a.upvotes || 0) - (b.upvotes || 0);
    } else if (sortOrder === 'MOST_REPORTS') {
      return (b.commentsCount || 0) - (a.commentsCount || 0);
    }
    return 0;
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

        {/* Category Pills & Filter Button Bar */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1 min-w-0">
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

          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold transition-all border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161b22] hover:bg-gray-100 dark:hover:bg-white/10 text-slate-900 dark:text-white shadow-sm shrink-0"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Posts</span>
          </button>
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

      {/* Filter Modal Container */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-900 dark:text-gray-100 transition-colors my-auto max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-extrabold text-sm shrink-0">
                  <Filter className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    Filter & Sort Posts
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    Refine project feed by category, likes, and creation date
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Section 1: Categories */}
              <div>
                <label className="block text-xs font-black text-slate-900 dark:text-white mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-gray-400" />
                  <span>Category</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => setActiveCategory('ALL')}
                    className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all border flex items-center justify-between ${
                      activeCategory === 'ALL'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white'
                        : 'bg-gray-50 dark:bg-[#161b22] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-100'
                    }`}
                  >
                    <span>All Categories</span>
                    {activeCategory === 'ALL' && <Check className="w-3 h-3" />}
                  </button>
                  {(['SaaS App', 'E-Commerce Web', 'Web Tool & Utility', 'Web Dashboard & Portal', 'Landing & Portfolio', 'Content & Media Web'] as ProjectCategory[]).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all border flex items-center justify-between ${
                        activeCategory === cat
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white'
                          : 'bg-gray-50 dark:bg-[#161b22] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-100'
                      }`}
                    >
                      <span className="truncate">{cat}</span>
                      {activeCategory === cat && <Check className="w-3 h-3 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 2: Sort Order */}
              <div>
                <label className="block text-xs font-black text-slate-900 dark:text-white mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
                  <span>Sort Order</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { key: 'NEWEST', label: 'Newest First' },
                    { key: 'OLDEST', label: 'Oldest First' },
                    { key: 'MOST_LIKES', label: 'Most Likes' },
                    { key: 'LEAST_LIKES', label: 'Least Likes' },
                    { key: 'MOST_REPORTS', label: 'Most QA Reports' },
                  ].map((so) => (
                    <button
                      key={so.key}
                      onClick={() => setSortOrder(so.key as SortOption)}
                      className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all border flex items-center justify-between ${
                        sortOrder === so.key
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white'
                          : 'bg-gray-50 dark:bg-[#161b22] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-100'
                      }`}
                    >
                      <span className="truncate">{so.label}</span>
                      {sortOrder === so.key && <Check className="w-3 h-3 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 3: Time Range */}
              <div>
                <label className="block text-xs font-black text-slate-900 dark:text-white mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>Time Range</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { key: 'today', label: 'Today' },
                    { key: 'yesterday', label: 'Yesterday' },
                    { key: 'week', label: 'This Week' },
                    { key: 'month', label: 'This Month' },
                    { key: 'all', label: 'All Time' },
                    { key: 'custom', label: 'Custom Date' },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setTimeframe(t.key as any)}
                      className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all border flex items-center justify-between ${
                        timeframe === t.key
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white'
                          : 'bg-gray-50 dark:bg-[#161b22] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-100'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{t.label}</span>
                      </span>
                      {timeframe === t.key && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>

                {timeframe === 'custom' && (
                  <div className="grid grid-cols-2 gap-2 mt-3 p-3 rounded-2xl bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-white/10">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-900 dark:text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">End Date</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-900 dark:text-white outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between pt-5 border-t border-gray-100 dark:border-white/10 mt-6 gap-3">
              <button
                onClick={() => {
                  setActiveCategory('ALL');
                  setSortOrder('NEWEST');
                  setTimeframe('all');
                  setCustomStartDate('');
                  setCustomEndDate('');
                }}
                className="px-4 py-2 rounded-full text-xs font-bold text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Reset Filters
              </button>

              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="px-6 py-2 rounded-full bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-slate-900 text-xs font-black shadow-md transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

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


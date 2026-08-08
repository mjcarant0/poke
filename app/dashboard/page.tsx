'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { QAComment, FeedbackStatus, ProjectPost, FeedbackType } from '@/types';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import { QACommentThread } from '@/components/qa/QACommentThread';
import { SubmitProjectModal } from '@/components/developer/SubmitProjectModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { QALineGraph } from '@/components/dashboard/QALineGraph';
import { Search, Filter, RefreshCw, Plus, Lock, UserPlus, LogIn, Inbox, Bug, Lightbulb, MessageSquare, Clock, X, SlidersHorizontal, Check } from 'lucide-react';

function DeveloperDashboardContent() {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<ProjectPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ProjectPost | null>(null);
  const [comments, setComments] = useState<QAComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);

  const [typeFilter, setTypeFilter] = useState<FeedbackType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'ALL'>('ALL');
  const [timeframe, setTimeframe] = useState<'today' | '24h' | 'week' | 'month' | 'all'>('today');
  const [searchQuery, setSearchQuery] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | null>(null);

  useEffect(() => {
    async function initDashboard() {
      setLoading(true);
      try {
        let currentUser: any = null;
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const authData = await meRes.json();
          if (authData.authenticated && authData.user) {
            currentUser = authData.user;
            setUser(currentUser);
          }
        }

        const postsRes = await fetch('/api/posts');
        if (postsRes.ok) {
          const postsData: ProjectPost[] = await postsRes.json();
          if (currentUser) {
            const userPosts = postsData.filter((p: any) =>
              (p.authorId && p.authorId === currentUser.id) ||
              (p.authorEmail && p.authorEmail.toLowerCase() === currentUser.email?.toLowerCase()) ||
              (p.author?.username && p.author.username.toLowerCase() === currentUser.username?.toLowerCase())
            );
            setPosts(userPosts);
            if (userPosts.length > 0) {
              setSelectedPost(userPosts[0]);
            } else {
              setSelectedPost(null);
            }
          } else {
            setPosts([]);
            setSelectedPost(null);
          }
        }
      } catch (err) {
        // Ignore fetch errors
      } finally {
        setLoading(false);
      }
    }

    initDashboard();
  }, []);

  useEffect(() => {
    const currentPostId = selectedPost?.id;
    if (!currentPostId) {
      setComments([]);
      return;
    }

    async function loadComments() {
      setLoadingComments(true);
      try {
        const res = await fetch(`/api/posts/${currentPostId}/comments?timeframe=${timeframe}`);
        if (res.ok) {
          const commentsData = await res.json();
          setComments(commentsData);
        } else {
          setComments([]);
        }
      } catch (err) {
        setComments([]);
      } finally {
        setLoadingComments(false);
      }
    }

    loadComments();
  }, [selectedPost, timeframe]);

  const handleStatusChange = async (commentId: string, newStatus: FeedbackStatus) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, status: newStatus } : c))
    );

    try {
      await fetch(`/api/pokes/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      // Ignore network patch errors
    }
  };

  const handleUpvoteComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, upvotes: c.upvotes + 1 } : c))
    );
  };

  const handlePostCreated = async () => {
    try {
      const postsRes = await fetch('/api/posts');
      if (postsRes.ok) {
        const postsData: ProjectPost[] = await postsRes.json();
        if (user) {
          const userPosts = postsData.filter((p: any) =>
            (p.authorId && p.authorId === user.id) ||
            (p.authorEmail && p.authorEmail.toLowerCase() === user.email?.toLowerCase()) ||
            (p.author?.username && p.author.username.toLowerCase() === user.username?.toLowerCase())
          );
          setPosts(userPosts);
          if (userPosts.length > 0) {
            setSelectedPost(userPosts[0]);
          }
        }
      }
    } catch (e) {
      // Ignore reload error
    }
  };


  const totalComments = comments.length;
  const bugCount = comments.filter((c) => c.type === 'BUG').length;
  const featureCount = comments.filter((c) => c.type === 'FEATURE').length;
  const generalCount = comments.filter((c) => c.type === 'GENERAL').length;

  const filteredComments = comments.filter((c) => {
    if (typeFilter !== 'ALL' && c.type !== typeFilter) return false;
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchNotes = c.qaNotes.toLowerCase().includes(q);
      const matchPage = c.pageTested?.toLowerCase().includes(q) || false;
      const matchBrowser = c.browser?.toLowerCase().includes(q) || false;
      if (!matchNotes && !matchPage && !matchBrowser) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f4f4f6] dark:bg-[#090d16] text-slate-900 dark:text-gray-100 flex flex-col transition-colors overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar onOpenCreatePostModal={() => setIsCreateModalOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {loading ? (
          <div className="flex items-center justify-center py-32 text-gray-400 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-slate-900 dark:text-white" />
            <span className="text-sm font-semibold">Loading dashboard...</span>
          </div>
        ) : !user ? (
          /* Unauthenticated state prompt */
          <div className="max-w-md mx-auto my-8 sm:my-12 poke-card p-6 sm:p-8 rounded-3xl text-center shadow-lg dark:bg-[#0d1117] dark:border-white/10">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Lock className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mb-2">
              Developer Account Required
            </h2>

            <p className="text-xs text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Please log in or create a developer account to submit your web application for testing and manage incoming QA inspection reports.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setAuthModalMode('login')}
                className="w-full py-2.5 rounded-full bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-slate-900 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In to Developer Dashboard</span>
              </button>

              <button
                onClick={() => setAuthModalMode('register')}
                className="w-full py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-900 dark:text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all border border-gray-200 dark:border-white/10"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create New Developer Account</span>
              </button>
            </div>
          </div>
        ) : (
          /* Developer Dashboard View */
          <>
            {/* Header Bar */}
            <div className="poke-card p-5 sm:p-6 rounded-3xl mb-6 dark:bg-[#0d1117] dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono font-medium">
                    Logged in as @{user.username || user.name}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  QA Inspection Dashboard
                </h1>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {posts.length > 0 && selectedPost && (
                  <select
                    value={selectedPost.id}
                    onChange={(e) => {
                      const found = posts.find((p) => p.id === e.target.value);
                      if (found) setSelectedPost(found);
                    }}
                    className="bg-gray-100 dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-full px-4 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                  >
                    {posts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-slate-900 font-extrabold text-xs shadow-sm transition-all whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Post</span>
                </button>
              </div>
            </div>

            {posts.length === 0 ? (
              <div className="poke-card p-8 sm:p-12 text-center flex flex-col items-center justify-center dark:bg-[#0d1117] rounded-3xl">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-400 mb-3">
                  <Inbox className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                  You Have Not Submitted Any Posts Yet
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 max-w-sm">
                  Click "Create New Post" to share your web application for community QA testing and bug reporting.
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-5 py-2.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-extrabold text-xs flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Your First Post</span>
                </button>
              </div>
            ) : (
              <>
                {/* Activity line graph visualization */}
                <QALineGraph comments={comments} />

                {/* Filter Control Bar */}
                <div className="poke-card p-4 rounded-2xl mb-6 dark:bg-[#0d1117] dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search QA notes or specs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-900 dark:text-white placeholder-gray-400 outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
                    <button
                      onClick={() => setIsFilterModalOpen(true)}
                      className={`inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold transition-all border shadow-sm ${
                        typeFilter !== 'ALL' || statusFilter !== 'ALL' || timeframe !== 'today'
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white'
                          : 'bg-white dark:bg-[#161b22] hover:bg-gray-100 dark:hover:bg-white/10 text-slate-900 dark:text-white border-gray-200 dark:border-white/10'
                      }`}
                    >
                      <Filter className="w-3.5 h-3.5" />
                      <span>Filter Reports</span>
                      {(typeFilter !== 'ALL' || statusFilter !== 'ALL' || timeframe !== 'today') && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                      )}
                    </button>

                    <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
                      showing {filteredComments.length} of {totalComments} reports
                    </span>
                  </div>
                </div>

                {/* Filter Modal Container */}
                {isFilterModalOpen && (
                  <div
                    className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
                    onClick={() => setIsFilterModalOpen(false)}
                  >
                    <div
                      className="poke-card w-full max-w-lg bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Modal Header */}
                      <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10 mb-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-2xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-slate-900 dark:text-white">
                            <SlidersHorizontal className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                              Filter QA Reports
                            </h3>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                              Select report categories, statuses, or time period
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setIsFilterModalOpen(false)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-500 dark:text-gray-300 flex items-center justify-center transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Filter Sections */}
                      <div className="space-y-5">
                        {/* Section 1: Feedback Category */}
                        <div>
                          <label className="block text-xs font-black text-slate-900 dark:text-white mb-2 uppercase tracking-wider">
                            Report Type
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setTypeFilter('ALL')}
                              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-between ${
                                typeFilter === 'ALL'
                                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white'
                                  : 'bg-gray-50 dark:bg-[#161b22] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-100'
                              }`}
                            >
                              <span>All Types ({totalComments})</span>
                              {typeFilter === 'ALL' && <Check className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => setTypeFilter('BUG')}
                              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-between ${
                                typeFilter === 'BUG'
                                  ? 'bg-rose-600 text-white border-rose-600'
                                  : 'bg-gray-50 dark:bg-[#161b22] text-rose-600 dark:text-rose-400 border-gray-200 dark:border-white/10 hover:bg-gray-100'
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                <Bug className="w-3.5 h-3.5" />
                                <span>Bugs ({bugCount})</span>
                              </span>
                              {typeFilter === 'BUG' && <Check className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => setTypeFilter('FEATURE')}
                              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-between ${
                                typeFilter === 'FEATURE'
                                  ? 'bg-amber-600 text-white border-amber-600'
                                  : 'bg-gray-50 dark:bg-[#161b22] text-amber-600 dark:text-amber-400 border-gray-200 dark:border-white/10 hover:bg-gray-100'
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                <Lightbulb className="w-3.5 h-3.5" />
                                <span>Features ({featureCount})</span>
                              </span>
                              {typeFilter === 'FEATURE' && <Check className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => setTypeFilter('GENERAL')}
                              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-between ${
                                typeFilter === 'GENERAL'
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-gray-50 dark:bg-[#161b22] text-blue-600 dark:text-blue-400 border-gray-200 dark:border-white/10 hover:bg-gray-100'
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>General ({generalCount})</span>
                              </span>
                              {typeFilter === 'GENERAL' && <Check className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Section 2: Resolution Status */}
                        <div>
                          <label className="block text-xs font-black text-slate-900 dark:text-white mb-2 uppercase tracking-wider">
                            Resolution Status
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {(['ALL', 'NEW', 'REVIEWING', 'IN_PROGRESS', 'FIXED', 'CLOSED'] as const).map((st) => (
                              <button
                                key={st}
                                onClick={() => setStatusFilter(st)}
                                className={`px-2.5 py-2 rounded-xl text-xs font-extrabold transition-all border text-center ${
                                  statusFilter === st
                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white'
                                    : 'bg-gray-50 dark:bg-[#161b22] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-100'
                                }`}
                              >
                                {st === 'ALL' ? 'All Statuses' : st === 'NEW' ? 'NOT VIEWED' : st.replace('_', ' ')}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Section 3: Time Range */}
                        <div>
                          <label className="block text-xs font-black text-slate-900 dark:text-white mb-2 uppercase tracking-wider">
                            Time Range
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {[
                              { key: 'today', label: 'Fresh (Today)' },
                              { key: '24h', label: 'Past 24 Hours' },
                              { key: 'week', label: 'This Week' },
                              { key: 'month', label: 'This Month' },
                              { key: 'all', label: 'All Time' },
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
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{t.label}</span>
                                </span>
                                {timeframe === t.key && <Check className="w-3 h-3" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Modal Footer Actions */}
                      <div className="flex items-center justify-between pt-5 border-t border-gray-100 dark:border-white/10 mt-6 gap-3">
                        <button
                          onClick={() => {
                            setTypeFilter('ALL');
                            setStatusFilter('ALL');
                            setTimeframe('today');
                          }}
                          className="px-4 py-2 rounded-full text-xs font-bold text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          Reset Filters
                        </button>

                        <button
                          onClick={() => setIsFilterModalOpen(false)}
                          className="px-6 py-2 rounded-full bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-slate-900 text-xs font-black shadow-md transition-all"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Thread Feed */}
                {loadingComments ? (
                  <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-slate-900 dark:text-white" />
                    <span className="text-xs font-semibold">Loading QA inspection reports...</span>
                  </div>
                ) : (
                  <QACommentThread
                    comments={filteredComments}
                    onUpvoteComment={handleUpvoteComment}
                    onStatusChange={handleStatusChange}
                    isDeveloperView={true}
                    developerName={user?.username || user?.name}
                  />
                )}
              </>
            )}
          </>
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

      {/* Auth Modal */}
      {authModalMode && (
        <AuthModal
          initialMode={authModalMode}
          onClose={() => setAuthModalMode(null)}
          onAuthSuccess={(userData) => {
            setUser(userData);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f4f4f6] dark:bg-[#090d16] flex items-center justify-center text-slate-900 dark:text-white">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
      }
    >
      <DeveloperDashboardContent />
    </Suspense>
  );
}


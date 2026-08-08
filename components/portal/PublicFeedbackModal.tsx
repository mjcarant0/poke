'use client';

import React, { useState } from 'react';
import { X, Send, Bug, Lightbulb, MessageSquare } from 'lucide-react';
import { FeedbackType } from '@/types';

interface PublicFeedbackModalProps {
  slug: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export function PublicFeedbackModal({
  slug,
  onClose,
  onSubmitted,
}: PublicFeedbackModalProps) {
  const [type, setType] = useState<FeedbackType>('FEATURE');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg('Please enter your feedback message');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/v1/poke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: 'proj_demo_poke',
          type,
          message,
          userEmail: email || null,
          pageUrl: typeof window !== 'undefined' ? window.location.href : '',
          browser: 'Web Browser',
          os: 'Web',
          deviceType: 'Desktop',
        }),
      });

      if (res.ok) {
        onSubmitted();
        onClose();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to send feedback.');
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-3xl p-4 sm:p-6 text-slate-900 shadow-2xl relative animate-fadeIn my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-gray-100 mb-4 sm:mb-5">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900">Post Public Suggestion</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-slate-700 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch gap-1.5 p-1 bg-gray-100 rounded-2xl sm:rounded-full">
            <button
              type="button"
              onClick={() => setType('FEATURE')}
              className={`flex-1 py-1.5 rounded-xl sm:rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                type === 'FEATURE' ? 'bg-slate-900 text-white' : 'text-gray-600 hover:text-slate-900'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              Idea
            </button>
            <button
              type="button"
              onClick={() => setType('BUG')}
              className={`flex-1 py-1.5 rounded-xl sm:rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                type === 'BUG' ? 'bg-slate-900 text-white' : 'text-gray-600 hover:text-slate-900'
              }`}
            >
              <Bug className="w-3.5 h-3.5" />
              Bug
            </button>
            <button
              type="button"
              onClick={() => setType('GENERAL')}
              className={`flex-1 py-1.5 rounded-xl sm:rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                type === 'GENERAL' ? 'bg-slate-900 text-white' : 'text-gray-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Feedback
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Description
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What feature or improvement would make your experience better?"
              className="w-full bg-white border border-gray-200 rounded-2xl p-3 text-xs text-slate-900 placeholder-gray-400 outline-none focus:border-slate-900 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Your Email (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-gray-400 outline-none focus:border-slate-900 transition-colors"
            />
          </div>

          {errorMsg && (
            <p className="text-xs font-semibold text-rose-600">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-full bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting...' : 'Post Suggestion'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}


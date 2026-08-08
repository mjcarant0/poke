'use client';

import React, { useState } from 'react';
import { X, ExternalLink, Send, Bug, Lightbulb, MessageSquare, Globe, Shield } from 'lucide-react';
import { Project, FeedbackType } from '@/types';
import { parseUserAgent } from '@/lib/user-agent';

interface ProjectReviewModalProps {
  project: Project | null;
  onClose: () => void;
  onPokeSubmitted: () => void;
}

export function ProjectReviewModal({
  project,
  onClose,
  onPokeSubmitted,
}: ProjectReviewModalProps) {
  if (!project) return null;

  const [type, setType] = useState<FeedbackType>('BUG');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; error: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setStatusMsg({ text: 'Please provide a title and detailed description.', error: true });
      return;
    }

    setSubmitting(true);
    setStatusMsg(null);

    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const parsedUA = parseUserAgent(ua);
    const screenRes = typeof window !== 'undefined' ? `${window.screen.width} x ${window.screen.height}` : '1920 x 1080';
    const referrer = typeof document !== 'undefined' ? document.referrer : '';

    const payload = {
      projectId: project.id,
      type,
      title,
      description,
      screenshotUrl: screenshotUrl || undefined,
      userEmail: userEmail || undefined,
      pageUrl: project.url,
      browser: parsedUA.browser,
      os: parsedUA.os,
      deviceType: parsedUA.deviceType,
      screenResolution: screenRes,
      referrer,
    };

    try {
      const res = await fetch('/api/v1/poke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatusMsg({ text: 'Poke submitted successfully!', error: false });
        setTitle('');
        setDescription('');
        setScreenshotUrl('');
        onPokeSubmitted();
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        const data = await res.json();
        setStatusMsg({ text: data.error || 'Failed to submit poke.', error: true });
      }
    } catch (err) {
      setStatusMsg({ text: 'Network error. Please try again.', error: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#0d1117] border border-white/10 rounded-3xl p-4 sm:p-6 text-gray-100 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 mb-4 sm:mb-5">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-gray-300 border border-white/15 uppercase">
                {project.category}
              </span>
              <span className="text-xs text-gray-500 font-mono truncate">By {project.ownerEmail}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white truncate">{project.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project Details */}
        <div className="glass-panel p-4 rounded-xl mb-6">
          <p className="text-xs text-gray-300 leading-relaxed mb-3">
            {project.description}
          </p>

          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-extrabold text-xs shadow-sm hover:bg-gray-200 transition-all"
          >
            <Globe className="w-4 h-4" />
            <span>Open & Test Live Application</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-sm font-extrabold text-white">
            Submit a Poke (Structured Review)
          </h3>

          {/* Classification tabs */}
          <div className="flex flex-col sm:flex-row items-stretch gap-1.5 p-1 bg-[#161b22] border border-white/10 rounded-2xl sm:rounded-xl">
            <button
              type="button"
              onClick={() => setType('BUG')}
              className={`flex-1 py-2 rounded-xl sm:rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                type === 'BUG' ? 'bg-rose-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Bug className="w-3.5 h-3.5" />
              Bug Report
            </button>
            <button
              type="button"
              onClick={() => setType('FEATURE')}
              className={`flex-1 py-2 rounded-xl sm:rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                type === 'FEATURE' ? 'bg-amber-500 text-black font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              Feature Idea
            </button>
            <button
              type="button"
              onClick={() => setType('GENERAL')}
              className={`flex-1 py-2 rounded-xl sm:rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                type === 'GENERAL' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              General Feedback
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              Title / Summary
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Navigation dropdown gets cut off on mobile resolution"
              className="w-full bg-[#161b22] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none focus:border-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              Detailed Description
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact steps to reproduce or details on your suggestion..."
              className="w-full bg-[#161b22] border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-gray-500 outline-none focus:border-white transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                Screenshot URL (Optional)
              </label>
              <input
                type="url"
                value={screenshotUrl}
                onChange={(e) => setScreenshotUrl(e.target.value)}
                placeholder="https://imgur.com/example.png"
                className="w-full bg-[#161b22] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                Your Email (Optional)
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="reviewer@community.dev"
                className="w-full bg-[#161b22] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-white transition-colors"
              />
            </div>
          </div>

          {/* Technical Specs Callout */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-400 gap-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Shield className="w-3.5 h-3.5 text-gray-400" />
              Auto Technical Specs Attached
            </span>
            <span className="font-mono text-gray-300">
              Browser • OS • Screen Res • URL
            </span>
          </div>

          {statusMsg && (
            <p className={`text-xs font-bold ${statusMsg.error ? 'text-rose-400' : 'text-emerald-400'}`}>
              {statusMsg.text}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-full bg-white hover:bg-gray-200 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Sending Poke...' : 'Submit Poke Feedback'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}


'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Globe, Tag, Mail, FileText, Send, AlertCircle, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { ProjectCategory } from '@/types';

interface SubmitProjectModalProps {
  onClose: () => void;
  onProjectCreated: (newProject: any) => void;
}

export function SubmitProjectModal({
  onClose,
  onProjectCreated,
}: SubmitProjectModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('SaaS App');
  const [ownerEmail, setOwnerEmail] = useState('developer@poke-app.dev');
  const [images, setImages] = useState<string[]>([]);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('poke_user');
      if (stored) {
        const user = JSON.parse(stored);
        if (user && user.email) {
          setOwnerEmail(user.email);
        }
      }
    } catch (e) {
      // Ignore read errors
    }

    async function fetchMe() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user && data.user.email) {
            setOwnerEmail(data.user.email);
          }
        }
      } catch (err) {
        // Ignore auth fetch errors
      }
    }

    fetchMe();
  }, []);

  const isEmailValid = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const isUrlValid = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return false;
    const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(:\d+)?(\/.*)?$/i;
    const localhostPattern = /^(https?:\/\/)?localhost(:\d+)?(\/.*)?$/i;
    return urlPattern.test(trimmed) || localhostPattern.test(trimmed);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 5 - images.length;
    if (remainingSlots <= 0) return;

    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const getFieldErrors = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Project title is required.';
    if (!description.trim()) errs.description = 'Testing description is required.';
    if (!url.trim()) {
      errs.url = 'Website URL is required.';
    } else if (!isUrlValid(url)) {
      errs.url = 'Please enter a valid website URL (e.g. https://my-app.com or my-app.com).';
    }
    if (!ownerEmail.trim()) {
      errs.ownerEmail = 'Owner email address is required.';
    } else if (!isEmailValid(ownerEmail)) {
      errs.ownerEmail = 'Please enter a valid email format (e.g. dev@domain.com).';
    }
    return errs;
  };


  const fieldErrors = getFieldErrors();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ title: true, description: true, url: true, ownerEmail: true });

    if (Object.keys(fieldErrors).length > 0) {
      setError('Please fix the highlighted input errors before submitting.');
      return;
    }

    setLoading(true);
    setError(null);

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const payload = {
      title,
      description,
      url: formattedUrl,
      category,
      authorEmail: ownerEmail,
      ownerEmail,
      images,
    };


    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const createdData = await res.json();
        onProjectCreated(createdData);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('poke_post_created', { detail: createdData }));
        }
        onClose();
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to submit project');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-900 dark:text-gray-100 transition-colors my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-gray-100 dark:border-white/10 mb-4 sm:mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-extrabold text-sm shrink-0">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                Submit New Project
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                List your application for reviewer feedback & bug reports
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-gray-400" />
              <span>Project Title <span className="text-rose-500 font-bold ml-0.5">*</span></span>
            </label>
            <input
              type="text"
              value={title}
              onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Pulse Analytics"
              className={`w-full bg-white dark:bg-[#161b22] border rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-gray-400 outline-none transition-colors ${
                touched.title && fieldErrors.title
                  ? 'border-rose-500 focus:border-rose-600 ring-2 ring-rose-500/20'
                  : 'border-gray-200 dark:border-white/10 focus:border-slate-900 dark:focus:border-white'
              }`}
            />
            {touched.title && fieldErrors.title && (
              <p className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{fieldErrors.title}</span>
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
              Description & Testing Instructions <span className="text-rose-500 font-bold ml-0.5">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onBlur={() => setTouched((prev) => ({ ...prev, description: true }))}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what your project does and what specific features reviewers should test..."
              className={`w-full bg-white dark:bg-[#161b22] border rounded-2xl p-3 text-xs text-slate-900 dark:text-white placeholder-gray-400 outline-none transition-colors ${
                touched.description && fieldErrors.description
                  ? 'border-rose-500 focus:border-rose-600 ring-2 ring-rose-500/20'
                  : 'border-gray-200 dark:border-white/10 focus:border-slate-900 dark:focus:border-white'
              }`}
            />
            {touched.description && fieldErrors.description && (
              <p className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{fieldErrors.description}</span>
              </p>
            )}
          </div>

          {/* Screenshots attachment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
              <span>Website Screenshots / Images <span className="text-gray-400 font-normal">(Optional, {images.length}/5)</span></span>
            </label>

            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5">
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {images.length < 5 && (
              <label className="flex items-center justify-center gap-2 p-3 rounded-2xl border border-dashed border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-[#161b22] hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors text-xs font-bold text-gray-600 dark:text-gray-400">
                <Upload className="w-4 h-4" />
                <span>Upload Website Image (PNG, JPG, max 5MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Website URL & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-gray-400" />
                <span>Website URL <span className="text-rose-500 font-bold ml-0.5">*</span></span>
              </label>
              <input
                type="text"
                value={url}
                onBlur={() => setTouched((prev) => ({ ...prev, url: true }))}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://my-app.io"
                className={`w-full bg-white dark:bg-[#161b22] border rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-gray-400 outline-none transition-colors ${
                  touched.url && fieldErrors.url
                    ? 'border-rose-500 focus:border-rose-600 ring-2 ring-rose-500/20'
                    : 'border-gray-200 dark:border-white/10 focus:border-slate-900 dark:focus:border-white'
                }`}
              />
              {touched.url && fieldErrors.url && (
                <p className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{fieldErrors.url}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-gray-400" />
                <span>Category</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                className="w-full bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none cursor-pointer font-bold"
              >
                <option value="SaaS App">SaaS App</option>
                <option value="E-Commerce Web">E-Commerce Web</option>
                <option value="Web Tool & Utility">Web Tool & Utility</option>
                <option value="Web Dashboard & Portal">Web Dashboard & Portal</option>
                <option value="Landing & Portfolio">Landing & Portfolio</option>
                <option value="Content & Media Web">Content & Media Web</option>
              </select>
            </div>
          </div>

          {/* Owner Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              <span>Owner Email <span className="text-rose-500 font-bold ml-0.5">*</span></span>
            </label>
            <input
              type="email"
              value={ownerEmail}
              onBlur={() => setTouched((prev) => ({ ...prev, ownerEmail: true }))}
              onChange={(e) => setOwnerEmail(e.target.value)}
              placeholder="developer@poke-app.dev"
              className={`w-full bg-white dark:bg-[#161b22] border rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-gray-400 outline-none transition-colors ${
                touched.ownerEmail && fieldErrors.ownerEmail
                  ? 'border-rose-500 focus:border-rose-600 ring-2 ring-rose-500/20'
                  : 'border-gray-200 dark:border-white/10 focus:border-slate-900 dark:focus:border-white'
              }`}
            />
            {touched.ownerEmail && fieldErrors.ownerEmail && (
              <p className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{fieldErrors.ownerEmail}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-full bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-slate-900 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Submitting Project...' : 'Submit Project for Review'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}


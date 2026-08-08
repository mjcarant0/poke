'use client';

import React, { useState, useEffect } from 'react';
import { QAComment, FeedbackType } from '@/types';
import { autoCaptureBrowserSpecs } from '@/lib/user-agent';
import { Send, Upload, AlertCircle, Image as ImageIcon, Trash2 } from 'lucide-react';

interface QACommentFormProps {
  postId: string;
  onCommentSubmitted: (comment: QAComment) => void;
}

export function QACommentForm({
  postId,
  onCommentSubmitted,
}: QACommentFormProps) {
  const [type, setType] = useState<FeedbackType>('BUG');
  const [targetElement, setTargetElement] = useState('');
  const [qaNotes, setQaNotes] = useState('');
  const [pageTested, setPageTested] = useState('');
  const [country, setCountry] = useState('United States');

  const [specs, setSpecs] = useState<{
    browser: string;
    os: string;
    deviceType: string;
    screenResolution: string;
    timestamp: string;
    referrer: string;
  }>({
    browser: '',
    os: '',
    deviceType: '',
    screenResolution: '',
    timestamp: '',
    referrer: '',
  });

  const [errors, setErrors] = useState<{
    notes?: string;
    pageTested?: string;
    targetElement?: string;
    file?: string;
    submit?: string;
  }>({});
  const [touched, setTouched] = useState<{
    notes?: boolean;
    pageTested?: boolean;
    targetElement?: boolean;
    file?: boolean;
  }>({});

  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const captured = autoCaptureBrowserSpecs();
    if (captured.country) {
      setCountry(captured.country);
    }
    setSpecs({
      browser: captured.browser,
      os: captured.os,
      deviceType: captured.deviceType,
      screenResolution: captured.screenResolution,
      timestamp: captured.timestamp,
      referrer: captured.referrer,
    });
  }, []);

  const handleMultipleFilesChange = (filesList: FileList | null) => {
    setErrors((prev) => ({ ...prev, file: undefined }));
    if (!filesList || filesList.length === 0) return;

    const remainingSlots = 5 - screenshots.length;
    if (remainingSlots <= 0) return;

    const filesToProcess = Array.from(filesList).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, file: 'Some files exceed the 5MB limit and were skipped.' }));
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, file: 'Invalid format. Upload PNG, JPG, or WEBP.' }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setScreenshots((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors: { notes?: string; pageTested?: string; targetElement?: string; file?: string } = {};

    if (!qaNotes.trim()) {
      newErrors.notes = 'Detailed QA inspection notes are required.';
    }

    if (type === 'BUG') {
      if (!pageTested.trim()) {
        newErrors.pageTested = 'Page Tested Route is required for Bug Reports (e.g. /checkout).';
      }
      if (!targetElement.trim()) {
        newErrors.targetElement = 'Specific target element or button area is required for Bug Reports.';
      }
      if (screenshots.length === 0) {
        newErrors.file = 'At least 1 screenshot image proof is required for bug reports.';
      }
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ notes: true, pageTested: true, targetElement: true, file: true });

    if (!validate()) {
      return;
    }

    setLoading(true);
    setErrors({});

    const finalNotes = targetElement.trim()
      ? `[Target Element: ${targetElement.trim()}]\n${qaNotes.trim()}`
      : qaNotes.trim();

    const payload = {
      postId,
      type,
      notes: finalNotes,
      country,
      pageTested: pageTested.trim() || undefined,
      screenshotUrl: screenshots[0] || null,
      screenshots,
      browser: specs.browser,
      os: specs.os,
      deviceType: specs.deviceType,
      screenResolution: specs.screenResolution,
      referrer: specs.referrer,
      timestamp: specs.timestamp,
    };

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const createdComment = await res.json();
        onCommentSubmitted(createdComment);

        setTargetElement('');
        setQaNotes('');
        setPageTested('');
        setScreenshots([]);
        setTouched({});
        setErrors({});
      } else {
        const errorData = await res.json();
        setErrors({ submit: errorData.error || 'Failed to submit QA inspection report.' });
      }
    } catch (err) {
      setErrors({ submit: 'Network connection error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="poke-card p-4 sm:p-6 rounded-3xl mb-8 dark:bg-[#0d1117] dark:border-white/10 shadow-sm border border-gray-200">
      <div className="mb-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
          Leave QA Inspection Report
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          No account required. Submit structured QA feedback directly to developers.
        </p>
      </div>

      {errors.submit && (
        <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errors.submit}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Feedback type classification */}
        <div>
          <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
            Feedback Type Classification
          </label>
          <div className="flex flex-col sm:flex-row gap-2 bg-gray-100 dark:bg-[#161b22] p-1 rounded-2xl border border-gray-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setType('BUG')}
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all text-center ${
                type === 'BUG'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Bug Report
            </button>
            <button
              type="button"
              onClick={() => setType('FEATURE')}
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all text-center ${
                type === 'FEATURE'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Feature Request
            </button>
            <button
              type="button"
              onClick={() => setType('GENERAL')}
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all text-center ${
                type === 'GENERAL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              General Feedback
            </button>
          </div>
        </div>

        {/* Page route and element target */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 flex items-center justify-between">
              <span>Page Tested Route {type === 'BUG' ? <span className="text-rose-500 font-bold ml-0.5">*</span> : <span className="text-gray-400 font-normal">(Optional)</span>}</span>
              {type === 'BUG' && <span className="text-[10px] text-rose-500 font-extrabold">Required</span>}
            </label>
            <input
              type="text"
              value={pageTested}
              onBlur={() => setTouched((prev) => ({ ...prev, pageTested: true }))}
              onChange={(e) => setPageTested(e.target.value)}
              placeholder="e.g. /checkout"
              className={`w-full bg-white dark:bg-[#161b22] border rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-gray-400 outline-none transition-colors ${
                touched.pageTested && errors.pageTested
                  ? 'border-rose-500 ring-2 ring-rose-500/20'
                  : 'border-gray-200 dark:border-white/10 focus:border-slate-900 dark:focus:border-white'
              }`}
            />
            {touched.pageTested && errors.pageTested && (
              <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.pageTested}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 flex items-center justify-between">
              <span>Specific Element / Button Area {type === 'BUG' ? <span className="text-rose-500 font-bold ml-0.5">*</span> : <span className="text-gray-400 font-normal">(Optional)</span>}</span>
              {type === 'BUG' && <span className="text-[10px] text-rose-500 font-extrabold">Required</span>}
            </label>
            <input
              type="text"
              value={targetElement}
              onBlur={() => setTouched((prev) => ({ ...prev, targetElement: true }))}
              onChange={(e) => setTargetElement(e.target.value)}
              placeholder='e.g. Navbar Login Button'
              className={`w-full bg-white dark:bg-[#161b22] border rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-gray-400 outline-none transition-colors ${
                touched.targetElement && errors.targetElement
                  ? 'border-rose-500 ring-2 ring-rose-500/20'
                  : 'border-gray-200 dark:border-white/10 focus:border-slate-900 dark:focus:border-white'
              }`}
            />
            {touched.targetElement && errors.targetElement && (
              <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.targetElement}</p>
            )}
          </div>
        </div>

        {/* Country Selection */}
        <div>
          <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
            Reviewer Country / Location
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none cursor-pointer font-bold"
          >
            <option value="United States">🇺🇸 United States</option>
            <option value="Philippines">🇵🇭 Philippines</option>
            <option value="Germany">🇩🇪 Germany</option>
            <option value="United Kingdom">🇬🇧 United Kingdom</option>
            <option value="Canada">🇨🇦 Canada</option>
            <option value="Australia">🇦🇺 Australia</option>
            <option value="Japan">🇯🇵 Japan</option>
            <option value="India">🇮🇳 India</option>
            <option value="Singapore">🇸🇬 Singapore</option>
            <option value="France">🇫🇷 France</option>
            <option value="Brazil">🇧🇷 Brazil</option>
            <option value="Global / Remote">🌐 Global / Remote</option>
          </select>
        </div>

        {/* Detailed Inspection Notes */}
        <div>
          <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
            Detailed QA Inspection Notes & Reproduction Steps <span className="text-rose-500 font-bold ml-0.5">*</span>
          </label>
          <textarea
            rows={3}
            value={qaNotes}
            onBlur={() => setTouched((prev) => ({ ...prev, notes: true }))}
            onChange={(e) => setQaNotes(e.target.value)}
            placeholder="Describe exact issue, step-by-step reproduction steps, expected result vs actual result..."
            className={`w-full bg-white dark:bg-[#161b22] border rounded-2xl p-3 text-xs text-slate-900 dark:text-white placeholder-gray-400 outline-none transition-colors ${
              touched.notes && errors.notes
                ? 'border-rose-500 ring-2 ring-rose-500/20'
                : 'border-gray-200 dark:border-white/10 focus:border-slate-900 dark:focus:border-white'
            }`}
          />
          {touched.notes && errors.notes && (
            <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.notes}</p>
          )}
        </div>

        {/* Screenshots Upload */}
        <div>
          <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
              <span>
                Screenshot Proof Attachments {type === 'BUG' ? <span className="text-rose-500 font-bold ml-0.5">*</span> : <span className="text-gray-400 font-normal">(Optional)</span>} ({screenshots.length}/5)
              </span>
            </span>
            {type === 'BUG' && <span className="text-[10px] text-rose-500 font-extrabold">Required</span>}
          </label>

          {screenshots.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2">
              {screenshots.map((img, idx) => (
                <div key={idx} className="relative group aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5">
                  <img src={img} alt={`Proof ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeScreenshot(idx)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {screenshots.length < 5 && (
            <label className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#161b22] hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors text-center">
              <Upload className="w-5 h-5 text-gray-400 mb-1" />
              <span className="text-xs font-bold text-slate-800 dark:text-gray-200">
                Click or drag to upload screenshot proof ({5 - screenshots.length} remaining)
              </span>
              <span className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, WEBP (Max 5MB each)</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleMultipleFilesChange(e.target.files)}
                className="hidden"
              />
            </label>
          )}

          {touched.file && errors.file && (
            <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.file}</p>
          )}
        </div>

        {/* Auto metadata bar */}
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-white/10 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 flex-wrap gap-2">
          <span>OS: <strong className="text-slate-800 dark:text-gray-200">{specs.os || 'Windows'}</strong></span>
          <span>Browser: <strong className="text-slate-800 dark:text-gray-200">{specs.browser || 'Firefox'}</strong></span>
          <span>Res: <strong className="text-slate-800 dark:text-gray-200">{specs.screenResolution || '1920 x 1080'}</strong></span>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-full bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-slate-900 font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Send className="w-4 h-4" />
          <span>{loading ? 'Submitting Report...' : 'Submit QA Inspection Report'}</span>
        </button>
      </form>
    </div>
  );
}


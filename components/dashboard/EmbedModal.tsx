'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Code2, Play } from 'lucide-react';
import { Project } from '@/types';

interface EmbedModalProps {
  project: Project;
  onClose: () => void;
}

export function EmbedModal({ project, onClose }: EmbedModalProps) {
  const [copied, setCopied] = useState(false);

  const scriptTag = `<script 
  src="${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/poke.js"
  data-project-id="${project.id}"
  async>
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestWidget = () => {
    if (typeof window !== 'undefined' && (window as any).Poke) {
      (window as any).Poke.open();
    } else {
      const script = document.createElement('script');
      script.src = '/poke.js';
      script.setAttribute('data-project-id', project.id);
      script.onload = () => {
        if ((window as any).Poke) (window as any).Poke.open();
      };
      document.body.appendChild(script);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white border border-gray-200 rounded-3xl p-6 text-slate-900 shadow-2xl relative animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Embed Script Snippet</h3>
              <p className="text-xs text-gray-500">Copy & paste into your website before `&lt;/body&gt;`</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-slate-700 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Code Snippet Box */}
        <div className="relative mb-5">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 font-mono text-xs text-slate-900 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {scriptTag}
          </div>

          <button
            onClick={handleCopy}
            className="mt-3 w-full py-2.5 rounded-full bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Snippet Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Script Snippet</span>
              </>
            )}
          </button>
        </div>

        {/* Sandbox Test */}
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900">Test Widget Sandbox</h4>
            <p className="text-[11px] text-gray-500">Test target element selection on this page.</p>
          </div>

          <button
            onClick={handleTestWidget}
            className="px-4 py-2 rounded-full bg-white hover:bg-gray-100 border border-gray-300 text-xs font-bold text-slate-900 transition-all flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-slate-900" />
            <span>Launch Sandbox</span>
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import { QAComment } from '@/types';
import { TrendingUp, Calendar, Bug, Lightbulb, MessageSquare, Layers } from 'lucide-react';

export type TimeRange = 'TODAY' | 'YESTERDAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'ALL_TIME' | 'CUSTOM';
export type VisibleSeries = 'ALL' | 'BUG' | 'FEATURE' | 'GENERAL';

interface QALineGraphProps {
  comments: QAComment[];
}

interface DataBucket {
  label: string;
  startDate: Date;
  endDate: Date;
  bugs: number;
  features: number;
  general: number;
}

export function QALineGraph({ comments }: QALineGraphProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('TODAY');
  const [visibleSeries, setVisibleSeries] = useState<VisibleSeries>('ALL');

  const todayStr = new Date().toISOString().split('T')[0];
  const weekAgoStr = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState<string>(weekAgoStr);
  const [endDate, setEndDate] = useState<string>(todayStr);

  const [hoveredPoint, setHoveredPoint] = useState<{
    bucketIndex: number;
    x: number;
    y: number;
    bucket: DataBucket;
  } | null>(null);

  const buckets = useMemo<DataBucket[]>(() => {
    const now = new Date();
    const result: DataBucket[] = [];

    if (timeRange === 'TODAY') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      for (let hour = 0; hour < 24; hour += 4) {
        const bStart = new Date(startOfDay.getTime() + hour * 3600000);
        const bEnd = new Date(startOfDay.getTime() + (hour + 4) * 3600000);
        const label = `${String(hour).padStart(2, '0')}:00`;
        result.push({ label, startDate: bStart, endDate: bEnd, bugs: 0, features: 0, general: 0 });
      }
    } else if (timeRange === 'YESTERDAY') {
      const yesterday = new Date(now.getTime() - 24 * 3600000);
      const startOfDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0);
      for (let hour = 0; hour < 24; hour += 4) {
        const bStart = new Date(startOfDay.getTime() + hour * 3600000);
        const bEnd = new Date(startOfDay.getTime() + (hour + 4) * 3600000);
        const label = `${String(hour).padStart(2, '0')}:00`;
        result.push({ label, startDate: bStart, endDate: bEnd, bugs: 0, features: 0, general: 0 });
      }
    } else if (timeRange === 'THIS_WEEK') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 3600000);
      for (let day = 0; day < 7; day++) {
        const bStart = new Date(weekAgo.getFullYear(), weekAgo.getMonth(), weekAgo.getDate() + day, 0, 0, 0);
        const bEnd = new Date(weekAgo.getFullYear(), weekAgo.getMonth(), weekAgo.getDate() + day + 1, 0, 0, 0);
        const label = bStart.toLocaleDateString('en-US', { weekday: 'short' });
        result.push({ label, startDate: bStart, endDate: bEnd, bugs: 0, features: 0, general: 0 });
      }
    } else if (timeRange === 'THIS_MONTH') {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const step = Math.max(1, Math.floor(daysInMonth / 6));

      for (let d = 1; d <= daysInMonth; d += step) {
        const bStart = new Date(now.getFullYear(), now.getMonth(), d, 0, 0, 0);
        const nextD = Math.min(daysInMonth + 1, d + step);
        const bEnd = new Date(now.getFullYear(), now.getMonth(), nextD, 0, 0, 0);
        const monthName = now.toLocaleString('default', { month: 'short' });
        const label = `${monthName} ${d}`;
        result.push({ label, startDate: bStart, endDate: bEnd, bugs: 0, features: 0, general: 0 });
      }
    } else if (timeRange === 'ALL_TIME') {
      for (let m = 5; m >= 0; m--) {
        const bStart = new Date(now.getFullYear(), now.getMonth() - m, 1, 0, 0, 0);
        const bEnd = new Date(now.getFullYear(), now.getMonth() - m + 1, 1, 0, 0, 0);
        const label = bStart.toLocaleString('default', { month: 'short' });
        result.push({ label, startDate: bStart, endDate: bEnd, bugs: 0, features: 0, general: 0 });
      }
    } else if (timeRange === 'CUSTOM') {
      const s = new Date(startDate);
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);

      const diffMs = e.getTime() - s.getTime();
      const stepMs = Math.max(3600000, diffMs / 5);

      for (let i = 0; i < 6; i++) {
        const bStart = new Date(s.getTime() + i * stepMs);
        const bEnd = new Date(s.getTime() + (i + 1) * stepMs);
        const label = `${bStart.getMonth() + 1}/${bStart.getDate()}`;
        result.push({ label, startDate: bStart, endDate: bEnd, bugs: 0, features: 0, general: 0 });
      }
    }

    comments.forEach((c) => {
      const cDate = new Date(c.createdAt || Date.now());
      const bucket = result.find((b) => cDate >= b.startDate && cDate < b.endDate);
      const targetBucket = bucket || (cDate < result[0]?.startDate ? result[0] : result[result.length - 1]);

      if (targetBucket) {
        if (c.type === 'BUG') targetBucket.bugs += 1;
        if (c.type === 'FEATURE') targetBucket.features += 1;
        if (c.type === 'GENERAL') targetBucket.general += 1;
      }
    });

    return result;
  }, [comments, timeRange, startDate, endDate]);

  const totals = useMemo(() => {
    return {
      bugs: buckets.reduce((acc, b) => acc + b.bugs, 0),
      features: buckets.reduce((acc, b) => acc + b.features, 0),
      general: buckets.reduce((acc, b) => acc + b.general, 0),
    };
  }, [buckets]);

  const width = 700;
  const height = 240;
  const paddingX = 45;
  const paddingY = 35;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const maxY = useMemo(() => {
    let max = 1;
    buckets.forEach((b) => {
      max = Math.max(max, b.bugs, b.features, b.general);
    });
    return Math.ceil(max * 1.25);
  }, [buckets]);

  const getCoordinates = (getter: (b: DataBucket) => number) => {
    return buckets.map((b, i) => {
      const x = paddingX + (i / Math.max(1, buckets.length - 1)) * chartWidth;
      const val = getter(b);
      const y = height - paddingY - (val / maxY) * chartHeight;
      return { x, y, val };
    });
  };

  const bugPoints = getCoordinates((b) => b.bugs);
  const featurePoints = getCoordinates((b) => b.features);
  const generalPoints = getCoordinates((b) => b.general);

  const createCurvedPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const cpX1 = curr.x + (next.x - curr.x) / 2;
      const cpY1 = curr.y;
      const cpX2 = curr.x + (next.x - curr.x) / 2;
      const cpY2 = next.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }
    return path;
  };

  return (
    <div className="poke-card p-4 sm:p-6 rounded-3xl mb-8 dark:bg-[#0d1117] dark:border-white/10 shadow-sm">
      {/* Header bar and controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center shadow-sm shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              QA Activity Line Graph
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Interactive temporal trends across bugs, feature requests, and general feedback
            </p>
          </div>
        </div>

        {/* Filter selectors */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex flex-wrap items-center gap-1 bg-gray-100 dark:bg-[#161b22] p-1 rounded-2xl text-[11px] font-extrabold border border-gray-200/80 dark:border-white/10">
            <button
              onClick={() => setVisibleSeries('ALL')}
              className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 ${
                visibleSeries === 'ALL'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>All</span>
            </button>

            <button
              onClick={() => setVisibleSeries('BUG')}
              className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 ${
                visibleSeries === 'BUG'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-rose-600 dark:text-rose-400 hover:opacity-80'
              }`}
            >
              <Bug className="w-3 h-3" />
              <span>Bugs ({totals.bugs})</span>
            </button>

            <button
              onClick={() => setVisibleSeries('FEATURE')}
              className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 ${
                visibleSeries === 'FEATURE'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-amber-600 dark:text-amber-400 hover:opacity-80'
              }`}
            >
              <Lightbulb className="w-3 h-3" />
              <span>Features ({totals.features})</span>
            </button>

            <button
              onClick={() => setVisibleSeries('GENERAL')}
              className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 ${
                visibleSeries === 'GENERAL'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-blue-600 dark:text-blue-400 hover:opacity-80'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>General ({totals.general})</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-[#161b22] px-3 py-1 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="bg-transparent outline-none cursor-pointer text-xs font-bold"
            >
              <option value="TODAY" className="bg-white dark:bg-gray-900 text-slate-900 dark:text-white">Today</option>
              <option value="YESTERDAY" className="bg-white dark:bg-gray-900 text-slate-900 dark:text-white">Yesterday</option>
              <option value="THIS_WEEK" className="bg-white dark:bg-gray-900 text-slate-900 dark:text-white">This Week</option>
              <option value="THIS_MONTH" className="bg-white dark:bg-gray-900 text-slate-900 dark:text-white">This Month</option>
              <option value="ALL_TIME" className="bg-white dark:bg-gray-900 text-slate-900 dark:text-white">All Time</option>
              <option value="CUSTOM" className="bg-white dark:bg-gray-900 text-slate-900 dark:text-white">Custom Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Custom date range selector */}
      {timeRange === 'CUSTOM' && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4 p-3 bg-gray-50 dark:bg-[#161b22] rounded-2xl border border-gray-200 dark:border-white/10 text-xs font-mono">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="text-gray-500 font-bold">Start Date:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="text-gray-500 font-bold">End Date:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-slate-900 dark:text-white outline-none"
            />
          </div>
        </div>
      )}

      {/* SVG line graph rendering */}
      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[500px] overflow-visible">
          <defs>
            <linearGradient id="bugGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="featureGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="generalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = paddingY + pct * chartHeight;
            const valLabel = Math.round(maxY * (1 - pct));
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  className="stroke-gray-200 dark:stroke-white/10"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 10}
                  y={y + 4}
                  className="fill-gray-400 text-[10px] font-mono text-right"
                  textAnchor="end"
                >
                  {valLabel}
                </text>
              </g>
            );
          })}

          {/* X axis labels */}
          {buckets.map((b, i) => {
            const x = paddingX + (i / Math.max(1, buckets.length - 1)) * chartWidth;
            return (
              <text
                key={i}
                x={x}
                y={height - 10}
                className="fill-gray-500 dark:fill-gray-400 text-[10px] font-mono"
                textAnchor="middle"
              >
                {b.label}
              </text>
            );
          })}

          {/* Bugs line */}
          {(visibleSeries === 'ALL' || visibleSeries === 'BUG') && (
            <>
              <path
                d={createCurvedPath(bugPoints)}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {bugPoints.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  fill="#f43f5e"
                  className="stroke-white dark:stroke-slate-900"
                  strokeWidth="2"
                />
              ))}
            </>
          )}

          {/* Features line */}
          {(visibleSeries === 'ALL' || visibleSeries === 'FEATURE') && (
            <>
              <path
                d={createCurvedPath(featurePoints)}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {featurePoints.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  fill="#f59e0b"
                  className="stroke-white dark:stroke-slate-900"
                  strokeWidth="2"
                />
              ))}
            </>
          )}

          {/* General feedback line */}
          {(visibleSeries === 'ALL' || visibleSeries === 'GENERAL') && (
            <>
              <path
                d={createCurvedPath(generalPoints)}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {generalPoints.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  fill="#3b82f6"
                  className="stroke-white dark:stroke-slate-900"
                  strokeWidth="2"
                />
              ))}
            </>
          )}

          {/* Transparent interactive hover targets */}
          {buckets.map((bucket, i) => {
            const x = paddingX + (i / Math.max(1, buckets.length - 1)) * chartWidth;
            const colWidth = chartWidth / Math.max(1, buckets.length - 1);
            return (
              <rect
                key={i}
                x={x - colWidth / 2}
                y={paddingY}
                width={colWidth}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer hover:fill-slate-900/5 dark:hover:fill-white/5 transition-colors"
                onMouseEnter={() =>
                  setHoveredPoint({
                    bucketIndex: i,
                    x,
                    y: bugPoints[i]?.y || paddingY,
                    bucket,
                  })
                }
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}
        </svg>

        {/* Hover Tooltip Card */}
        {hoveredPoint && (
          <div
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-full mb-3 pointer-events-none z-20"
          >
            <div className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 p-3 rounded-2xl shadow-xl text-xs font-mono border border-white/20 whitespace-nowrap min-w-[140px]">
              <p className="font-bold border-b border-white/10 dark:border-slate-900/10 pb-1 mb-1.5 text-gray-300 dark:text-gray-600">
                {hoveredPoint.bucket.label}
              </p>
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center justify-between gap-3 text-rose-400 dark:text-rose-600">
                  <span className="flex items-center gap-1 font-bold">Bugs:</span>
                  <span>{hoveredPoint.bucket.bugs}</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-amber-400 dark:text-amber-600">
                  <span className="flex items-center gap-1 font-bold">Features:</span>
                  <span>{hoveredPoint.bucket.features}</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-blue-400 dark:text-blue-600">
                  <span className="flex items-center gap-1 font-bold">General:</span>
                  <span>{hoveredPoint.bucket.general}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-4 pt-4 border-t border-gray-100 dark:border-white/5 text-xs font-extrabold">
        <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
          <span>Bugs ({totals.bugs})</span>
        </div>

        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
          <span>Features ({totals.features})</span>
        </div>

        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
          <span>General ({totals.general})</span>
        </div>
      </div>
    </div>
  );
}


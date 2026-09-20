"use client";

import React from "react";
import { TrendingUp, RefreshCw, Calendar, Download } from "lucide-react";

interface AnalyticsHeaderProps {
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export function AnalyticsHeader({
  timeRange,
  onTimeRangeChange,
  isRefreshing = false,
  onRefresh,
}: AnalyticsHeaderProps) {
  const timeRanges = [
    { label: "24 Hours", value: "24H" },
    { label: "7 Days", value: "7D" },
    { label: "30 Days", value: "30D" },
    { label: "90 Days", value: "90D" },
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-900/90 p-7 md:p-8 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-950/90 border border-blue-700/80 flex items-center justify-center text-blue-400 shadow-inner flex-shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
              Executive Analytics & Operational Review
            </h1>
            <p className="text-sm md:text-base text-slate-400 mt-1 leading-relaxed max-w-3xl">
              Multi-agency response benchmarks, historical SLA compliance rates, AI dispatch accuracy, and peak load insights.
            </p>
          </div>
        </div>
      </div>

      {/* Action Controls & Time Range */}
      <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
        <div className="flex items-center gap-1.5 bg-slate-950/90 p-1.5 rounded-xl border border-slate-800 shadow-inner">
          <span className="text-xs font-mono text-slate-400 px-2 flex items-center gap-1">
            <Calendar size={13} />
            Range:
          </span>
          {timeRanges.map((tr) => (
            <button
              key={tr.value}
              onClick={() => onTimeRangeChange(tr.value)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                timeRange === tr.value
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              }`}
            >
              {tr.label}
            </button>
          ))}
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs md:text-sm font-semibold transition-all shadow-sm"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-blue-400" : ""} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default AnalyticsHeader;

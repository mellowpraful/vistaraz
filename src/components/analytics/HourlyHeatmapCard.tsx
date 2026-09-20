"use client";

import React from "react";
import { Clock, Activity, Flame, AlertCircle } from "lucide-react";

export function HourlyHeatmapCard() {
  const hourlyData = [
    { hour: 0, val: 2 },
    { hour: 1, val: 1 },
    { hour: 2, val: 0 },
    { hour: 3, val: 1 },
    { hour: 4, val: 2 },
    { hour: 5, val: 4 },
    { hour: 6, val: 7 },
    { hour: 7, val: 12 },
    { hour: 8, val: 18 },
    { hour: 9, val: 24 },
    { hour: 10, val: 28 },
    { hour: 11, val: 32 },
    { hour: 12, val: 29 },
    { hour: 13, val: 35 },
    { hour: 14, val: 42 },
    { hour: 15, val: 38 },
    { hour: 16, val: 30 },
    { hour: 17, val: 26 },
    { hour: 18, val: 22 },
    { hour: 19, val: 17 },
    { hour: 20, val: 12 },
    { hour: 21, val: 9 },
    { hour: 22, val: 5 },
    { hour: 23, val: 3 },
  ];

  const maxVal = Math.max(...hourlyData.map((d) => d.val));

  return (
    <div className="card p-7 md:p-8 bg-slate-900/90 border-slate-800 rounded-2xl shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-950/80 border border-amber-800/80 rounded-xl text-amber-400">
            <Clock size={20} />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-100 uppercase tracking-wider">
              24-Hour Incident Intake Heatmap & Surge Analysis
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              Hourly distribution of citizen SOS calls, dispatch activations, and emergency surge points
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs self-start sm:self-center">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-3 h-3 rounded bg-slate-800" /> Low (0-5)
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-3 h-3 rounded bg-blue-500" /> Moderate (6-15)
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-3 h-3 rounded bg-orange-500" /> High (16-29)
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-3 h-3 rounded bg-red-500" /> Surge (30+)
          </span>
        </div>
      </div>

      {/* Heatmap Bar Columns */}
      <div className="p-5 bg-slate-950/90 rounded-2xl border border-slate-800 shadow-inner">
        <div className="grid grid-cols-12 md:grid-cols-24 gap-2 items-end h-48 pt-6 pb-2">
          {hourlyData.map(({ hour, val }) => {
            const heightPercent = Math.max(10, Math.round((val / maxVal) * 100));
            const intensityColor =
              val >= 30
                ? "bg-red-500 shadow-lg shadow-red-500/40"
                : val >= 20
                ? "bg-orange-500 shadow-md shadow-orange-500/30"
                : val >= 10
                ? "bg-amber-500 shadow-sm"
                : val >= 5
                ? "bg-blue-500 shadow-sm"
                : "bg-slate-800";

            return (
              <div
                key={hour}
                className="flex flex-col items-center justify-end h-full group relative"
              >
                {/* Tooltip on hover */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-20">
                  {hour}:00 — {val} calls
                </div>

                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-md ${intensityColor} transition-all duration-300 group-hover:brightness-125 cursor-pointer`}
                />
                <span className="text-xs font-mono text-slate-400 mt-2 block font-semibold">
                  {hour}h
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs md:text-sm text-slate-400 font-mono pt-3 border-t border-slate-800 gap-2">
        <span className="flex items-center gap-2">
          <Activity size={15} className="text-red-400" />
          <span>Peak Emergency Inflow: <strong className="text-slate-200 font-sans">14:00 - 16:00 (Heavy Monsoon Surge)</strong></span>
        </span>
        <span className="text-red-400 font-bold bg-red-950/80 border border-red-800 px-3 py-1 rounded-lg self-start sm:self-center">
          Peak Load: 42 incidents / hr
        </span>
      </div>
    </div>
  );
}

export default HourlyHeatmapCard;

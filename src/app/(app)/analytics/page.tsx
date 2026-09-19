"use client";

import { useState } from "react";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7D");

  const incidentTypes = [
    { type: "FLOOD", count: 42, color: "bg-blue-500", pct: 30 },
    { type: "ROAD_ACCIDENT", count: 36, color: "bg-orange-500", pct: 25 },
    { type: "FIRE", count: 28, color: "bg-red-500", pct: 20 },
    { type: "MEDICAL", count: 18, color: "bg-emerald-500", pct: 13 },
    { type: "HAZMAT", count: 10, color: "bg-purple-500", pct: 7 },
    { type: "SEARCH_RESCUE", count: 8, color: "bg-amber-500", pct: 5 },
  ];

  const agencyPerformance = [
    { name: "108 Emergency Medical Services", dispatched: 54, avgEta: "5.8m", score: "96%" },
    { name: "Ahmedabad Fire & Emergency", dispatched: 41, avgEta: "7.2m", score: "94%" },
    { name: "NDRF Battalion 6 (Rescue)", dispatched: 28, avgEta: "12.4m", score: "98%" },
    { name: "Ahmedabad City Police", dispatched: 39, avgEta: "4.9m", score: "92%" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
            <span>📈</span> Executive Analytics & Operational Review
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Historical response SLA benchmarks, multi-agency dispatch efficiency & AI accuracy audits
          </p>
        </div>

        {/* Time Range Filter */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          {["24H", "7D", "30D", "90D"].map((tr) => (
            <button
              key={tr}
              onClick={() => setTimeRange(tr)}
              className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
                timeRange === tr
                  ? "bg-blue-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tr}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-5 space-y-1 border-l-4 border-l-emerald-500">
          <div className="text-[11px] text-emerald-400 uppercase font-mono">Avg Dispatch Response Time</div>
          <div className="text-3xl font-black text-slate-100 font-mono">6.4 <span className="text-base text-slate-400">mins</span></div>
          <div className="text-[10px] text-emerald-400 font-semibold">⚡ 1.6m ahead of 8.0m SLA target</div>
        </div>

        <div className="card p-5 space-y-1 border-l-4 border-l-blue-500">
          <div className="text-[11px] text-blue-400 uppercase font-mono">Incident Resolution Rate</div>
          <div className="text-3xl font-black text-blue-400 font-mono">88.4%</div>
          <div className="text-[10px] text-slate-400">125 of 142 resolved</div>
        </div>

        <div className="card p-5 space-y-1 border-l-4 border-l-purple-500">
          <div className="text-[11px] text-purple-400 uppercase font-mono">AI Dispatch Acceptance</div>
          <div className="text-3xl font-black text-purple-400 font-mono">92.5%</div>
          <div className="text-[10px] text-purple-300">Human commander approved</div>
        </div>

        <div className="card p-5 space-y-1 border-l-4 border-l-amber-500">
          <div className="text-[11px] text-amber-400 uppercase font-mono">Total Lives Evacuated / Rescued</div>
          <div className="text-3xl font-black text-amber-400 font-mono">418</div>
          <div className="text-[10px] text-slate-400">Across 6 active districts</div>
        </div>
      </div>

      {/* Charts & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident Volume by Type */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <span>📊</span> Incident Distribution by Emergency Type ({timeRange})
          </h2>

          <div className="space-y-3 pt-2">
            {incidentTypes.map((item) => (
              <div key={item.type} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">{item.type.replace("_", " ")}</span>
                  <span className="text-slate-400 font-bold">
                    {item.count} incidents ({item.pct}%)
                  </span>
                </div>
                <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    style={{ width: `${item.pct}%` }}
                    className={`h-full ${item.color} transition-all duration-500`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Multi-Agency Response Matrix */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <span>🛡️</span> Multi-Agency Performance & Dispatch SLA
          </h2>

          <div className="space-y-3 pt-1">
            {agencyPerformance.map((ag) => (
              <div
                key={ag.name}
                className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-200">{ag.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {ag.dispatched} Dispatches Completed
                  </div>
                </div>

                <div className="flex items-center gap-4 font-mono text-right">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Avg ETA</div>
                    <div className="font-bold text-blue-400">{ag.avgEta}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">SLA Pass</div>
                    <div className="font-bold text-emerald-400">{ag.score}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hourly Call Volume Heatmap Card */}
      <div className="card p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <span>🕒</span> 24-Hour Incident Intake Heatmap & Peak Load Periods
        </h2>

        <div className="grid grid-cols-12 sm:grid-cols-24 gap-1.5 pt-2">
          {[
            2, 1, 0, 1, 2, 4, 7, 12, 18, 24, 28, 32, 29, 35, 42, 38, 30, 26, 22, 17, 12, 9, 5, 3,
          ].map((val, hour) => {
            const intensity = val > 30 ? "bg-red-500" : val > 20 ? "bg-orange-500" : val > 10 ? "bg-yellow-500" : val > 4 ? "bg-blue-500" : "bg-slate-800";
            return (
              <div key={hour} className="text-center space-y-1">
                <div
                  style={{ height: `${Math.max(12, val * 1.8)}px` }}
                  className={`w-full rounded-sm ${intensity} transition-all duration-200`}
                  title={`${hour}:00 — ${val} incidents logged`}
                />
                <span className="text-[9px] font-mono text-slate-500 block">
                  {hour}h
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-800">
          <span>Peak Emergency Inflow: 14:00 - 16:00 (Heavy Monsoon Cloudburst)</span>
          <span className="text-red-400 font-bold">Max Load: 42 calls/hr</span>
        </div>
      </div>
    </div>
  );
}

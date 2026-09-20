"use client";

import React from "react";
import { PieChart, Layers, Flame, Droplets, Car, ShieldAlert, HeartPulse, Search } from "lucide-react";

interface IncidentDistributionProps {
  timeRange: string;
}

const INCIDENT_BREAKDOWN = [
  { type: "FLOOD", label: "Flash Flood & Water Surge", count: 42, color: "bg-blue-500", barGlow: "shadow-blue-500/30", pct: 30, icon: <Droplets size={16} className="text-blue-400" /> },
  { type: "ROAD_ACCIDENT", label: "Major Vehicular Collisions", count: 36, color: "bg-orange-500", barGlow: "shadow-orange-500/30", pct: 25, icon: <Car size={16} className="text-orange-400" /> },
  { type: "FIRE", label: "Commercial / Structural Fire", count: 28, color: "bg-red-500", barGlow: "shadow-red-500/30", pct: 20, icon: <Flame size={16} className="text-red-400" /> },
  { type: "MEDICAL", label: "Mass Casualty / Medical Surge", count: 18, color: "bg-emerald-500", barGlow: "shadow-emerald-500/30", pct: 13, icon: <HeartPulse size={16} className="text-emerald-400" /> },
  { type: "HAZMAT", label: "Hazardous Chemical Contamination", count: 10, color: "bg-purple-500", barGlow: "shadow-purple-500/30", pct: 7, icon: <ShieldAlert size={16} className="text-purple-400" /> },
  { type: "SEARCH_RESCUE", label: "Collapsed Structure Search & Rescue", count: 8, color: "bg-amber-500", barGlow: "shadow-amber-500/30", pct: 5, icon: <Search size={16} className="text-amber-400" /> },
];

export function IncidentDistributionCard({ timeRange }: IncidentDistributionProps) {
  const totalIncidents = INCIDENT_BREAKDOWN.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="card p-7 md:p-8 bg-slate-900/90 border-slate-800 rounded-2xl shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-950/80 border border-blue-800/80 rounded-xl text-blue-400">
            <PieChart size={20} />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-100 uppercase tracking-wider">
              Emergency Distribution by Incident Type
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              Incident volume classification logged over the active period ({timeRange})
            </p>
          </div>
        </div>

        <div className="text-right font-mono self-start sm:self-center">
          <span className="text-xs text-slate-400 uppercase font-bold block">Total Logged</span>
          <span className="text-xl font-bold text-slate-100 font-stat">{totalIncidents} Incidents</span>
        </div>
      </div>

      <div className="space-y-4 pt-1">
        {INCIDENT_BREAKDOWN.map((item) => (
          <div key={item.type} className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-2.5 shadow-sm hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs md:text-sm font-mono">
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span className="text-slate-200 font-semibold font-sans">{item.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-semibold font-mono">
                  {item.count} incidents
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-900 text-slate-200 border border-slate-800 font-stat">
                  {item.pct}%
                </span>
              </div>
            </div>

            <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800/90 shadow-inner">
              <div
                style={{ width: `${item.pct}%` }}
                className={`h-full ${item.color} rounded-full transition-all duration-700 shadow-md ${item.barGlow}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IncidentDistributionCard;

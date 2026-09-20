"use client";

import React from "react";
import { Shield, Building2, CheckCircle2, Clock, Award } from "lucide-react";

interface AgencyPerformanceProps {
  timeRange: string;
}

const AGENCY_DATA = [
  {
    name: "108 Emergency Medical Services",
    type: "Medical First Responder",
    dispatched: 54,
    avgEta: "5.8m",
    score: "96%",
    targetEta: "< 7.0m",
    status: "EXCEEDING",
    badgeColor: "bg-emerald-950 text-emerald-300 border-emerald-800",
  },
  {
    name: "Ahmedabad Fire & Emergency Services",
    type: "Fire Suppression & Heavy Hazmat",
    dispatched: 41,
    avgEta: "7.2m",
    score: "94%",
    targetEta: "< 8.0m",
    status: "EXCEEDING",
    badgeColor: "bg-emerald-950 text-emerald-300 border-emerald-800",
  },
  {
    name: "NDRF Battalion 6 (Disaster Rescue)",
    type: "Flood Boat & Deep Water Rescue",
    dispatched: 28,
    avgEta: "12.4m",
    score: "98%",
    targetEta: "< 15.0m",
    status: "EXCEEDING",
    badgeColor: "bg-emerald-950 text-emerald-300 border-emerald-800",
  },
  {
    name: "Ahmedabad City Police Traffic Division",
    type: "Perimeter & Evacuation Corridor",
    dispatched: 39,
    avgEta: "4.9m",
    score: "92%",
    targetEta: "< 6.0m",
    status: "EXCEEDING",
    badgeColor: "bg-emerald-950 text-emerald-300 border-emerald-800",
  },
];

export function AgencyPerformanceCard({ timeRange }: AgencyPerformanceProps) {
  return (
    <div className="card p-7 md:p-8 bg-slate-900/90 border-slate-800 rounded-2xl shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-950/80 border border-purple-800/80 rounded-xl text-purple-400">
            <Building2 size={20} />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-100 uppercase tracking-wider">
              Multi-Agency Dispatch Efficiency & SLA Audit
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              Verified field response speed and adherence to municipal dispatch SLAs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-lg font-bold">
            95.0% Overall Multi-Agency SLA
          </span>
        </div>
      </div>

      <div className="space-y-4 pt-1">
        {AGENCY_DATA.map((ag) => (
          <div
            key={ag.name}
            className="p-5 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-3 hover:border-purple-900/60 transition-colors shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-sm md:text-base font-bold text-slate-100 font-sans">
                    {ag.name}
                  </span>
                  <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${ag.badgeColor}`}>
                    {ag.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5 font-mono">
                  {ag.type} • {ag.dispatched} Dispatches Completed
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono text-left md:text-right pt-2 md:pt-0 border-t md:border-t-0 border-slate-900">
                <div className="p-2 bg-slate-900/70 rounded-lg border border-white/5">
                  <div className="text-xs text-slate-400 uppercase font-bold">Avg Arrival</div>
                  <div className="text-base font-bold text-blue-400 font-stat mt-0.5">{ag.avgEta}</div>
                </div>
                <div className="p-2 bg-slate-900/70 rounded-lg border border-white/5">
                  <div className="text-xs text-slate-400 uppercase font-bold">Target SLA</div>
                  <div className="text-base font-bold text-slate-300 font-stat mt-0.5">{ag.targetEta}</div>
                </div>
                <div className="p-2 bg-slate-900/70 rounded-lg border border-white/5 col-span-2 sm:col-span-1">
                  <div className="text-xs text-slate-400 uppercase font-bold">SLA Pass</div>
                  <div className="text-base font-bold text-emerald-400 font-stat mt-0.5">{ag.score}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AgencyPerformanceCard;

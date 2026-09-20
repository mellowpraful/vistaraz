"use client";

import React from "react";
import type { ExecutiveSitrep } from "@/lib/ai/commander-service";
import { ShieldAlert, AlertTriangle, Navigation, Building2, Bed, Sparkles, Activity, Radio } from "lucide-react";

interface CommanderStatsOverviewProps {
  sitrep: ExecutiveSitrep;
}

export function CommanderStatsOverview({ sitrep }: CommanderStatsOverviewProps) {
  const isHighThreat = sitrep.overallStatus === "RED_ALERT" || sitrep.overallStatus === "ELEVATED_WATCH";
  const isHighIcu = sitrep.metrics.hospitalIcuOccupancyPercent > 80;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
      {/* 1. Threat Level Card */}
      <div className="relative overflow-hidden p-6 rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-950/40 via-slate-900/90 to-slate-950 shadow-xl hover:border-red-400/60 hover:scale-[1.02] transition-all group">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600" />
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-300">DEFCON THREAT</span>
          <ShieldAlert size={18} className={isHighThreat ? "text-red-400 animate-pulse" : "text-amber-400"} />
        </div>
        <div className="pt-3">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${isHighThreat ? "bg-red-500 animate-ping" : "bg-amber-400"}`} />
            <span className="text-xl md:text-2xl font-black tracking-tight text-red-400 font-stat">
              {sitrep.overallStatus.replace(/_/g, " ")}
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1.5">Critical Emergency Ops</p>
        </div>
      </div>

      {/* 2. Active Emergencies Card */}
      <div className="relative overflow-hidden p-6 rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-950/40 via-slate-900/90 to-slate-950 shadow-xl hover:border-orange-400/60 hover:scale-[1.02] transition-all">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600" />
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-300">ACTIVE INCIDENTS</span>
          <AlertTriangle size={18} className="text-orange-400" />
        </div>
        <div className="pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-black text-white font-stat">
              {sitrep.metrics.activeIncidents}
            </span>
            <span className="text-xs font-mono text-red-400 font-bold">
              ({sitrep.metrics.criticalCount} Crit)
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1.5">Active CAD dispatches</p>
        </div>
      </div>

      {/* 3. Fleet Deployment Card */}
      <div className="relative overflow-hidden p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-slate-950 shadow-xl hover:border-emerald-400/60 hover:scale-[1.02] transition-all">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600" />
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">FIELD FLEET</span>
          <Navigation size={18} className="text-emerald-400 animate-pulse" />
        </div>
        <div className="pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-black text-white font-stat">
              {sitrep.metrics.dispatchedUnits}
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              / {sitrep.metrics.availableUnits} Avail
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1.5">Multi-agency units active</p>
        </div>
      </div>

      {/* 4. ICU Bed Occupancy */}
      <div className="relative overflow-hidden p-6 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-slate-900/90 to-slate-950 shadow-xl hover:border-purple-400/60 hover:scale-[1.02] transition-all">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600" />
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300">ICU OCCUPANCY</span>
          <Bed size={18} className="text-purple-400" />
        </div>
        <div className="pt-3">
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl md:text-4xl font-black font-stat ${isHighIcu ? "text-amber-400" : "text-white"}`}>
              {sitrep.metrics.hospitalIcuOccupancyPercent}%
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1.5">Trauma Center Reserves</p>
        </div>
      </div>

      {/* 5. Shelter Saturation */}
      <div className="relative overflow-hidden p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-slate-900/90 to-slate-950 shadow-xl hover:border-cyan-400/60 hover:scale-[1.02] transition-all">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-600 via-blue-500 to-cyan-600" />
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">EVACUATION HUBS</span>
          <Building2 size={18} className="text-cyan-400" />
        </div>
        <div className="pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-black text-white font-stat">
              {sitrep.metrics.shelterCapacityUsedPercent}%
            </span>
            <span className="text-xs font-mono text-cyan-400 font-bold">Capacity</span>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1.5">Displaced shelter beds</p>
        </div>
      </div>

      {/* 6. AI Triangulated Confidence */}
      <div className="relative overflow-hidden p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900/90 to-slate-950 shadow-xl hover:border-indigo-400/60 hover:scale-[1.02] transition-all">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600" />
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-300">AI CONFIDENCE</span>
          <Sparkles size={18} className="text-indigo-400" />
        </div>
        <div className="pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-black text-indigo-300 font-stat">
              {sitrep.confidenceScore}%
            </span>
          </div>
          <p className="text-xs font-mono text-emerald-400 font-bold mt-1.5">✓ Triangulated Model</p>
        </div>
      </div>
    </div>
  );
}

export default CommanderStatsOverview;

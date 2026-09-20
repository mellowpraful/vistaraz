"use client";

import React from "react";
import { Bot, RefreshCw, ShieldAlert, Sparkles, Activity, Radio, Cpu, Network } from "lucide-react";

interface CommanderHeaderProps {
  loadingBriefing: boolean;
  onRefresh: () => void;
  sitrepId?: string;
  generatedAt?: string;
}

export function CommanderHeader({
  loadingBriefing,
  onRefresh,
  sitrepId,
  generatedAt,
}: CommanderHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-r from-slate-950 via-purple-950/20 to-slate-950 p-8 md:p-10 shadow-2xl backdrop-blur-2xl animate-hologram">
      {/* Background Cyber Ambient Glow & Scanline */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-purple-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-blue-600/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-75" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-start gap-5">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-900/90 to-indigo-950 border border-purple-400/50 flex items-center justify-center text-purple-200 shadow-2xl shadow-purple-900/60 animate-float">
              <Bot size={34} className="text-purple-300" />
            </div>
            {/* Live pulsing neural node */}
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500 border-2 border-slate-950" />
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                CrisisOS AI Commander
              </h1>
              <span className="text-xs font-mono font-bold uppercase px-3.5 py-1.5 rounded-full bg-purple-950/90 text-purple-300 border border-purple-500/60 shadow-lg shadow-purple-950/50 flex items-center gap-2">
                <Cpu size={14} className="text-purple-400 animate-spin" style={{ animationDuration: "12s" }} />
                Neural Strategy Engine v2.4
              </span>
              <span className="text-xs font-mono font-bold uppercase px-3.5 py-1.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-500/60 flex items-center gap-2 shadow-lg shadow-amber-950/50">
                <ShieldAlert size={14} className="text-amber-400" />
                Human Authorization Mandatory
              </span>
            </div>

            <p className="text-sm md:text-base text-slate-300 max-w-3xl leading-relaxed">
              Autonomous multi-agency intelligence synthesis, predictive hazard trajectory analysis, and human-in-the-loop tactical command directives.
            </p>

            {/* Audio / Neural telemetry visualizer bars */}
            <div className="flex items-center gap-4 pt-1 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <Network size={14} className="text-purple-400" />
                <span>Neural Telemetry Matrix:</span>
              </div>
              <div className="flex items-end gap-1 h-6 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-purple-900/50">
                <span className="w-1 bg-purple-500 rounded-full wave-bar-1" />
                <span className="w-1 bg-blue-400 rounded-full wave-bar-2" />
                <span className="w-1 bg-indigo-400 rounded-full wave-bar-3" />
                <span className="w-1 bg-purple-400 rounded-full wave-bar-4" />
                <span className="w-1 bg-cyan-400 rounded-full wave-bar-5" />
                <span className="w-1 bg-purple-500 rounded-full wave-bar-2" />
                <span className="w-1 bg-emerald-400 rounded-full wave-bar-1" />
              </div>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                ● 100% CAD Stream Synced
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 self-start lg:self-center flex-shrink-0">
          <div className="text-right hidden sm:block font-mono bg-slate-950/80 p-3 rounded-2xl border border-white/5">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">CYBER OPS STATUS</div>
            <div className="text-xs font-semibold text-purple-300 flex items-center justify-end gap-2 mt-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
              Active SITREP Cycle
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={loadingBriefing}
            className="group relative flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-300/30 rounded-2xl text-sm font-bold transition-all shadow-xl shadow-purple-600/40 hover:shadow-purple-500/60 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <RefreshCw size={18} className={loadingBriefing ? "animate-spin text-purple-200" : "group-hover:rotate-180 transition-transform duration-500"} />
            <span>{loadingBriefing ? "Synthesizing Live Telemetry..." : "Generate Fresh SITREP"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommanderHeader;

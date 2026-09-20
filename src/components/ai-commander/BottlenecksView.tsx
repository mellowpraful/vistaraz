"use client";

import React from "react";
import type { ExecutiveSitrep } from "@/lib/ai/commander-service";
import { Building2, AlertCircle, TrendingDown, CheckCircle2 } from "lucide-react";

interface BottlenecksViewProps {
  sitrep: ExecutiveSitrep | null;
}

export function BottlenecksView({ sitrep }: BottlenecksViewProps) {
  return (
    <div className="space-y-8 md:space-y-10 animate-fade-in">
      <div className="p-8 md:p-10 bg-slate-900/90 border border-slate-800 space-y-8 rounded-3xl shadow-2xl backdrop-blur-md">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 uppercase tracking-wider flex items-center gap-3">
            <Building2 size={24} className="text-blue-400" /> Sector Resource Bottlenecks & Deficit Forecast
          </h2>
          <p className="text-sm md:text-base text-slate-300 mt-1.5">
            Telemetry matching active emergency requirements against currently available, staged, and committed fleet assets.
          </p>
        </div>

        <div className="space-y-6 md:space-y-8">
          {sitrep?.bottlenecks && sitrep.bottlenecks.length > 0 ? (
            sitrep.bottlenecks.map((bn, i) => (
              <div
                key={i}
                className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700 transition-all shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-base font-bold text-slate-100">{bn.resourceType}</span>
                    <span className="text-xs font-mono text-slate-400 ml-3 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                      Agency: {bn.agency}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-mono font-bold px-3 py-1 rounded-lg border self-start sm:self-center ${
                      bn.status === "CRITICAL_DEFICIT"
                        ? "bg-red-950 text-red-300 border-red-800 shadow-sm"
                        : bn.status === "STRETCHED"
                        ? "bg-amber-950 text-amber-300 border-amber-800 shadow-sm"
                        : "bg-emerald-950 text-emerald-300 border-emerald-800 shadow-sm"
                    }`}
                  >
                    {bn.status.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono py-1">
                  <div className="p-4 bg-slate-900/80 rounded-xl border border-white/5 space-y-1">
                    <span className="text-xs text-slate-400 block uppercase font-bold">AVAILABLE</span>
                    <span className="text-2xl font-bold text-emerald-400 font-stat">{bn.available}</span>
                  </div>
                  <div className="p-4 bg-slate-900/80 rounded-xl border border-white/5 space-y-1">
                    <span className="text-xs text-slate-400 block uppercase font-bold">COMMITTED</span>
                    <span className="text-2xl font-bold text-blue-400 font-stat">{bn.committed}</span>
                  </div>
                  <div className="p-4 bg-slate-900/80 rounded-xl border border-white/5 space-y-1">
                    <span className="text-xs text-slate-400 block uppercase font-bold">EST. REQUIRED</span>
                    <span className="text-2xl font-bold text-slate-200 font-stat">{bn.requiredEstimated}</span>
                  </div>
                  <div className="p-4 bg-slate-900/80 rounded-xl border border-white/5 space-y-1">
                    <span className="text-xs text-slate-400 block uppercase font-bold">DEFICIT GAP</span>
                    <span className={`text-2xl font-bold font-stat ${bn.deficit > 0 ? "text-red-400" : "text-slate-400"}`}>
                      {bn.deficit > 0 ? `-${bn.deficit}` : "0"}
                    </span>
                  </div>
                </div>

                <div className="text-xs md:text-sm text-slate-300 pt-2 border-t border-slate-900">
                  <strong className="text-purple-300">Mitigation Directive:</strong> {bn.mitigationStrategy}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-400 italic text-sm">
              All fleet categories operating within normal capacity thresholds.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BottlenecksView;

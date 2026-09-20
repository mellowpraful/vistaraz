"use client";

import React from "react";
import { Gauge, CheckCircle2, AlertTriangle, ShieldAlert, Timer } from "lucide-react";

export function SlaBenchmarkCard() {
  const benchmarks = [
    {
      level: "CRITICAL (DEFCON 1)",
      description: "Immediate threat to life, major explosions, building collapse",
      target: "< 5.0 mins",
      actual: "3.8 mins",
      compliance: "98.2%",
      status: "COMPLIANT",
      color: "border-l-red-500",
      badgeColor: "bg-red-950 text-red-300 border-red-800",
    },
    {
      level: "HIGH (DEFCON 2)",
      description: "Severe road collisions, active structural fires, localized floods",
      target: "< 8.0 mins",
      actual: "6.4 mins",
      compliance: "94.6%",
      status: "COMPLIANT",
      color: "border-l-orange-500",
      badgeColor: "bg-orange-950 text-orange-300 border-orange-800",
    },
    {
      level: "MEDIUM (DEFCON 3)",
      description: "Single casualty medical assistance, minor hazmat containment",
      target: "< 15.0 mins",
      actual: "11.2 mins",
      compliance: "91.8%",
      status: "COMPLIANT",
      color: "border-l-blue-500",
      badgeColor: "bg-blue-950 text-blue-300 border-blue-800",
    },
    {
      level: "LOW (DEFCON 4)",
      description: "Property hazard inspections, non-emergency relief transport",
      target: "< 30.0 mins",
      actual: "18.5 mins",
      compliance: "96.4%",
      status: "COMPLIANT",
      color: "border-l-emerald-500",
      badgeColor: "bg-emerald-950 text-emerald-300 border-emerald-800",
    },
  ];

  return (
    <div className="card p-7 md:p-8 bg-slate-900/90 border-slate-800 rounded-2xl shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950/80 border border-emerald-800/80 rounded-xl text-emerald-400">
            <Timer size={20} />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-100 uppercase tracking-wider">
              Severity-Classified SLA Benchmark Standards
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              Statutory emergency response standards vs. actual real-time field performance
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {benchmarks.map((bm) => (
          <div
            key={bm.level}
            className={`p-5 rounded-2xl bg-slate-950/80 border border-slate-800 border-l-4 ${bm.color} space-y-3 shadow-md hover:border-slate-700 transition-colors`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-slate-100">{bm.level}</span>
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${bm.badgeColor}`}>
                {bm.status}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">{bm.description}</p>

            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800/80 text-center font-mono">
              <div className="p-2 bg-slate-900/70 rounded-xl border border-white/5">
                <div className="text-xs text-slate-400 uppercase font-semibold">Target SLA</div>
                <div className="text-sm font-bold text-slate-200 font-stat mt-0.5">{bm.target}</div>
              </div>
              <div className="p-2 bg-slate-900/70 rounded-xl border border-white/5">
                <div className="text-xs text-slate-400 uppercase font-semibold">Actual Avg</div>
                <div className="text-sm font-bold text-blue-400 font-stat mt-0.5">{bm.actual}</div>
              </div>
              <div className="p-2 bg-slate-900/70 rounded-xl border border-white/5">
                <div className="text-xs text-slate-400 uppercase font-semibold">Compliance</div>
                <div className="text-sm font-bold text-emerald-400 font-stat mt-0.5">{bm.compliance}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SlaBenchmarkCard;

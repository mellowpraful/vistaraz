"use client";

import React from "react";
import { Zap, CheckCircle2, Bot, ShieldCheck, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface KpiItem {
  id: string;
  title: string;
  value: string;
  unit?: string;
  benchmark: string;
  trend: "positive" | "neutral" | "caution";
  trendText: string;
  icon: React.ReactNode;
  accentColor: string;
  borderColor: string;
  textColor: string;
}

export function AnalyticsKpiGrid() {
  const kpis: KpiItem[] = [
    {
      id: "response-time",
      title: "Avg Dispatch Response Time",
      value: "6.4",
      unit: "mins",
      benchmark: "Target: < 8.0 mins statutory SLA",
      trend: "positive",
      trendText: "⚡ 1.6m ahead of municipal target",
      icon: <Zap size={24} className="text-emerald-400" />,
      accentColor: "from-emerald-950/40 via-slate-900/90 to-slate-900",
      borderColor: "border-l-emerald-500",
      textColor: "text-emerald-400",
    },
    {
      id: "resolution-rate",
      title: "Incident Resolution Rate",
      value: "88.4%",
      benchmark: "125 of 142 emergency events resolved",
      trend: "positive",
      trendText: "▲ +4.2% from prior operational cycle",
      icon: <CheckCircle2 size={24} className="text-blue-400" />,
      accentColor: "from-blue-950/40 via-slate-900/90 to-slate-900",
      borderColor: "border-l-blue-500",
      textColor: "text-blue-400",
    },
    {
      id: "ai-acceptance",
      title: "AI Recommendation Acceptance",
      value: "92.5%",
      benchmark: "Commander authorized & verified",
      trend: "positive",
      trendText: "98% Explainability Trust Rating",
      icon: <Bot size={24} className="text-purple-400" />,
      accentColor: "from-purple-950/40 via-slate-900/90 to-slate-900",
      borderColor: "border-l-purple-500",
      textColor: "text-purple-400",
    },
    {
      id: "evacuation-count",
      title: "Citizens Safely Rescued / Evacuated",
      value: "418",
      benchmark: "Across 6 active disaster zones",
      trend: "positive",
      trendText: "0 critical infrastructure breaches",
      icon: <ShieldCheck size={24} className="text-amber-400" />,
      accentColor: "from-amber-950/40 via-slate-900/90 to-slate-900",
      borderColor: "border-l-amber-500",
      textColor: "text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi) => (
        <div
          key={kpi.id}
          className={`p-7 rounded-2xl bg-gradient-to-br ${kpi.accentColor} border border-white/10 border-l-4 ${kpi.borderColor} shadow-2xl space-y-4 transition-all hover:scale-[1.02] hover:border-white/20`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-mono font-bold tracking-wider">
              {kpi.title}
            </span>
            <div className="p-2.5 bg-slate-950/90 rounded-xl border border-white/5 shadow-inner">
              {kpi.icon}
            </div>
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <div className={`text-4xl md:text-5xl font-black font-stat ${kpi.textColor}`}>
              {kpi.value}
            </div>
            {kpi.unit && (
              <span className="text-base font-mono text-slate-400 font-semibold">{kpi.unit}</span>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-1.5 text-xs">
            <span className="text-slate-300 font-medium">{kpi.benchmark}</span>
            <span className="font-mono text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
              <ArrowUpRight size={14} />
              {kpi.trendText}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AnalyticsKpiGrid;

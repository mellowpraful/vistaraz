"use client";

import React from "react";
import { ResourceItem } from "./ResourceStatusModal";
import { Shield, CheckCircle2, Navigation, PauseCircle, Wrench, Activity } from "lucide-react";

interface ResourceStatsOverviewProps {
  resources: ResourceItem[];
  selectedStatus: string;
  onSelectStatusFilter: (status: string) => void;
}

export function ResourceStatsOverview({
  resources,
  selectedStatus,
  onSelectStatusFilter,
}: ResourceStatsOverviewProps) {
  const total = resources.length;
  const availableCount = resources.filter((r) => r.status === "AVAILABLE").length;
  const deployedCount = resources.filter((r) =>
    ["DISPATCHED", "EN_ROUTE", "ON_SCENE", "RETURNING"].includes(r.status)
  ).length;
  const standbyCount = resources.filter((r) => r.status === "STANDBY").length;
  const maintenanceCount = resources.filter((r) => r.status === "OUT_OF_SERVICE").length;

  const availabilityPct = total > 0 ? Math.round((availableCount / total) * 100) : 0;
  const deploymentPct = total > 0 ? Math.round((deployedCount / total) * 100) : 0;

  const stats = [
    {
      id: "ALL",
      label: "Total Fleet Registered",
      value: total,
      sub: "100% Monitored",
      icon: <Shield size={18} />,
      color: "#3b82f6",
      borderLeft: "border-l-blue-500",
      textColor: "text-blue-400",
    },
    {
      id: "AVAILABLE",
      label: "Available & Ready",
      value: availableCount,
      sub: `${availabilityPct}% Readiness`,
      icon: <CheckCircle2 size={18} />,
      color: "#4ade80",
      borderLeft: "border-l-emerald-500",
      textColor: "text-emerald-400",
    },
    {
      id: "DEPLOYED_GROUP",
      statusValue: "DEPLOYED",
      label: "Active Deployed",
      value: deployedCount,
      sub: `${deploymentPct}% In Field`,
      icon: <Navigation size={18} />,
      color: "#fb923c",
      borderLeft: "border-l-amber-500",
      textColor: "text-amber-400",
    },
    {
      id: "STANDBY",
      label: "Standby Reserve",
      value: standbyCount,
      sub: "Staged Units",
      icon: <PauseCircle size={18} />,
      color: "#9ca3af",
      borderLeft: "border-l-slate-500",
      textColor: "text-slate-300",
    },
    {
      id: "OUT_OF_SERVICE",
      label: "Out of Service",
      value: maintenanceCount,
      sub: "Maintenance / OOS",
      icon: <Wrench size={18} />,
      color: "#f87171",
      borderLeft: "border-l-red-500",
      textColor: "text-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((stat) => {
        const isSelected =
          selectedStatus === stat.id || (stat.id === "DEPLOYED_GROUP" && selectedStatus === "DISPATCHED");

        return (
          <button
            key={stat.id}
            type="button"
            onClick={() => {
              if (stat.id === "DEPLOYED_GROUP") {
                onSelectStatusFilter(selectedStatus === "DISPATCHED" ? "ALL" : "DISPATCHED");
              } else {
                onSelectStatusFilter(selectedStatus === stat.id ? "ALL" : stat.id);
              }
            }}
            className={`card p-4 space-y-2 text-left transition-all border-l-4 ${stat.borderLeft} ${
              isSelected
                ? "bg-slate-800/90 ring-1 ring-blue-400 shadow-lg scale-[1.02]"
                : "bg-slate-900/60 hover:bg-slate-800/50"
            }`}
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] uppercase font-mono font-semibold tracking-wider">
                {stat.label}
              </span>
              <span style={{ color: stat.color }}>{stat.icon}</span>
            </div>

            <div className="flex items-baseline justify-between">
              <div className={`text-2xl font-black font-mono ${stat.textColor}`}>{stat.value}</div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800">
                {stat.sub}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default ResourceStatsOverview;

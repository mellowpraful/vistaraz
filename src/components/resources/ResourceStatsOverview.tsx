"use client";

import React from "react";
import { ResourceItem } from "./ResourceStatusModal";
import { Shield, CheckCircle2, Navigation, PauseCircle, Wrench } from "lucide-react";

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
      label: "Total Fleet Units",
      value: total,
      sub: "100% telemetry synced",
      icon: Shield,
      color: "#3b82f6",
      bgClass: "bg-blue-500/10 border-blue-500/30 text-blue-400",
      accentBorder: "#3b82f6",
    },
    {
      id: "AVAILABLE",
      label: "Available & Ready",
      value: availableCount,
      sub: `${availabilityPct}% immediate readiness`,
      icon: CheckCircle2,
      color: "#22c55e",
      bgClass: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      accentBorder: "#22c55e",
    },
    {
      id: "DEPLOYED_GROUP",
      label: "Active Field Missions",
      value: deployedCount,
      sub: `${deploymentPct}% field deployment`,
      icon: Navigation,
      color: "#f59e0b",
      bgClass: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      accentBorder: "#f59e0b",
    },
    {
      id: "STANDBY",
      label: "Staged in Reserve",
      value: standbyCount,
      sub: "Stationed / on standby",
      icon: PauseCircle,
      color: "#94a3b8",
      bgClass: "bg-slate-500/10 border-slate-500/30 text-slate-400",
      accentBorder: "#94a3b8",
    },
    {
      id: "OUT_OF_SERVICE",
      label: "Out of Service",
      value: maintenanceCount,
      sub: "Maintenance / refit",
      icon: Wrench,
      color: "#ef4444",
      bgClass: "bg-red-500/10 border-red-500/30 text-red-400",
      accentBorder: "#ef4444",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
      {stats.map((stat) => {
        const Icon = stat.icon;
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
            className={`card p-6 rounded-2xl text-left flex flex-col justify-between min-h-[148px] transition-all duration-300 hover:translate-y-[-2px] hover:shadow-xl cursor-pointer ${
              isSelected
                ? "ring-2 ring-offset-2 ring-offset-transparent shadow-lg"
                : "hover:border-slate-700"
            }`}
            style={{
              borderColor: isSelected ? stat.accentBorder : undefined,
              boxShadow: isSelected ? `0 8px 24px ${stat.accentBorder}25` : undefined,
              borderLeft: `4px solid ${stat.accentBorder}`,
            }}
          >
            {/* Top row: Label + Icon */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                {stat.label}
              </span>
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                style={{
                  background: `${stat.color}18`,
                  border: `1px solid ${stat.color}35`,
                  color: stat.color,
                }}
              >
                <Icon size={16} />
              </div>
            </div>

            {/* Middle row: Big Number */}
            <div className="my-1">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-100 dark:text-slate-100">
                {stat.value}
              </span>
            </div>

            {/* Bottom row: Subtitle context */}
            <div
              className="text-xs font-medium pt-2 border-t border-slate-800/60 dark:border-slate-800/60"
              style={{ color: isSelected ? stat.color : "var(--text-muted)" }}
            >
              {stat.sub}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default ResourceStatsOverview;

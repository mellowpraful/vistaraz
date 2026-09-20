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
      bgHover: "rgba(59, 130, 246, 0.05)",
    },
    {
      id: "AVAILABLE",
      label: "Available & Ready",
      value: availableCount,
      sub: `${availabilityPct}% immediate readiness`,
      icon: CheckCircle2,
      color: "#22c55e",
      bgHover: "rgba(34, 197, 94, 0.05)",
    },
    {
      id: "DEPLOYED_GROUP",
      label: "Active Field Missions",
      value: deployedCount,
      sub: `${deploymentPct}% field deployment`,
      icon: Navigation,
      color: "#f59e0b",
      bgHover: "rgba(245, 158, 11, 0.05)",
    },
    {
      id: "STANDBY",
      label: "Staged in Reserve",
      value: standbyCount,
      sub: "Stationed / on standby",
      icon: PauseCircle,
      color: "#94a3b8",
      bgHover: "rgba(148, 163, 184, 0.05)",
    },
    {
      id: "OUT_OF_SERVICE",
      label: "Out of Service",
      value: maintenanceCount,
      sub: "Maintenance / refit",
      icon: Wrench,
      color: "#ef4444",
      bgHover: "rgba(239, 68, 68, 0.05)",
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
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
            style={{
              padding: "16px 18px",
              textAlign: "left",
              background: isSelected
                ? "linear-gradient(145deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)"
                : "rgba(15, 23, 42, 0.6)",
              border: isSelected
                ? `1px solid ${stat.color}`
                : "1px solid var(--border-primary)",
              borderLeft: `3px solid ${stat.color}`,
              borderRadius: "10px",
              cursor: "pointer",
              transition: "all 0.18s ease",
              boxShadow: isSelected ? `0 0 16px ${stat.color}25` : "none",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {/* Top row: Label + Icon */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
              <span className="metric-label" style={{ fontSize: "12px", fontWeight: "600" }}>
                {stat.label}
              </span>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "7px",
                  background: `${stat.color}15`,
                  border: `1px solid ${stat.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={14} color={stat.color} />
              </div>
            </div>

            {/* Middle row: Number */}
            <div className="data-value" style={{ fontSize: "26px", fontWeight: "700", color: "var(--text-primary)", lineHeight: "1.1" }}>
              {stat.value}
            </div>

            {/* Bottom row: Context subtitle */}
            <div style={{ fontSize: "11.5px", color: isSelected ? stat.color : "var(--text-muted)", fontWeight: "500" }}>
              {stat.sub}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default ResourceStatsOverview;

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ResourceItem } from "./ResourceStatusModal";
import { ResourceStatusBadge } from "./ResourceStatusBadge";
import { formatRelativeTime, parseEquipment, getTelemetryFreshness } from "@/lib/utils";
import { RESOURCE_TYPE_ICONS } from "@/lib/types";
import {
  MapPin,
  Clock,
  Gauge,
  Shield,
  Activity,
  Wrench,
  ExternalLink,
  Flame,
  CheckCircle2,
  AlertCircle,
  Radio,
  Sliders,
} from "lucide-react";

interface ResourceCardProps {
  resource: ResourceItem;
  onQuickStatusChange: (id: string, newStatus: string) => Promise<boolean>;
  onOpenStatusModal: (resource: ResourceItem) => void;
  isUpdating?: boolean;
}

const AGENCY_TYPE_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  FIRE: { text: "text-red-400", bg: "bg-red-950/40", border: "border-red-800/60" },
  MEDICAL: { text: "text-emerald-400", bg: "bg-emerald-950/40", border: "border-emerald-800/60" },
  POLICE: { text: "text-blue-400", bg: "bg-blue-950/40", border: "border-blue-800/60" },
  RESCUE: { text: "text-amber-400", bg: "bg-amber-950/40", border: "border-amber-800/60" },
  GOVERNMENT: { text: "text-purple-400", bg: "bg-purple-950/40", border: "border-purple-800/60" },
};

export function ResourceCard({
  resource,
  onQuickStatusChange,
  onOpenStatusModal,
  isUpdating = false,
}: ResourceCardProps) {
  const [actionError, setActionError] = useState<string | null>(null);

  const typeIcon = RESOURCE_TYPE_ICONS[resource.type] || "🛡️";
  const activeAssignment = resource.assignments?.[0];
  const telemetry = getTelemetryFreshness(resource.lastUpdated);

  // Agency styling
  const agencyType = resource.agency?.type?.toUpperCase() || "GOVERNMENT";
  const agencyStyle =
    AGENCY_TYPE_COLORS[agencyType] || {
      text: "text-slate-400",
      bg: "bg-slate-900/50",
      border: "border-slate-800",
    };

  // Workload bar color
  const workload = resource.currentWorkload ?? 0;
  const workloadColor =
    workload > 75
      ? "bg-red-500"
      : workload > 40
      ? "bg-amber-500"
      : "bg-emerald-500";

  // Reliability percentage
  const reliabilityPct = Math.round((resource.reliabilityScore ?? 1.0) * 100);

  // Aggregate all equipment from capabilities
  const allEquipment: string[] = [];
  resource.capabilities?.forEach((c) => {
    const parsed = parseEquipment(c.equipment);
    parsed.forEach((eq) => {
      if (!allEquipment.includes(eq)) allEquipment.push(eq);
    });
  });

  const handleAction = async (status: string) => {
    setActionError(null);
    const success = await onQuickStatusChange(resource.id, status);
    if (!success) {
      setActionError(`Failed to transition to ${status}`);
    }
  };

  return (
    <div className="card p-5 space-y-4 hover:border-slate-700 transition-all duration-200 flex flex-col justify-between relative bg-slate-900/70 backdrop-blur border-slate-800">
      {/* Top Section */}
      <div className="space-y-3.5">
        {/* Unit Identity & Status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <span className="text-2xl p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 leading-none">
              {typeIcon}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100 tracking-tight">{resource.name}</h3>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                {resource.agency && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${agencyStyle.bg} ${agencyStyle.text} ${agencyStyle.border}`}
                  >
                    {resource.agency.name}
                  </span>
                )}
                <span className="text-[10px] text-slate-500 font-mono">
                  {resource.type.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <ResourceStatusBadge status={resource.status} />
            {/* Telemetry freshness tag */}
            <div className="flex items-center gap-1 text-[10px] font-mono">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  telemetry.status === "live"
                    ? "bg-emerald-400 animate-ping"
                    : telemetry.status === "recent"
                    ? "bg-amber-400"
                    : "bg-slate-500"
                }`}
              />
              <span
                className={
                  telemetry.status === "live"
                    ? "text-emerald-400 font-medium"
                    : telemetry.status === "recent"
                    ? "text-amber-400"
                    : "text-slate-500"
                }
              >
                {telemetry.label}
              </span>
            </div>
          </div>
        </div>

        {/* Location & GPS */}
        <div className="p-2.5 bg-slate-950/50 rounded-lg border border-slate-800/60 flex items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-1.5 min-w-0 text-slate-300">
            <MapPin size={14} className="text-blue-400 flex-shrink-0" />
            <span className="truncate text-[11px] font-medium">
              {resource.locationName || (
                <span className="text-amber-400 italic">Location unassigned / Missing GPS</span>
              )}
            </span>
          </div>

          {resource.latitude && resource.longitude ? (
            <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">
              {resource.latitude.toFixed(3)}, {resource.longitude.toFixed(3)}
            </span>
          ) : (
            <span className="text-[10px] text-slate-600 font-mono flex-shrink-0">No GPS Fix</span>
          )}
        </div>

        {/* Telemetry Stats: Workload & Reliability */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-slate-950/30 rounded border border-slate-800/40 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Gauge size={12} className="text-slate-500" /> Workload
              </span>
              <span className="font-bold text-slate-200">{workload}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full ${workloadColor} transition-all duration-300`}
                style={{ width: `${Math.min(100, Math.max(0, workload))}%` }}
              />
            </div>
          </div>

          <div className="p-2 bg-slate-950/30 rounded border border-slate-800/40 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <Shield size={12} className="text-blue-400" /> Reliability
            </span>
            <span className="text-xs font-bold font-mono text-emerald-400">{reliabilityPct}%</span>
          </div>
        </div>

        {/* Capabilities Matrix */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-mono">
            <span>Operational Capabilities</span>
            <span>{resource.capabilities?.length || 0} active</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {resource.capabilities && resource.capabilities.length > 0 ? (
              resource.capabilities.map((c) => (
                <span
                  key={c.id}
                  className="text-[10px] bg-blue-950/50 border border-blue-900/60 text-blue-300 px-2 py-0.5 rounded font-mono font-medium"
                >
                  {c.capability.replace(/_/g, " ")}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-slate-600 italic">Standard Response Unit</span>
            )}
          </div>
        </div>

        {/* Equipment Loadout Breakdown */}
        {allEquipment.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-mono">
              <Wrench size={10} className="text-amber-400" />
              <span>Verified Equipment</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {allEquipment.slice(0, 4).map((eq, i) => (
                <span
                  key={i}
                  className="text-[9px] bg-slate-950 border border-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono"
                >
                  {eq}
                </span>
              ))}
              {allEquipment.length > 4 && (
                <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                  +{allEquipment.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Active Deployment Card */}
        {activeAssignment && (
          <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-lg text-xs space-y-1.5 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="text-[10px] text-amber-400 font-mono font-bold uppercase flex items-center gap-1">
                <Radio size={12} className="text-amber-400 animate-pulse" />
                Active Mission Assignment
              </div>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                  activeAssignment.incident.severity === "CRITICAL"
                    ? "bg-red-950 text-red-300 border border-red-800"
                    : "bg-amber-950 text-amber-300 border border-amber-800"
                }`}
              >
                {activeAssignment.incident.severity}
              </span>
            </div>
            <Link
              href={`/incidents/${activeAssignment.incident.id}`}
              className="font-semibold text-slate-200 hover:text-amber-300 transition-colors block truncate text-xs"
            >
              {activeAssignment.incident.title}
            </Link>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Status: {activeAssignment.status}</span>
              <span>Deployed {formatRelativeTime(activeAssignment.assignedAt)}</span>
            </div>
          </div>
        )}

        {/* Action Error Banner */}
        {actionError && (
          <div className="p-2 bg-red-950/70 border border-red-800 text-red-300 rounded text-[11px] flex items-center gap-1.5">
            <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
        )}
      </div>

      {/* Bottom Actions Bar */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1 flex-wrap">
          {resource.status !== "AVAILABLE" && (
            <button
              onClick={() => handleAction("AVAILABLE")}
              disabled={isUpdating}
              className="text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2 py-1 rounded hover:bg-emerald-900 transition-colors disabled:opacity-50"
            >
              Set Available
            </button>
          )}
          {["DISPATCHED", "EN_ROUTE"].includes(resource.status) && (
            <button
              onClick={() => handleAction("ON_SCENE")}
              disabled={isUpdating}
              className="text-[10px] font-semibold bg-purple-950/80 text-purple-300 border border-purple-800/80 px-2 py-1 rounded hover:bg-purple-900 transition-colors disabled:opacity-50"
            >
              Mark On Scene
            </button>
          )}
          {resource.status === "ON_SCENE" && (
            <button
              onClick={() => handleAction("RETURNING")}
              disabled={isUpdating}
              className="text-[10px] font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 px-2 py-1 rounded hover:bg-cyan-900 transition-colors disabled:opacity-50"
            >
              Returning
            </button>
          )}
          {resource.status !== "STANDBY" && resource.status !== "OUT_OF_SERVICE" && !activeAssignment && (
            <button
              onClick={() => handleAction("STANDBY")}
              disabled={isUpdating}
              className="text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 px-2 py-1 rounded hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Standby
            </button>
          )}
          {resource.status !== "OUT_OF_SERVICE" && (
            <button
              onClick={() => handleAction("OUT_OF_SERVICE")}
              disabled={isUpdating}
              className="text-[10px] font-semibold bg-red-950/80 text-red-300 border border-red-800/80 px-2 py-1 rounded hover:bg-red-900 transition-colors disabled:opacity-50"
            >
              OOS
            </button>
          )}
        </div>

        <button
          onClick={() => onOpenStatusModal(resource)}
          disabled={isUpdating}
          className="text-[11px] font-medium text-slate-400 hover:text-slate-100 flex items-center gap-1 p-1 rounded hover:bg-slate-800 transition-colors flex-shrink-0"
          title="Open advanced status control"
        >
          <Sliders size={13} />
          <span>Manage</span>
        </button>
      </div>
    </div>
  );
}

export default ResourceCard;

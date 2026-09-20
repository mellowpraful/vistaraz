"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ResourceItem } from "./ResourceStatusModal";
import { ResourceStatusBadge } from "./ResourceStatusBadge";
import { formatRelativeTime, parseEquipment, getTelemetryFreshness } from "@/lib/utils";
import {
  MapPin,
  Clock,
  Gauge,
  Shield,
  Activity,
  Wrench,
  Flame,
  Radio,
  Sliders,
  ChevronDown,
  ChevronUp,
  Truck,
  LifeBuoy,
  Anchor,
  Compass,
  HeartPulse,
  AlertCircle,
  LucideIcon,
} from "lucide-react";

interface ResourceCardProps {
  resource: ResourceItem;
  onQuickStatusChange: (id: string, newStatus: string) => Promise<boolean>;
  onOpenStatusModal: (resource: ResourceItem) => void;
  isUpdating?: boolean;
}

const RESOURCE_ICONS: Record<string, LucideIcon> = {
  AMBULANCE: Truck,
  FIRE_ENGINE: Flame,
  RESCUE_TEAM: LifeBuoy,
  POLICE_UNIT: Shield,
  MEDICAL_TEAM: HeartPulse,
  BOAT: Anchor,
  DRONE: Radio,
  HELICOPTER: Compass,
  HAZMAT_UNIT: Shield,
  SEARCH_DOG_UNIT: LifeBuoy,
  RELIEF_VEHICLE: Truck,
};

const STATUS_ACCENTS: Record<string, { border: string; bgHint: string }> = {
  AVAILABLE: { border: "#22c55e", bgHint: "rgba(34, 197, 94, 0.03)" },
  DISPATCHED: { border: "#f59e0b", bgHint: "rgba(245, 158, 11, 0.04)" },
  EN_ROUTE: { border: "#3b82f6", bgHint: "rgba(59, 130, 246, 0.04)" },
  ON_SCENE: { border: "#a855f7", bgHint: "rgba(168, 85, 247, 0.04)" },
  RETURNING: { border: "#06b6d4", bgHint: "rgba(6, 182, 212, 0.04)" },
  STANDBY: { border: "#64748b", bgHint: "transparent" },
  OUT_OF_SERVICE: { border: "#ef4444", bgHint: "rgba(239, 68, 68, 0.04)" },
};

export function ResourceCard({
  resource,
  onQuickStatusChange,
  onOpenStatusModal,
  isUpdating = false,
}: ResourceCardProps) {
  const [actionError, setActionError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const TypeIcon = RESOURCE_ICONS[resource.type] || Shield;
  const activeAssignment = resource.assignments?.[0];
  const telemetry = getTelemetryFreshness(resource.lastUpdated);
  const accent = STATUS_ACCENTS[resource.status] || STATUS_ACCENTS.STANDBY;

  const workload = resource.currentWorkload ?? 0;
  const workloadColor =
    workload > 75 ? "#ef4444" : workload > 40 ? "#f59e0b" : "#22c55e";

  const reliabilityPct = Math.round((resource.reliabilityScore ?? 1.0) * 100);

  // Aggregate equipment from capabilities
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
      setActionError(`Failed to update to ${status.replace(/_/g, " ")}`);
    }
  };

  return (
    <div
      className="card p-6 sm:p-7 rounded-3xl space-y-6 flex flex-col justify-between shadow-xl hover:shadow-2xl transition-all duration-300 relative group border-slate-800"
      style={{
        borderLeft: `5px solid ${accent.border}`,
      }}
    >
      <div className="space-y-5">
        {/* 1. Unit Identity & Status Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner transition-transform group-hover:scale-105"
              style={{
                background: `${accent.border}15`,
                border: `1px solid ${accent.border}35`,
                color: accent.border,
              }}
            >
              <TypeIcon size={24} />
            </div>

            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-slate-100 dark:text-slate-100 tracking-tight truncate">
                {resource.name}
              </h3>

              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {resource.agency && (
                  <span className="text-xs font-semibold text-slate-300 dark:text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60 font-mono">
                    {resource.agency.name}
                  </span>
                )}
                <span className="text-xs text-slate-400 font-mono">
                  {resource.type.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          </div>

          {/* Right Status & Telemetry */}
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <ResourceStatusBadge status={resource.status} size="sm" />
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{
                  background:
                    telemetry.status === "live"
                      ? "#22c55e"
                      : telemetry.status === "recent"
                      ? "#f59e0b"
                      : "#64748b",
                }}
              />
              <span className="text-slate-400">{telemetry.label}</span>
            </div>
          </div>
        </div>

        {/* 2. Location & Coordinate Telemetry */}
        <div className="p-3.5 bg-slate-950/60 dark:bg-slate-950/60 rounded-2xl border border-slate-800/80 flex items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin size={15} className="text-blue-400 flex-shrink-0" />
            <span className="text-slate-300 dark:text-slate-300 font-medium truncate">
              {resource.locationName || <span className="text-amber-400 italic font-mono">Location unassigned</span>}
            </span>
          </div>

          <span className="font-mono text-xs text-slate-400 flex-shrink-0">
            {resource.latitude && resource.longitude
              ? `${resource.latitude.toFixed(3)}, ${resource.longitude.toFixed(3)}`
              : "No GPS"}
          </span>
        </div>

        {/* 3. Operational Readiness & Workload */}
        <div className="grid grid-cols-2 gap-3.5">
          <div className="p-3.5 bg-slate-950/60 dark:bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono uppercase text-[11px]">Workload</span>
              <span className="font-mono font-bold text-slate-200">
                {workload}%
              </span>
            </div>
            <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div
                style={{
                  width: `${Math.min(100, Math.max(0, workload))}%`,
                  background: workloadColor,
                }}
                className="h-full rounded-full transition-all duration-500"
              />
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/60 dark:bg-slate-950/60 rounded-2xl border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400 font-mono uppercase text-[11px]">Reliability</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {reliabilityPct}%
            </span>
          </div>
        </div>

        {/* 4. Capabilities Matrix */}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            {resource.capabilities && resource.capabilities.length > 0 ? (
              resource.capabilities.slice(0, 3).map((c) => (
                <span
                  key={c.id}
                  className="text-xs font-semibold text-blue-300 bg-blue-950/60 border border-blue-800/70 px-2.5 py-1 rounded-lg font-mono"
                >
                  {c.capability.replace(/_/g, " ")}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 font-mono italic">
                Standard Multi-Role Unit
              </span>
            )}
            {resource.capabilities && resource.capabilities.length > 3 && (
              <span className="text-xs text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md font-mono">
                +{resource.capabilities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* 5. Active Mission Assignment Banner (if deployed) */}
        {activeAssignment && (
          <div className="p-4 bg-amber-950/30 border border-amber-800/60 rounded-2xl space-y-1.5 animate-slide-in">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Radio size={13} className="animate-pulse" />
                Active Mission
              </div>
              <span
                className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
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
              className="text-sm font-bold text-slate-100 hover:text-blue-400 transition-colors block truncate"
            >
              {activeAssignment.incident.title}
            </Link>
            <div className="text-xs text-slate-400 font-mono">
              Assigned {formatRelativeTime(activeAssignment.assignedAt)}
            </div>
          </div>
        )}

        {/* 6. Expandable Equipment & Specs Toggle */}
        {allEquipment.length > 0 && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer font-mono"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              <span>{expanded ? "Hide equipment specs" : `View equipment specs (${allEquipment.length})`}</span>
            </button>

            {expanded && (
              <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-wrap gap-1.5 animate-slide-in">
                {allEquipment.map((eq, i) => (
                  <span
                    key={i}
                    className="text-xs text-slate-300 bg-slate-900 border border-slate-700/80 px-2.5 py-0.5 rounded-lg font-mono"
                  >
                    {eq}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Error Banner */}
        {actionError && (
          <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <AlertCircle size={15} className="flex-shrink-0 text-red-400" />
            <span>{actionError}</span>
          </div>
        )}
      </div>

      {/* 7. Bottom Action Bar */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {resource.status !== "AVAILABLE" && (
            <button
              onClick={() => handleAction("AVAILABLE")}
              disabled={isUpdating}
              className="btn btn-secondary text-xs px-3 py-1.5 text-emerald-400 hover:text-emerald-300 border-emerald-800/80 hover:bg-emerald-950/40 rounded-xl"
            >
              Set Available
            </button>
          )}
          {["DISPATCHED", "EN_ROUTE"].includes(resource.status) && (
            <button
              onClick={() => handleAction("ON_SCENE")}
              disabled={isUpdating}
              className="btn btn-secondary text-xs px-3 py-1.5 text-purple-400 hover:text-purple-300 border-purple-800/80 hover:bg-purple-950/40 rounded-xl"
            >
              On Scene
            </button>
          )}
          {resource.status === "ON_SCENE" && (
            <button
              onClick={() => handleAction("RETURNING")}
              disabled={isUpdating}
              className="btn btn-secondary text-xs px-3 py-1.5 text-cyan-400 hover:text-cyan-300 border-cyan-800/80 hover:bg-cyan-950/40 rounded-xl"
            >
              Returning
            </button>
          )}
          {resource.status !== "STANDBY" && resource.status !== "OUT_OF_SERVICE" && !activeAssignment && (
            <button
              onClick={() => handleAction("STANDBY")}
              disabled={isUpdating}
              className="btn btn-secondary text-xs px-3 py-1.5 text-slate-400 hover:text-slate-300 rounded-xl"
            >
              Standby
            </button>
          )}
          {resource.status !== "OUT_OF_SERVICE" && (
            <button
              onClick={() => handleAction("OUT_OF_SERVICE")}
              disabled={isUpdating}
              className="btn btn-secondary text-xs px-3 py-1.5 text-red-400 hover:text-red-300 border-red-800/80 hover:bg-red-950/40 rounded-xl"
            >
              OOS
            </button>
          )}
        </div>

        <button
          onClick={() => onOpenStatusModal(resource)}
          disabled={isUpdating}
          className="btn btn-secondary text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 font-medium ml-auto"
          title="Open advanced resource management"
        >
          <Sliders size={13} />
          <span>Manage</span>
        </button>
      </div>
    </div>
  );
}

export default ResourceCard;

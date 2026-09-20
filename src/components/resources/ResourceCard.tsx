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
      style={{
        background: `linear-gradient(145deg, rgba(15, 23, 42, 0.85) 0%, rgba(10, 15, 30, 0.95) 100%)`,
        border: "1px solid var(--border-primary)",
        borderLeft: `4px solid ${accent.border}`,
        borderRadius: "12px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "14px",
        transition: "transform 0.15s ease, border-color 0.15s ease",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* 1. Unit Identity & Status Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: `${accent.border}15`,
                border: `1px solid ${accent.border}35`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <TypeIcon size={20} color={accent.border} />
            </div>

            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "var(--text-primary)",
                  letterSpacing: "-0.2px",
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {resource.name}
              </h3>

              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px", flexWrap: "wrap" }}>
                {resource.agency && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "500",
                      color: "var(--text-secondary)",
                      background: "rgba(255, 255, 255, 0.05)",
                      padding: "1px 6px",
                      borderRadius: "4px",
                      border: "1px solid var(--border-primary)",
                    }}
                  >
                    {resource.agency.name}
                  </span>
                )}
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  {resource.type.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          </div>

          {/* Right Status & Telemetry */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
            <ResourceStatusBadge status={resource.status} size="sm" />
            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10.5px" }}>
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background:
                    telemetry.status === "live"
                      ? "#22c55e"
                      : telemetry.status === "recent"
                      ? "#f59e0b"
                      : "#64748b",
                  display: "inline-block",
                }}
              />
              <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>{telemetry.label}</span>
            </div>
          </div>
        </div>

        {/* 2. Location & Coordinate Telemetry */}
        <div
          style={{
            padding: "8px 12px",
            background: "rgba(255, 255, 255, 0.02)",
            borderRadius: "8px",
            border: "1px solid var(--border-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "12px",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
            <MapPin size={13} color="#60a5fa" style={{ flexShrink: 0 }} />
            <span
              style={{
                color: resource.locationName ? "var(--text-secondary)" : "#f59e0b",
                fontStyle: resource.locationName ? "normal" : "italic",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {resource.locationName || "Location unassigned"}
            </span>
          </div>

          <span className="technical" style={{ fontSize: "11px", color: "var(--text-muted)", flexShrink: 0 }}>
            {resource.latitude && resource.longitude
              ? `${resource.latitude.toFixed(3)}, ${resource.longitude.toFixed(3)}`
              : "No GPS"}
          </span>
        </div>

        {/* 3. Operational Readiness & Workload */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <div
            style={{
              padding: "8px 10px",
              background: "rgba(255, 255, 255, 0.02)",
              borderRadius: "8px",
              border: "1px solid var(--border-primary)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px" }}>
              <span className="metric-label" style={{ fontSize: "11px" }}>Workload</span>
              <span className="technical" style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-primary)" }}>
                {workload}%
              </span>
            </div>
            <div style={{ height: "4px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "3px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${Math.min(100, Math.max(0, workload))}%`,
                  height: "100%",
                  background: workloadColor,
                  borderRadius: "3px",
                  transition: "width 0.3s",
                }}
              />
            </div>
          </div>

          <div
            style={{
              padding: "8px 10px",
              background: "rgba(255, 255, 255, 0.02)",
              borderRadius: "8px",
              border: "1px solid var(--border-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span className="metric-label" style={{ fontSize: "11px" }}>Reliability</span>
            <span className="data-value" style={{ fontSize: "13px", fontWeight: "600", color: "#22c55e" }}>
              {reliabilityPct}%
            </span>
          </div>
        </div>

        {/* 4. Capabilities Matrix */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            {resource.capabilities && resource.capabilities.length > 0 ? (
              resource.capabilities.slice(0, 3).map((c) => (
                <span
                  key={c.id}
                  style={{
                    fontSize: "11px",
                    fontWeight: "500",
                    color: "#93c5fd",
                    background: "rgba(37, 99, 235, 0.15)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    padding: "2px 8px",
                    borderRadius: "5px",
                  }}
                >
                  {c.capability.replace(/_/g, " ")}
                </span>
              ))
            ) : (
              <span style={{ fontSize: "11.5px", color: "var(--text-muted)", fontStyle: "italic" }}>
                Standard Multi-Role Unit
              </span>
            )}
            {resource.capabilities && resource.capabilities.length > 3 && (
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                +{resource.capabilities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* 5. Active Mission Assignment Banner (if deployed) */}
        {activeAssignment && (
          <div
            style={{
              padding: "10px 12px",
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: "8px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: "10.5px", fontWeight: "700", color: "#f59e0b", letterSpacing: "0.4px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "5px" }}>
                <Radio size={11} className="animate-pulse" />
                Active Mission
              </div>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: "700",
                  padding: "1px 5px",
                  borderRadius: "4px",
                  color: activeAssignment.incident.severity === "CRITICAL" ? "#f87171" : "#fbbf24",
                  background: activeAssignment.incident.severity === "CRITICAL" ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)",
                }}
              >
                {activeAssignment.incident.severity}
              </span>
            </div>
            <Link
              href={`/incidents/${activeAssignment.incident.id}`}
              style={{ fontSize: "12.5px", fontWeight: "600", color: "var(--text-primary)", textDecoration: "none" }}
            >
              {activeAssignment.incident.title}
            </Link>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              Assigned {formatRelativeTime(activeAssignment.assignedAt)}
            </div>
          </div>
        )}

        {/* 6. Expandable Equipment & Specs Toggle */}
        {allEquipment.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                color: "var(--text-muted)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "2px 0",
              }}
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              <span>{expanded ? "Hide equipment specs" : `View equipment specs (${allEquipment.length})`}</span>
            </button>

            {expanded && (
              <div
                style={{
                  marginTop: "6px",
                  padding: "8px 10px",
                  background: "rgba(3, 7, 18, 0.5)",
                  borderRadius: "6px",
                  border: "1px solid var(--border-primary)",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "4px",
                }}
              >
                {allEquipment.map((eq, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: "10.5px",
                      color: "var(--text-secondary)",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid var(--border-primary)",
                      padding: "1px 6px",
                      borderRadius: "4px",
                    }}
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
          <div
            style={{
              padding: "6px 10px",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "6px",
              fontSize: "11px",
              color: "#f87171",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <AlertCircle size={13} style={{ flexShrink: 0 }} />
            <span>{actionError}</span>
          </div>
        )}
      </div>

      {/* 7. Bottom Action Bar */}
      <div
        style={{
          paddingTop: "12px",
          borderTop: "1px solid var(--border-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          {resource.status !== "AVAILABLE" && (
            <button
              onClick={() => handleAction("AVAILABLE")}
              disabled={isUpdating}
              className="btn btn-secondary"
              style={{
                fontSize: "11.5px",
                padding: "3px 8px",
                color: "#4ade80",
                borderColor: "rgba(34, 197, 94, 0.3)",
              }}
            >
              Set Available
            </button>
          )}
          {["DISPATCHED", "EN_ROUTE"].includes(resource.status) && (
            <button
              onClick={() => handleAction("ON_SCENE")}
              disabled={isUpdating}
              className="btn btn-secondary"
              style={{
                fontSize: "11.5px",
                padding: "3px 8px",
                color: "#c084fc",
                borderColor: "rgba(168, 85, 247, 0.3)",
              }}
            >
              On Scene
            </button>
          )}
          {resource.status === "ON_SCENE" && (
            <button
              onClick={() => handleAction("RETURNING")}
              disabled={isUpdating}
              className="btn btn-secondary"
              style={{
                fontSize: "11.5px",
                padding: "3px 8px",
                color: "#22d3ee",
                borderColor: "rgba(6, 182, 212, 0.3)",
              }}
            >
              Returning
            </button>
          )}
          {resource.status !== "STANDBY" && resource.status !== "OUT_OF_SERVICE" && !activeAssignment && (
            <button
              onClick={() => handleAction("STANDBY")}
              disabled={isUpdating}
              className="btn btn-secondary"
              style={{
                fontSize: "11.5px",
                padding: "3px 8px",
                color: "var(--text-muted)",
              }}
            >
              Standby
            </button>
          )}
          {resource.status !== "OUT_OF_SERVICE" && (
            <button
              onClick={() => handleAction("OUT_OF_SERVICE")}
              disabled={isUpdating}
              className="btn btn-secondary"
              style={{
                fontSize: "11.5px",
                padding: "3px 8px",
                color: "#f87171",
                borderColor: "rgba(239, 68, 68, 0.3)",
              }}
            >
              OOS
            </button>
          )}
        </div>

        <button
          onClick={() => onOpenStatusModal(resource)}
          disabled={isUpdating}
          className="btn btn-secondary"
          style={{ fontSize: "11.5px", padding: "4px 10px", display: "flex", alignItems: "center", gap: "4px" }}
          title="Open advanced resource management"
        >
          <Sliders size={12} />
          <span>Manage</span>
        </button>
      </div>
    </div>
  );
}

export default ResourceCard;

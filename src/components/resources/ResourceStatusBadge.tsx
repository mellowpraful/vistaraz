import React from "react";
import { ResourceStatus } from "@/lib/types";

interface ResourceStatusBadgeProps {
  status: ResourceStatus | string;
  className?: string;
  showDot?: boolean;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; pulse?: boolean }
> = {
  AVAILABLE: {
    label: "Available & Ready",
    color: "#4ade80",
    bg: "rgba(5, 46, 22, 0.7)",
    border: "#15803d",
  },
  DISPATCHED: {
    label: "Dispatched",
    color: "#fb923c",
    bg: "rgba(67, 20, 7, 0.7)",
    border: "#9a3412",
    pulse: true,
  },
  EN_ROUTE: {
    label: "En Route",
    color: "#60a5fa",
    bg: "rgba(30, 58, 95, 0.7)",
    border: "#1d4ed8",
    pulse: true,
  },
  ON_SCENE: {
    label: "On Scene",
    color: "#c084fc",
    bg: "rgba(59, 7, 100, 0.7)",
    border: "#6b21a8",
    pulse: true,
  },
  RETURNING: {
    label: "Returning to Base",
    color: "#22d3ee",
    bg: "rgba(8, 51, 68, 0.7)",
    border: "#0e7490",
  },
  STANDBY: {
    label: "Standby Reserve",
    color: "#9ca3af",
    bg: "rgba(17, 24, 39, 0.7)",
    border: "#374151",
  },
  OUT_OF_SERVICE: {
    label: "Out of Service",
    color: "#f87171",
    bg: "rgba(69, 10, 10, 0.7)",
    border: "#7f1d1d",
  },
};

export function ResourceStatusBadge({
  status,
  className = "",
  showDot = true,
  size = "md",
}: ResourceStatusBadgeProps) {
  const normStatus = (status || "STANDBY").toUpperCase();
  const config = STATUS_CONFIG[normStatus] || {
    label: normStatus.replace(/_/g, " "),
    color: "#9ca3af",
    bg: "#111827",
    border: "#374151",
  };

  const isSmall = size === "sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-semibold uppercase tracking-wider rounded border ${
        config.pulse ? "animate-pulse" : ""
      } ${className}`}
      style={{
        color: config.color,
        backgroundColor: config.bg,
        borderColor: config.border,
        fontSize: isSmall ? "10px" : "11px",
        padding: isSmall ? "1px 6px" : "3px 8px",
      }}
    >
      {showDot && (
        <span
          className="rounded-full flex-shrink-0"
          style={{
            width: isSmall ? "5px" : "6px",
            height: isSmall ? "5px" : "6px",
            backgroundColor: config.color,
            boxShadow: config.pulse ? `0 0 8px ${config.color}` : "none",
          }}
        />
      )}
      <span>{config.label}</span>
    </span>
  );
}

export default ResourceStatusBadge;

import React from "react";

type SeverityVariant = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
type StatusVariant =
  | "REPORTED"
  | "VERIFIED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";
type ResourceVariant =
  | "AVAILABLE"
  | "DISPATCHED"
  | "EN_ROUTE"
  | "ON_SCENE"
  | "RETURNING"
  | "OUT_OF_SERVICE"
  | "STANDBY";

type BadgeVariant =
  | SeverityVariant
  | StatusVariant
  | ResourceVariant
  | "AI"
  | "SUGGESTED"
  | "AWAITING_APPROVAL"
  | "APPROVED"
  | "EXECUTED"
  | "SANDBOX"
  | "LIVE";

interface BadgeProps {
  variant: BadgeVariant;
  children?: React.ReactNode;
  className?: string;
  pulse?: boolean;
  dot?: boolean;
}

const VARIANT_STYLES: Record<
  string,
  { color: string; bg: string; border: string }
> = {
  // Severity
  CRITICAL:        { color: "#f87171", bg: "#450a0a", border: "#7f1d1d" },
  HIGH:            { color: "#fb923c", bg: "#431407", border: "#7c2d12" },
  MEDIUM:          { color: "#fbbf24", bg: "#451a03", border: "#78350f" },
  LOW:             { color: "#4ade80", bg: "#052e16", border: "#14532d" },
  UNKNOWN:         { color: "#9ca3af", bg: "#111827", border: "#374151" },
  // Status
  REPORTED:        { color: "#60a5fa", bg: "#1e3a5f", border: "#1d4ed8" },
  VERIFIED:        { color: "#c084fc", bg: "#3b0764", border: "#6b21a8" },
  ASSIGNED:        { color: "#818cf8", bg: "#1e1b4b", border: "#3730a3" },
  IN_PROGRESS:     { color: "#fb923c", bg: "#431407", border: "#9a3412" },
  RESOLVED:        { color: "#4ade80", bg: "#052e16", border: "#15803d" },
  CLOSED:          { color: "#6b7280", bg: "#111827", border: "#374151" },
  // Resource
  AVAILABLE:       { color: "#4ade80", bg: "#052e16", border: "#15803d" },
  DISPATCHED:      { color: "#fb923c", bg: "#431407", border: "#9a3412" },
  EN_ROUTE:        { color: "#60a5fa", bg: "#1e3a5f", border: "#1d4ed8" },
  ON_SCENE:        { color: "#c084fc", bg: "#3b0764", border: "#6b21a8" },
  RETURNING:       { color: "#22d3ee", bg: "#083344", border: "#0e7490" },
  OUT_OF_SERVICE:  { color: "#f87171", bg: "#450a0a", border: "#7f1d1d" },
  STANDBY:         { color: "#9ca3af", bg: "#111827", border: "#374151" },
  // Special
  AI:              { color: "#c084fc", bg: "#3b0764", border: "#6b21a8" },
  SUGGESTED:       { color: "#93c5fd", bg: "#1e3a5f", border: "#1d4ed8" },
  AWAITING_APPROVAL:{ color: "#fbbf24", bg: "#451a03", border: "#78350f" },
  APPROVED:        { color: "#4ade80", bg: "#052e16", border: "#15803d" },
  EXECUTED:        { color: "#9ca3af", bg: "#111827", border: "#374151" },
  SANDBOX:         { color: "#fb923c", bg: "#431407", border: "#7c2d12" },
  LIVE:            { color: "#4ade80", bg: "#052e16", border: "#14532d" },
};

export function Badge({ variant, children, pulse, dot }: BadgeProps) {
  const s = VARIANT_STYLES[variant] ?? VARIANT_STYLES.UNKNOWN;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "2px 8px",
        borderRadius: "4px",
        fontSize: "11px",
        fontWeight: "600",
        letterSpacing: "0.5px",
        textTransform: "uppercase",
        border: `1px solid ${s.border}`,
        background: s.bg,
        color: s.color,
        animation: pulse ? "pulse-critical 2s ease-in-out infinite" : undefined,
        whiteSpace: "nowrap",
      }}
    >
      {dot && (
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: s.color,
            flexShrink: 0,
          }}
        />
      )}
      {children ?? variant.replace(/_/g, " ")}
    </span>
  );
}

export default Badge;

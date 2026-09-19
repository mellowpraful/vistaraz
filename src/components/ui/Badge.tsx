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
  { color: string; bg: string; border: string; glow?: string }
> = {
  // Severity
  CRITICAL:        { color: "#f87171", bg: "rgba(69, 10, 10, 0.75)", border: "rgba(239, 68, 68, 0.5)", glow: "0 0 10px rgba(239, 68, 68, 0.3)" },
  HIGH:            { color: "#fb923c", bg: "rgba(67, 20, 7, 0.75)", border: "rgba(249, 115, 22, 0.5)", glow: "0 0 8px rgba(249, 115, 22, 0.25)" },
  MEDIUM:          { color: "#fbbf24", bg: "rgba(69, 26, 3, 0.75)", border: "rgba(234, 179, 8, 0.45)" },
  LOW:             { color: "#4ade80", bg: "rgba(5, 46, 22, 0.75)", border: "rgba(34, 197, 94, 0.45)" },
  UNKNOWN:         { color: "#94a3b8", bg: "rgba(15, 23, 42, 0.75)", border: "rgba(51, 65, 85, 0.6)" },
  // Status
  REPORTED:        { color: "#60a5fa", bg: "rgba(30, 58, 95, 0.75)", border: "rgba(59, 130, 246, 0.5)" },
  VERIFIED:        { color: "#c084fc", bg: "rgba(59, 7, 100, 0.75)", border: "rgba(168, 85, 247, 0.5)" },
  ASSIGNED:        { color: "#818cf8", bg: "rgba(30, 27, 75, 0.75)", border: "rgba(99, 102, 241, 0.5)" },
  IN_PROGRESS:     { color: "#fb923c", bg: "rgba(67, 20, 7, 0.75)", border: "rgba(249, 115, 22, 0.5)" },
  RESOLVED:        { color: "#4ade80", bg: "rgba(5, 46, 22, 0.75)", border: "rgba(34, 197, 94, 0.5)" },
  CLOSED:          { color: "#64748b", bg: "rgba(15, 23, 42, 0.75)", border: "rgba(51, 65, 85, 0.6)" },
  // Resource
  AVAILABLE:       { color: "#4ade80", bg: "rgba(5, 46, 22, 0.75)", border: "rgba(34, 197, 94, 0.5)", glow: "0 0 8px rgba(34, 197, 94, 0.25)" },
  DISPATCHED:      { color: "#fb923c", bg: "rgba(67, 20, 7, 0.75)", border: "rgba(249, 115, 22, 0.5)" },
  EN_ROUTE:        { color: "#60a5fa", bg: "rgba(30, 58, 95, 0.75)", border: "rgba(59, 130, 246, 0.5)" },
  ON_SCENE:        { color: "#c084fc", bg: "rgba(59, 7, 100, 0.75)", border: "rgba(168, 85, 247, 0.5)" },
  RETURNING:       { color: "#22d3ee", bg: "rgba(8, 51, 68, 0.75)", border: "rgba(6, 182, 212, 0.5)" },
  OUT_OF_SERVICE:  { color: "#f87171", bg: "rgba(69, 10, 10, 0.75)", border: "rgba(239, 68, 68, 0.5)" },
  STANDBY:         { color: "#94a3b8", bg: "rgba(15, 23, 42, 0.75)", border: "rgba(51, 65, 85, 0.6)" },
  // Special
  AI:              { color: "#c084fc", bg: "rgba(59, 7, 100, 0.8)", border: "rgba(168, 85, 247, 0.6)", glow: "0 0 10px rgba(168, 85, 247, 0.3)" },
  SUGGESTED:       { color: "#93c5fd", bg: "rgba(30, 58, 95, 0.75)", border: "rgba(59, 130, 246, 0.5)" },
  AWAITING_APPROVAL:{ color: "#fbbf24", bg: "rgba(69, 26, 3, 0.75)", border: "rgba(234, 179, 8, 0.5)" },
  APPROVED:        { color: "#4ade80", bg: "rgba(5, 46, 22, 0.75)", border: "rgba(34, 197, 94, 0.5)" },
  EXECUTED:        { color: "#94a3b8", bg: "rgba(15, 23, 42, 0.75)", border: "rgba(51, 65, 85, 0.6)" },
  SANDBOX:         { color: "#fb923c", bg: "rgba(67, 20, 7, 0.75)", border: "rgba(249, 115, 22, 0.5)" },
  LIVE:            { color: "#4ade80", bg: "rgba(5, 46, 22, 0.8)", border: "rgba(34, 197, 94, 0.6)", glow: "0 0 10px rgba(34, 197, 94, 0.35)" },
};

export function Badge({ variant, children, pulse, dot }: BadgeProps) {
  const s = VARIANT_STYLES[variant] ?? VARIANT_STYLES.UNKNOWN;
  const isCritical = variant === "CRITICAL" || pulse;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 9px",
        borderRadius: "5px",
        fontSize: "10.5px",
        fontWeight: "700",
        letterSpacing: "0.6px",
        textTransform: "uppercase",
        border: `1px solid ${s.border}`,
        background: s.bg,
        color: s.color,
        boxShadow: s.glow ?? "none",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        animation: isCritical ? "pulse-critical 2s ease-in-out infinite" : undefined,
        whiteSpace: "nowrap",
      }}
    >
      {dot && (
        <span
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "7px",
            height: "7px",
          }}
        >
          {isCritical && (
            <span
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: s.color,
                opacity: 0.75,
                animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
              }}
            />
          )}
          <span
            style={{
              position: "relative",
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: s.color,
              boxShadow: `0 0 6px ${s.color}`,
              flexShrink: 0,
            }}
          />
        </span>
      )}
      {children ?? variant.replace(/_/g, " ")}
    </span>
  );
}

export default Badge;

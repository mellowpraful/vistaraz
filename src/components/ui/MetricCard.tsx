import React from "react";

interface MetricCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  sub?: string;
  color?: string;
  href?: string;
  trend?: { direction: "up" | "down" | "stable"; label: string };
  pulse?: boolean;
}

export function MetricCard({
  icon,
  value,
  label,
  sub,
  color = "#3b82f6",
  href,
  trend,
  pulse,
}: MetricCardProps) {
  const [hovered, setHovered] = React.useState(false);

  const content = (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "var(--bg-card-hover)" : "var(--bg-card)",
        borderTop: `2px solid ${color}`,
        borderRight: `1px solid ${hovered ? color + "60" : color + "20"}`,
        borderBottom: `1px solid ${hovered ? color + "60" : color + "20"}`,
        borderLeft: `1px solid ${hovered ? color + "60" : color + "20"}`,
        borderRadius: "8px",
        padding: "18px",
        transition: "all 0.2s",
        cursor: href ? "pointer" : "default",
        boxShadow: hovered ? `0 0 20px ${color}20` : "none",
        animation: pulse ? "pulse-critical 2s ease-in-out infinite" : undefined,
        height: "100%",
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "14px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: color + "15",
            border: `1px solid ${color}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: color,
          }}
        >
          {icon}
        </div>
        {sub && (
          <span
            style={{
              fontSize: "10px",
              color: "var(--text-muted)",
              background: "var(--bg-elevated)",
              padding: "2px 8px",
              borderRadius: "4px",
              border: "1px solid var(--border-primary)",
            }}
          >
            {sub}
          </span>
        )}
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: "34px",
          fontWeight: "800",
          color: color,
          letterSpacing: "-1.5px",
          lineHeight: "1",
          marginBottom: "6px",
        }}
      >
        {value}
      </div>

      {/* Label + trend */}
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>
          {label}
        </div>
        {trend && (
          <span
            style={{
              fontSize: "10px",
              fontWeight: "600",
              color:
                trend.direction === "up"
                  ? "#4ade80"
                  : trend.direction === "down"
                  ? "#f87171"
                  : "var(--text-muted)",
            }}
          >
            {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→"}{" "}
            {trend.label}
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} style={{ textDecoration: "none", display: "block" }}>
        {content}
      </a>
    );
  }
  return content;
}

export default MetricCard;

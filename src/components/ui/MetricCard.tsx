import React from "react";
import Link from "next/link";

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
        background: hovered
          ? `linear-gradient(145deg, rgba(21, 31, 50, 0.95) 0%, rgba(15, 22, 35, 0.95) 100%)`
          : `linear-gradient(145deg, rgba(15, 22, 35, 0.85) 0%, rgba(10, 14, 23, 0.85) 100%)`,
        borderStyle: "solid",
        borderTopWidth: "2px",
        borderRightWidth: "1px",
        borderBottomWidth: "1px",
        borderLeftWidth: "1px",
        borderTopColor: color,
        borderRightColor: hovered ? `${color}60` : "rgba(255, 255, 255, 0.08)",
        borderBottomColor: hovered ? `${color}60` : "rgba(255, 255, 255, 0.08)",
        borderLeftColor: hovered ? `${color}60` : "rgba(255, 255, 255, 0.08)",
        borderRadius: "10px",
        padding: "20px",
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        cursor: href ? "pointer" : "default",
        boxShadow: hovered
          ? `0 10px 30px -5px ${color}25, 0 0 15px ${color}15`
          : "0 4px 20px rgba(0, 0, 0, 0.25)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        animation: pulse ? "pulse-critical 2s ease-in-out infinite" : undefined,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle top-right ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "-30px",
          right: "-30px",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: color,
          filter: "blur(40px)",
          opacity: hovered ? 0.25 : 0.1,
          pointerEvents: "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Top row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "16px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "9px",
            background: color + "18",
            border: `1px solid ${color}35`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: color,
            boxShadow: `0 0 12px ${color}20`,
          }}
        >
          {icon}
        </div>
        {sub && (
          <span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              color: "var(--text-secondary)",
              background: "rgba(255, 255, 255, 0.05)",
              padding: "3px 8px",
              borderRadius: "4px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              letterSpacing: "0.4px",
              textTransform: "uppercase",
            }}
          >
            {sub}
          </span>
        )}
      </div>

      {/* Value */}
      <div
        className="font-stat"
        style={{
          fontSize: "36px",
          fontWeight: "700",
          color: color,
          letterSpacing: "-1.2px",
          lineHeight: "1.1",
          marginBottom: "8px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {value}
      </div>

      {/* Label + trend */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 1,
          marginTop: "auto",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            color: "var(--text-secondary)",
            fontWeight: "500",
            letterSpacing: "0.2px",
          }}
        >
          {label}
        </div>
        {trend && (
          <span
            style={{
              fontSize: "10px",
              fontWeight: "700",
              padding: "2px 6px",
              borderRadius: "4px",
              display: "inline-flex",
              alignItems: "center",
              gap: "2px",
              background:
                trend.direction === "up"
                  ? "rgba(34, 197, 94, 0.15)"
                  : trend.direction === "down"
                  ? "rgba(239, 68, 68, 0.15)"
                  : "rgba(148, 163, 184, 0.12)",
              color:
                trend.direction === "up"
                  ? "#4ade80"
                  : trend.direction === "down"
                  ? "#f87171"
                  : "var(--text-secondary)",
              border: `1px solid ${
                trend.direction === "up"
                  ? "rgba(34, 197, 94, 0.3)"
                  : trend.direction === "down"
                  ? "rgba(239, 68, 68, 0.3)"
                  : "rgba(148, 163, 184, 0.2)"
              }`,
            }}
          >
            {trend.direction === "up" ? "▲" : trend.direction === "down" ? "▼" : "•"}{" "}
            {trend.label}
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none", display: "block", height: "100%" }}>
        {content}
      </Link>
    );
  }
  return content;
}

export default MetricCard;

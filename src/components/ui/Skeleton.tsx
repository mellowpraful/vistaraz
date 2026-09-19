import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
}

export function Skeleton({
  width = "100%",
  height = "16px",
  borderRadius = "4px",
  style,
  className,
  ...props
}: SkeletonProps) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: "linear-gradient(90deg, #111827 0%, #1f2937 50%, #111827 100%)",
        backgroundSize: "800px 100%",
        animation: "shimmer 1.8s infinite linear",
        ...style,
      }}
      className={`skeleton ${className || ""}`}
      {...props}
    />
  );
}

export function IncidentCardSkeleton() {
  return (
    <div
      style={{
        padding: "16px",
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Skeleton width="100px" height="18px" />
        <Skeleton width="60px" height="18px" borderRadius="10px" />
      </div>
      <Skeleton width="80%" height="20px" />
      <Skeleton width="100%" height="14px" />
      <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
        <Skeleton width="80px" height="22px" borderRadius="4px" />
        <Skeleton width="90px" height="22px" borderRadius="4px" />
      </div>
    </div>
  );
}

import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
}

export function Skeleton({
  width = "100%",
  height = "16px",
  borderRadius = "6px",
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
        background: "linear-gradient(90deg, rgba(15, 22, 35, 0.8) 0%, rgba(30, 41, 59, 0.6) 50%, rgba(15, 22, 35, 0.8) 100%)",
        backgroundSize: "800px 100%",
        animation: "shimmer 1.8s infinite linear",
        border: "1px solid rgba(255, 255, 255, 0.04)",
        ...style,
      }}
      className={`skeleton ${className || ""}`}
      {...props}
    />
  );
}

export function MetricCardSkeleton() {
  return (
    <div
      style={{
        padding: "20px",
        background: "rgba(15, 22, 35, 0.85)",
        borderStyle: "solid",
        borderTopWidth: "2px",
        borderRightWidth: "1px",
        borderBottomWidth: "1px",
        borderLeftWidth: "1px",
        borderTopColor: "rgba(59, 130, 246, 0.3)",
        borderRightColor: "rgba(255, 255, 255, 0.06)",
        borderBottomColor: "rgba(255, 255, 255, 0.06)",
        borderLeftColor: "rgba(255, 255, 255, 0.06)",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Skeleton width="38px" height="38px" borderRadius="8px" />
        <Skeleton width="50px" height="18px" borderRadius="4px" />
      </div>
      <Skeleton width="90px" height="36px" borderRadius="6px" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Skeleton width="110px" height="14px" />
        <Skeleton width="60px" height="18px" borderRadius="4px" />
      </div>
    </div>
  );
}

export function IncidentCardSkeleton() {
  return (
    <div
      style={{
        padding: "16px",
        background: "rgba(15, 22, 35, 0.85)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
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

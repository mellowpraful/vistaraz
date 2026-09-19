import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 24px",
        textAlign: "center",
        gap: "12px",
      }}
    >
      {Icon && (
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "12px",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "4px",
          }}
        >
          <Icon size={24} color="var(--text-muted)" />
        </div>
      )}
      <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-secondary)" }}>
        {title}
      </div>
      {description && (
        <p style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "320px", lineHeight: "1.6" }}>
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          style={{
            marginTop: "8px",
            padding: "8px 18px",
            background: "var(--accent-blue)",
            border: "none",
            borderRadius: "6px",
            color: "#fff",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 24px",
        gap: "14px",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          borderWidth: "3px",
          borderStyle: "solid",
          borderColor: "var(--border-primary)",
          borderTopColor: "var(--accent-blue)",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
}

export function SkeletonLine({ width = "100%", height = "14px" }: { width?: string; height?: string }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: "4px", marginBottom: "6px" }}
    />
  );
}

export default EmptyState;

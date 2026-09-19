import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "./Button";

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
        padding: "64px 24px",
        textAlign: "center",
        gap: "14px",
        background: "linear-gradient(145deg, rgba(12, 19, 36, 0.6) 0%, rgba(7, 11, 22, 0.7) 100%)",
        borderRadius: "12px",
        border: "1px dashed rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(12px)",
      }}
    >
      {Icon && (
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "4px",
            boxShadow: "0 0 20px rgba(37, 99, 235, 0.2)",
          }}
        >
          <Icon size={26} color="#60a5fa" />
        </div>
      )}
      <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
        {title}
      </div>
      {description && (
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "360px", lineHeight: "1.6", margin: 0 }}>
          {description}
        </p>
      )}
      {action && (
        <div style={{ marginTop: "6px" }}>
          <Button variant="primary" size="md" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}

export function LoadingState({ label = "Synchronizing Command Stream..." }: { label?: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 24px",
        gap: "16px",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "44px",
          height: "44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            borderWidth: "2px",
            borderStyle: "solid",
            borderColor: "rgba(59, 130, 246, 0.15)",
            borderTopColor: "#3b82f6",
            animation: "spin 0.9s linear infinite",
          }}
        />
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#60a5fa",
            boxShadow: "0 0 10px #3b82f6",
          }}
        />
      </div>
      <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "500", letterSpacing: "0.2px" }}>
        {label}
      </div>
    </div>
  );
}

export function SkeletonLine({ width = "100%", height = "14px" }: { width?: string; height?: string }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: "5px", marginBottom: "6px" }}
    />
  );
}

export default EmptyState;

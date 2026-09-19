import React from "react";
import { Loader2, Radio } from "lucide-react";

export interface LoadingStateProps {
  title?: string;
  description?: string;
  minHeight?: string | number;
}

export function LoadingState({
  title = "Connecting to Command Stream...",
  description = "Synchronizing live operational telemetry and active incidents",
  minHeight = "320px",
}: LoadingStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight,
        padding: "40px 20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "52px",
          height: "52px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2px solid #1d4ed830",
            borderTopColor: "#3b82f6",
            animation: "spin 1s linear infinite",
          }}
        />
        <Radio size={22} color="#60a5fa" />
      </div>

      <h3
        style={{
          fontSize: "14px",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: "6px",
          letterSpacing: "-0.2px",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: "12px",
          color: "var(--text-muted)",
          maxWidth: "380px",
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        {description}
      </p>
    </div>
  );
}

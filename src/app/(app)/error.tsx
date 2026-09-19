"use client";

import { useEffect } from "react";
import { AlertOctagon, RotateCcw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log operational telemetry error to audit console
    console.error("[CrisisOS EOC System Error]:", error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "65vh",
        padding: "32px 20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "12px",
          background: "#450a0a",
          border: "1px solid #7f1d1d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
          boxShadow: "0 0 24px rgba(239, 68, 68, 0.25)",
        }}
      >
        <AlertOctagon size={28} color="#ef4444" />
      </div>

      <div
        style={{
          fontSize: "10px",
          fontWeight: 700,
          color: "#f87171",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          marginBottom: "8px",
        }}
      >
        EOC SYSTEM EXCEPTION INTERCEPTED
      </div>

      <h2
        style={{
          fontSize: "20px",
          fontWeight: 800,
          color: "var(--text-primary)",
          marginBottom: "8px",
          letterSpacing: "-0.3px",
        }}
      >
        Operational View Interrupted
      </h2>

      <p
        style={{
          fontSize: "13px",
          color: "var(--text-secondary)",
          maxWidth: "460px",
          lineHeight: 1.6,
          marginBottom: "20px",
        }}
      >
        A client-side runtime exception occurred while rendering this operational panel. Critical
        backend telemetry and database state remain preserved.
      </p>

      {error.message && (
        <div
          style={{
            padding: "10px 14px",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-primary)",
            borderRadius: "6px",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "11px",
            color: "#f87171",
            maxWidth: "600px",
            marginBottom: "24px",
            wordBreak: "break-all",
          }}
        >
          {error.message}
          {error.digest && (
            <div style={{ color: "var(--text-muted)", fontSize: "10px", marginTop: "4px" }}>
              Digest ID: {error.digest}
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Button
          variant="primary"
          onClick={() => reset()}
          icon={<RotateCcw size={14} />}
        >
          Re-initialize View
        </Button>
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <Button variant="secondary" icon={<Home size={14} />}>
            Command Center
          </Button>
        </Link>
      </div>
    </div>
  );
}

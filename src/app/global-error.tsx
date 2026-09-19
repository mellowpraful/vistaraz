"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[CrisisOS Global Critical Error]:", error);
  }, [error]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        style={{
          margin: 0,
          background: "#080b12",
          color: "#f1f5f9",
          fontFamily: "system-ui, -apple-system, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "20px",
        }}
      >
        <div
          style={{
            maxWidth: "500px",
            textAlign: "center",
            padding: "32px",
            background: "#0d1117",
            border: "1px solid #1f2937",
            borderRadius: "10px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "#450a0a",
              border: "1px solid #7f1d1d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <AlertTriangle size={24} color="#ef4444" />
          </div>
          <h1 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 8px" }}>
            CrisisOS Critical Interruption
          </h1>
          <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.5, margin: "0 0 20px" }}>
            The root emergency framework encountered an unrecoverable crash. Please re-initialize the session.
          </p>
          <button
            onClick={() => reset()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              background: "#2563eb",
              border: "none",
              borderRadius: "6px",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <RotateCcw size={14} /> Restart EOC Session
          </button>
        </div>
      </body>
    </html>
  );
}

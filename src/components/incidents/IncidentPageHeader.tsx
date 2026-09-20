"use client";

import { AlertTriangle, RefreshCw, Plus } from "lucide-react";

interface IncidentPageHeaderProps {
  activeCount: number;
  onRefresh: () => void;
  onCreateNew: () => void;
}

export function IncidentPageHeader({ activeCount, onRefresh, onCreateNew }: IncidentPageHeaderProps) {
  return (
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "20px",
      flexWrap: "wrap",
      background: "var(--bg-card)",
      border: "1px solid var(--border-primary)",
      borderLeft: "4px solid #ef4444",
      borderRadius: "12px",
      padding: "28px 32px",
    }}>
      {/* Title Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
          <div style={{
            width: "46px", height: "46px", borderRadius: "10px",
            background: "#450a0a", border: "1px solid #7f1d1d",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <AlertTriangle size={22} color="#f87171" />
          </div>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "800", color: "var(--text-primary)", margin: 0, letterSpacing: "-0.3px" }}>
              Incident Response Queue
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "4px 0 0" }}>
              Real-time multi-agency incident intake, triage, and live command overview
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
          <span style={{
            background: "#450a0a", border: "1px solid #7f1d1d", color: "#f87171",
            fontSize: "13px", fontWeight: "700", padding: "5px 14px", borderRadius: "20px",
            letterSpacing: "0.5px",
          }}>
            🔴 {activeCount} Active
          </span>
          <span style={{
            background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", color: "#60a5fa",
            fontSize: "12px", fontWeight: "600", padding: "5px 14px", borderRadius: "20px",
          }}>
            LIVE FEED
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
        <button
          onClick={onRefresh}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 18px", background: "var(--bg-secondary)",
            border: "1px solid var(--border-primary)", borderRadius: "8px",
            color: "var(--text-secondary)", cursor: "pointer", fontSize: "14px", fontWeight: "600",
          }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
        <button
          onClick={onCreateNew}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 20px", background: "var(--accent-blue)",
            border: "none", borderRadius: "8px",
            color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: "700",
            boxShadow: "0 4px 16px rgba(37,99,235,0.4)",
          }}
        >
          <Plus size={16} /> Log New Incident
        </button>
      </div>
    </div>
  );
}

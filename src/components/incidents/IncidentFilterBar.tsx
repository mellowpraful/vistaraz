"use client";

import { Search, X } from "lucide-react";

const SEVERITIES = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];
const STATUSES = ["ALL", "REPORTED", "VERIFIED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const TYPES = ["ALL", "FLOOD", "FIRE", "ROAD_ACCIDENT", "INDUSTRIAL", "MEDICAL", "BUILDING_COLLAPSE", "HAZMAT", "SEARCH_RESCUE"];

const SEVERITY_COLORS: Record<string, { bg: string; border: string; color: string }> = {
  ALL:      { bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.4)", color: "#60a5fa" },
  CRITICAL: { bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.4)",  color: "#f87171" },
  HIGH:     { bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.4)", color: "#fb923c" },
  MEDIUM:   { bg: "rgba(234,179,8,0.12)",  border: "rgba(234,179,8,0.4)",  color: "#facc15" },
  LOW:      { bg: "rgba(74,222,128,0.12)", border: "rgba(74,222,128,0.4)", color: "#4ade80" },
};

interface IncidentFilterBarProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  selectedSeverity: string;
  onSeverityChange: (v: string) => void;
  selectedStatus: string;
  onStatusChange: (v: string) => void;
  selectedType: string;
  onTypeChange: (v: string) => void;
  totalCount: number;
  filteredCount: number;
  onClearAll: () => void;
}

export function IncidentFilterBar({
  searchQuery, onSearchChange,
  selectedSeverity, onSeverityChange,
  selectedStatus, onStatusChange,
  selectedType, onTypeChange,
  totalCount, filteredCount,
  onClearAll,
}: IncidentFilterBarProps) {
  const hasFilters = selectedSeverity !== "ALL" || selectedStatus !== "ALL" || selectedType !== "ALL" || searchQuery;

  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border-primary)",
      borderRadius: "12px",
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: "18px",
    }}>
      {/* Row 1: Search + Dropdowns */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "240px", position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search by title, location, or incident ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: "100%", paddingLeft: "40px", paddingRight: "14px", paddingTop: "10px", paddingBottom: "10px",
              background: "var(--bg-secondary)", border: "1px solid var(--border-primary)",
              borderRadius: "8px", color: "var(--text-primary)", fontSize: "14px", fontFamily: "inherit",
            }}
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          style={{
            padding: "10px 14px", background: "var(--bg-secondary)",
            border: "1px solid var(--border-primary)", borderRadius: "8px",
            color: "var(--text-secondary)", fontSize: "14px", cursor: "pointer", fontFamily: "inherit",
          }}
        >
          {STATUSES.map((st) => <option key={st} value={st}>{st.replace(/_/g, " ")}</option>)}
        </select>

        <select
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          style={{
            padding: "10px 14px", background: "var(--bg-secondary)",
            border: "1px solid var(--border-primary)", borderRadius: "8px",
            color: "var(--text-secondary)", fontSize: "14px", cursor: "pointer", fontFamily: "inherit",
          }}
        >
          {TYPES.map((tp) => <option key={tp} value={tp}>{tp.replace(/_/g, " ")}</option>)}
        </select>

        {hasFilters && (
          <button
            onClick={onClearAll}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "10px 16px", background: "transparent",
              border: "1px solid var(--border-secondary)", borderRadius: "8px",
              color: "var(--text-muted)", cursor: "pointer", fontSize: "14px",
            }}
          >
            <X size={13} /> Clear All
          </button>
        )}

        <span style={{
          fontSize: "13px", color: "var(--text-muted)", marginLeft: "auto", whiteSpace: "nowrap",
          background: "var(--bg-secondary)", padding: "6px 14px", borderRadius: "20px",
          border: "1px solid var(--border-primary)",
        }}>
          <strong style={{ color: "var(--text-primary)" }}>{filteredCount}</strong> / {totalCount} incidents
        </span>
      </div>

      {/* Row 2: Severity Pills */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginRight: "4px" }}>
          Severity:
        </span>
        {SEVERITIES.map((sev) => {
          const colors = SEVERITY_COLORS[sev] || SEVERITY_COLORS.ALL;
          const isActive = selectedSeverity === sev;
          return (
            <button
              key={sev}
              onClick={() => onSeverityChange(sev)}
              style={{
                padding: "6px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: "700",
                border: `1px solid ${isActive ? colors.border : "var(--border-primary)"}`,
                background: isActive ? colors.bg : "var(--bg-secondary)",
                color: isActive ? colors.color : "var(--text-muted)",
                cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.5px",
                transition: "all 0.15s",
              }}
            >
              {sev}
            </button>
          );
        })}
      </div>
    </div>
  );
}

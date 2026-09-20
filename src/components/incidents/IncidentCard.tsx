"use client";

import Link from "next/link";
import { MapPin, Clock, Users, Zap, ChevronRight } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { INCIDENT_TYPE_ICONS } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

interface IncidentItem {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: string;
  status: string;
  source: string;
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
  affectedCount: number | null;
  injuryCount: number | null;
  hazards: string | null;
  requiredCapabilities: string | null;
  aiExtracted: boolean;
  createdAt: string;
  assignments: Array<{ id: string; resource: { name: string; type: string } }>;
}

interface IncidentCardProps {
  incident: IncidentItem;
}

export function IncidentCard({ incident }: IncidentCardProps) {
  const isCritical = incident.severity === "CRITICAL";
  const isHigh = incident.severity === "HIGH";
  const accentColor = isCritical ? "#ef4444" : isHigh ? "#f97316" : incident.severity === "MEDIUM" ? "#eab308" : "#22c55e";

  let parsedHazards: string[] = [];
  let parsedCaps: string[] = [];
  try { if (incident.hazards) parsedHazards = JSON.parse(incident.hazards); } catch {}
  try { if (incident.requiredCapabilities) parsedCaps = JSON.parse(incident.requiredCapabilities); } catch {}

  return (
    <div
      style={{
        background: "var(--bg-card)",
        borderStyle: "solid",
        borderTopWidth: "1px", borderRightWidth: "1px", borderBottomWidth: "1px", borderLeftWidth: "4px",
        borderTopColor: "var(--border-primary)", borderRightColor: "var(--border-primary)",
        borderBottomColor: "var(--border-primary)", borderLeftColor: accentColor,
        borderRadius: "12px",
        padding: "20px 24px",
        transition: "all 0.2s",
        animation: isCritical ? "glow-pulse 2s ease-in-out infinite" : undefined,
      }}
    >
      {/* Top row: icon + title + badges + actions */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px", flexWrap: "wrap" }}>
        {/* Left: icon + title */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: "28px", flexShrink: 0, lineHeight: 1 }}>
            {INCIDENT_TYPE_ICONS[incident.type as keyof typeof INCIDENT_TYPE_ICONS] || "🚨"}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Link
              href={`/incidents/${incident.id}`}
              style={{ fontSize: "17px", fontWeight: "700", color: "var(--text-primary)", textDecoration: "none", display: "block", marginBottom: "8px" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#60a5fa"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
            >
              {incident.title}
            </Link>

            {/* Badges row */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <Badge variant={incident.severity as any} dot pulse={isCritical} />
              <Badge variant={incident.status as any} />
              {incident.aiExtracted && <Badge variant="AI">🤖 AI Extracted</Badge>}
            </div>
          </div>
        </div>

        {/* Right: assignment + actions */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px", flexShrink: 0 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Assigned Units
            </div>
            <div style={{ fontSize: "16px", fontWeight: "800" }}>
              {incident.assignments.length > 0 ? (
                <span style={{ color: "#4ade80" }}>{incident.assignments.length} units</span>
              ) : (
                <span style={{ color: "#fbbf24" }}>Unassigned</span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Link
              href={`/dispatch?incidentId=${incident.id}`}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 16px", background: "var(--accent-blue)",
                border: "none", borderRadius: "8px", color: "#fff",
                fontSize: "13px", fontWeight: "700", textDecoration: "none",
                boxShadow: "0 2px 10px rgba(37,99,235,0.35)",
              }}
            >
              <Zap size={13} /> Dispatch
            </Link>
            <Link
              href={`/incidents/${incident.id}`}
              style={{
                display: "flex", alignItems: "center", gap: "4px",
                padding: "8px 14px", background: "var(--bg-secondary)",
                border: "1px solid var(--border-primary)", borderRadius: "8px",
                color: "var(--text-secondary)", fontSize: "13px", fontWeight: "600", textDecoration: "none",
              }}
            >
              Details <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Description */}
      <p style={{
        fontSize: "14px", color: "var(--text-secondary)", margin: "14px 0 12px",
        overflow: "hidden", display: "-webkit-box",
        WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any,
        lineHeight: "1.6",
      }}>
        {incident.description}
      </p>

      {/* Meta row */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px", fontSize: "13px", color: "var(--text-muted)" }}>
        {incident.locationName && (
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <MapPin size={12} /> {incident.locationName}
          </span>
        )}
        {incident.affectedCount != null && incident.affectedCount > 0 && (
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Users size={12} /> {incident.affectedCount} affected
          </span>
        )}
        {incident.injuryCount != null && incident.injuryCount > 0 && (
          <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#f87171" }}>
            🩹 {incident.injuryCount} injured
          </span>
        )}
        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "'JetBrains Mono', monospace" }}>
          <Clock size={12} /> {formatRelativeTime(incident.createdAt)}
        </span>
        <span style={{
          fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
          color: "var(--text-muted)", background: "var(--bg-secondary)",
          padding: "2px 8px", borderRadius: "4px", border: "1px solid var(--border-primary)",
        }}>
          #{incident.id.slice(0, 8)}
        </span>
      </div>

      {/* Hazard & Capability chips */}
      {(parsedHazards.length > 0 || parsedCaps.length > 0) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--border-primary)" }}>
          {parsedHazards.slice(0, 4).map((h, i) => (
            <span key={i} style={{ fontSize: "12px", background: "#450a0a", color: "#f87171", border: "1px solid #7f1d1d", padding: "4px 10px", borderRadius: "6px" }}>
              ⚠️ {h}
            </span>
          ))}
          {parsedCaps.slice(0, 4).map((c, i) => (
            <span key={i} style={{ fontSize: "12px", background: "#1e3a5f", color: "#93c5fd", border: "1px solid #1d4ed8", padding: "4px 10px", borderRadius: "6px" }}>
              🎯 {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

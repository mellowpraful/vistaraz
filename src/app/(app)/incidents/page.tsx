"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatRelativeTime, extractApiData } from "@/lib/utils";
import { fetchSafeJson } from "@/lib/api-client";
import { INCIDENT_TYPE_ICONS } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { AlertTriangle, RefreshCw, Plus, MapPin, Clock, Users, Zap, ChevronRight, Search, X } from "lucide-react";

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
  assignments: Array<{
    id: string;
    resource: {
      name: string;
      type: string;
    };
  }>;
}

const SEVERITIES = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];
const STATUSES = ["ALL", "REPORTED", "VERIFIED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const TYPES = [
  "ALL",
  "FLOOD",
  "FIRE",
  "ROAD_ACCIDENT",
  "INDUSTRIAL",
  "MEDICAL",
  "BUILDING_COLLAPSE",
  "HAZMAT",
  "SEARCH_RESCUE",
];

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [aiExtracting, setAiExtracting] = useState(false);

  // Form State
  const [formRawText, setFormRawText] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "FLOOD",
    severity: "HIGH",
    source: "MANUAL",
    locationName: "",
    latitude: 23.0225,
    longitude: 72.5714,
    affectedCount: 0,
    injuryCount: 0,
    hazards: [] as string[],
    requiredCapabilities: [] as string[],
  });

  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const params = new URLSearchParams();
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);
      if (selectedSeverity !== "ALL") params.set("severity", selectedSeverity);
      if (selectedType !== "ALL") params.set("type", selectedType);

      const json = await fetchSafeJson<IncidentItem>(`/api/incidents?${params.toString()}`);
      if (!json.success) {
        setFetchError(json.error || "Server error while fetching incidents");
      }
      setIncidents(extractApiData<IncidentItem>(json));
    } catch (err: any) {
      console.error("Failed to fetch incidents:", err);
      setFetchError(err?.message || "Failed to fetch incidents");
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, selectedSeverity, selectedType]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const handleAiExtract = async () => {
    if (!formRawText.trim()) return;
    setAiExtracting(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "EXTRACT_REPORT", text: formRawText }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        setFormData((prev) => ({
          ...prev,
          title: d.title || prev.title,
          description: d.summary || formRawText,
          type: d.type || prev.type,
          severity: d.severity || prev.severity,
          locationName: d.locationName || prev.locationName,
          latitude: d.latitude || prev.latitude,
          longitude: d.longitude || prev.longitude,
          affectedCount: d.affectedCount || prev.affectedCount,
          injuryCount: d.injuryCount || prev.injuryCount,
          hazards: d.hazards || prev.hazards,
          requiredCapabilities: d.requiredCapabilities || prev.requiredCapabilities,
        }));
      }
    } catch (err) {
      console.error("AI extraction failed:", err);
    } finally {
      setAiExtracting(false);
    }
  };

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    setCreating(true);
    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          originalReport: formRawText || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowCreateModal(false);
        setFormRawText("");
        setFormData({
          title: "",
          description: "",
          type: "FLOOD",
          severity: "HIGH",
          source: "MANUAL",
          locationName: "",
          latitude: 23.0225,
          longitude: 72.5714,
          affectedCount: 0,
          injuryCount: 0,
          hazards: [],
          requiredCapabilities: [],
        });
        fetchIncidents();
      }
    } catch (err) {
      console.error("Create incident failed:", err);
    } finally {
      setCreating(false);
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      inc.title.toLowerCase().includes(q) ||
      inc.description.toLowerCase().includes(q) ||
      (inc.locationName && inc.locationName.toLowerCase().includes(q)) ||
      inc.id.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertTriangle size={20} color="#ef4444" />
              Incident Response Queue
            </h1>
            <span style={{
              background: "#450a0a", border: "1px solid #7f1d1d", color: "#f87171",
              fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px",
              letterSpacing: "0.5px",
            }}>
              {incidents.filter((i) => i.status !== "RESOLVED" && i.status !== "CLOSED").length} Active
            </span>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
            Real-time multi-agency incident intake, triage, and live command overview
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => fetchIncidents()}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "7px 14px", background: "var(--bg-card)",
              border: "1px solid var(--border-primary)", borderRadius: "6px",
              color: "var(--text-secondary)", cursor: "pointer", fontSize: "12px",
            }}
          >
            <RefreshCw size={12} /> Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "7px 16px", background: "var(--accent-blue)",
              border: "none", borderRadius: "6px",
              color: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: "600",
            }}
          >
            <Plus size={13} /> Log New Incident
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "8px", padding: "14px 16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            {/* Search bar */}
            <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
              <Search size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Search by title, location, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%", paddingLeft: "32px", paddingRight: "10px", paddingTop: "8px", paddingBottom: "8px",
                  background: "var(--bg-secondary)", border: "1px solid var(--border-primary)",
                  borderRadius: "6px", color: "var(--text-primary)", fontSize: "13px", fontFamily: "inherit",
                }}
              />
            </div>

            {/* Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: "7px 10px", background: "var(--bg-secondary)",
                border: "1px solid var(--border-primary)", borderRadius: "6px",
                color: "var(--text-secondary)", fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>{st.replace(/_/g, " ")}</option>
              ))}
            </select>

            {/* Type Dropdown */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                padding: "7px 10px", background: "var(--bg-secondary)",
                border: "1px solid var(--border-primary)", borderRadius: "6px",
                color: "var(--text-secondary)", fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {TYPES.map((tp) => (
                <option key={tp} value={tp}>{tp.replace(/_/g, " ")}</option>
              ))}
            </select>

            {(selectedSeverity !== "ALL" || selectedStatus !== "ALL" || selectedType !== "ALL" || searchQuery) && (
              <button
                onClick={() => { setSelectedSeverity("ALL"); setSelectedStatus("ALL"); setSelectedType("ALL"); setSearchQuery(""); }}
                style={{
                  display: "flex", alignItems: "center", gap: "4px",
                  padding: "7px 12px", background: "transparent",
                  border: "1px solid var(--border-secondary)", borderRadius: "6px",
                  color: "var(--text-muted)", cursor: "pointer", fontSize: "12px",
                }}
              >
                <X size={11} /> Clear
              </button>
            )}

            <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "auto", whiteSpace: "nowrap" }}>
              <strong style={{ color: "var(--text-primary)" }}>{filteredIncidents.length}</strong> of {incidents.length}
            </span>
          </div>

          {/* Severity Pill Filters */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Severity:</span>
            {SEVERITIES.map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                style={{
                  padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "600",
                  border: selectedSeverity === sev ? "1px solid #3b82f6" : "1px solid var(--border-primary)",
                  background: selectedSeverity === sev ? "rgba(37,99,235,0.15)" : "var(--bg-secondary)",
                  color: selectedSeverity === sev ? "#60a5fa" : "var(--text-muted)",
                  cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.5px", transition: "all 0.15s",
                }}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Incident List */}
      {loading ? (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "8px", padding: "60px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", borderWidth: "3px", borderStyle: "solid", borderColor: "var(--border-primary)", borderTopColor: "var(--accent-blue)", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Loading incident queue...</p>
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "8px", padding: "60px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <AlertTriangle size={36} color="var(--text-muted)" />
          <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-secondary)" }}>No matching incidents found</div>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "320px" }}>Try adjusting your search query, severity, or status filters.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filteredIncidents.map((incident) => {
            const isCritical = incident.severity === "CRITICAL";
            const isHigh = incident.severity === "HIGH";
            const accentColor = isCritical ? "#ef4444" : isHigh ? "#f97316" : "#3b82f6";
            let parsedHazards: string[] = [];
            let parsedCaps: string[] = [];
            try { if (incident.hazards) parsedHazards = JSON.parse(incident.hazards); } catch {}
            try { if (incident.requiredCapabilities) parsedCaps = JSON.parse(incident.requiredCapabilities); } catch {}

            return (
              <div
                key={incident.id}
                style={{
                  background: "var(--bg-card)",
                  borderStyle: "solid",
                  borderTopWidth: "1px",
                  borderRightWidth: "1px",
                  borderBottomWidth: "1px",
                  borderLeftWidth: "3px",
                  borderTopColor: "var(--border-primary)",
                  borderRightColor: "var(--border-primary)",
                  borderBottomColor: "var(--border-primary)",
                  borderLeftColor: accentColor,
                  borderRadius: "8px",
                  padding: "14px 16px",
                  transition: "all 0.2s",
                  animation: isCritical ? "glow-pulse 2s ease-in-out infinite" : undefined,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
                  {/* Left info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                      <span style={{ fontSize: "18px", flexShrink: 0 }}>
                        {INCIDENT_TYPE_ICONS[incident.type as keyof typeof INCIDENT_TYPE_ICONS] || "🚨"}
                      </span>
                      <Link
                        href={`/incidents/${incident.id}`}
                        style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", textDecoration: "none", flex: 1, minWidth: 0 }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#60a5fa"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
                      >
                        {incident.title}
                      </Link>
                      <Badge variant={incident.severity as any} dot pulse={isCritical} />
                      <Badge variant={incident.status as any} />
                      {incident.aiExtracted && (
                        <Badge variant="AI">🤖 AI</Badge>
                      )}
                    </div>

                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any }}>
                      {incident.description}
                    </p>

                    {/* Metadata */}
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", fontSize: "11px", color: "var(--text-muted)" }}>
                      {incident.locationName && (
                        <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                          <MapPin size={10} /> {incident.locationName}
                        </span>
                      )}
                      {incident.affectedCount != null && incident.affectedCount > 0 && (
                        <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                          <Users size={10} /> {incident.affectedCount} affected
                        </span>
                      )}
                      {incident.injuryCount != null && incident.injuryCount > 0 && (
                        <span style={{ display: "flex", alignItems: "center", gap: "3px", color: "#f87171" }}>
                          🩹 {incident.injuryCount} injured
                        </span>
                      )}
                      <span style={{ display: "flex", alignItems: "center", gap: "3px", fontFamily: "'JetBrains Mono', monospace" }}>
                        <Clock size={10} /> {formatRelativeTime(incident.createdAt)}
                      </span>
                    </div>

                    {/* Hazard & Capability chips */}
                    {(parsedHazards.length > 0 || parsedCaps.length > 0) && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                        {parsedHazards.slice(0, 3).map((h, i) => (
                          <span key={i} style={{ fontSize: "10px", background: "#450a0a", color: "#f87171", border: "1px solid #7f1d1d", padding: "2px 8px", borderRadius: "4px" }}>⚠️ {h}</span>
                        ))}
                        {parsedCaps.slice(0, 3).map((c, i) => (
                          <span key={i} style={{ fontSize: "10px", background: "#1e3a5f", color: "#93c5fd", border: "1px solid #1d4ed8", padding: "2px 8px", borderRadius: "4px" }}>🎯 {c}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Action Column */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px", flexShrink: 0 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "2px" }}>Assigned</div>
                      <div style={{ fontSize: "12px", fontWeight: "700" }}>
                        {incident.assignments.length > 0 ? (
                          <span style={{ color: "#4ade80" }}>{incident.assignments.length} units</span>
                        ) : (
                          <span style={{ color: "#fbbf24" }}>Unassigned</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <Link
                        href={`/dispatch?incidentId=${incident.id}`}
                        style={{
                          display: "flex", alignItems: "center", gap: "4px",
                          padding: "6px 12px", background: "var(--accent-blue)",
                          border: "none", borderRadius: "6px", color: "#fff",
                          fontSize: "11px", fontWeight: "600", textDecoration: "none",
                        }}
                      >
                        <Zap size={11} /> Dispatch
                      </Link>
                      <Link
                        href={`/incidents/${incident.id}`}
                        style={{
                          display: "flex", alignItems: "center", gap: "4px",
                          padding: "6px 12px", background: "var(--bg-secondary)",
                          border: "1px solid var(--border-primary)", borderRadius: "6px",
                          color: "var(--text-secondary)", fontSize: "11px", fontWeight: "500", textDecoration: "none",
                        }}
                      >
                        Details <ChevronRight size={11} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Incident Modal */}
      {showCreateModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", overflowY: "auto" }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-secondary)", borderRadius: "12px", maxWidth: "640px", width: "100%", padding: "24px", boxShadow: "0 25px 80px rgba(0,0,0,0.6)", margin: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-primary)", paddingBottom: "14px", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "#450a0a", border: "1px solid #7f1d1d", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertTriangle size={16} color="#f87171" />
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>Log New Emergency Incident</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: "transparent", border: "1px solid var(--border-primary)", borderRadius: "6px", color: "var(--text-muted)", cursor: "pointer", padding: "4px 8px", fontSize: "14px" }}
              >
                <X size={14} />
              </button>
            </div>

            {/* AI Fast Intake Box */}
            <div style={{ padding: "14px", background: "#1a0b2e", border: "1px solid #581c87", borderRadius: "8px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#c084fc", display: "flex", alignItems: "center", gap: "6px" }}>
                  ✨ Fast AI Triage Auto-Fill
                </span>
                <button
                  type="button"
                  onClick={handleAiExtract}
                  disabled={aiExtracting || !formRawText.trim()}
                  style={{
                    padding: "5px 12px", background: aiExtracting ? "#4c1d95" : "#7c3aed",
                    border: "none", borderRadius: "6px", color: "#e9d5ff",
                    fontSize: "11px", fontWeight: "600", cursor: "pointer",
                    opacity: !formRawText.trim() ? 0.5 : 1,
                  }}
                >
                  {aiExtracting ? "Analyzing..." : "Auto-Extract with AI"}
                </button>
              </div>
              <textarea
                rows={2}
                placeholder="Paste raw caller transcript, radio chatter, or notes..."
                value={formRawText}
                onChange={(e) => setFormRawText(e.target.value)}
                style={{ width: "100%", padding: "8px", background: "#0d0221", border: "1px solid #581c87", borderRadius: "6px", color: "var(--text-primary)", fontSize: "12px", fontFamily: "inherit", resize: "vertical" }}
              />
            </div>

            {/* Structured Form */}
            <form onSubmit={handleCreateIncident} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Incident Title *</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Flash Flood - Sabarmati Riverfront Sector 4" className="input" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Incident Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="input">
                    {TYPES.filter((t) => t !== "ALL").map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Severity Level</label>
                  <select value={formData.severity} onChange={(e) => setFormData({ ...formData, severity: e.target.value })} className="input">
                    {SEVERITIES.filter((s) => s !== "ALL").map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Description *</label>
                  <textarea required rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe scene conditions, hazards, access routes, and trapped victims..." className="input" style={{ resize: "vertical" }} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Location</label>
                  <input type="text" value={formData.locationName} onChange={(e) => setFormData({ ...formData, locationName: e.target.value })} placeholder="e.g. Near Sabarmati Ashram, Vadaj Road" className="input" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Affected People</label>
                  <input type="number" min="0" value={formData.affectedCount} onChange={(e) => setFormData({ ...formData, affectedCount: parseInt(e.target.value) || 0 })} className="input" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Injuries Reported</label>
                  <input type="number" min="0" value={formData.injuryCount} onChange={(e) => setFormData({ ...formData, injuryCount: parseInt(e.target.value) || 0 })} className="input" />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px", paddingTop: "14px", borderTop: "1px solid var(--border-primary)" }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: "8px 16px", background: "transparent", border: "1px solid var(--border-primary)", borderRadius: "6px", color: "var(--text-muted)", cursor: "pointer", fontSize: "13px" }}>Cancel</button>
                <button type="submit" disabled={creating} style={{ padding: "8px 20px", background: "var(--accent-blue)", border: "none", borderRadius: "6px", color: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                  <AlertTriangle size={13} />
                  {creating ? "Submitting..." : "Register Incident"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


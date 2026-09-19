"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  Search,
  Shield,
  AlertTriangle,
  Radio,
  ChevronRight,
  ExternalLink,
  Users,
  Compass,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { INCIDENT_TYPE_ICONS } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

interface IncidentTelemetry {
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
  createdAt: string;
  updatedAt: string;
  assignments: Array<{
    id: string;
    status: string;
    assignedAt: string;
    resource: {
      id: string;
      name: string;
      type: string;
      agency?: { name?: string };
    };
  }>;
  events: Array<{
    id: string;
    type: string;
    description: string;
    createdAt: string;
    actor?: string | null;
  }>;
}

function EmergencyStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idParam = searchParams.get("id");

  const [incidentId, setIncidentId] = useState(idParam || "");
  const [incident, setIncident] = useState<IncidentTelemetry | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recentIncidents, setRecentIncidents] = useState<Array<{ id: string; title: string }>>([]);

  // Load recent from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("crisisos_my_incidents");
      if (raw) {
        const items = JSON.parse(raw);
        setRecentIncidents(items.slice(0, 5));
        if (!idParam && items.length > 0) {
          setIncidentId(items[0].id);
        }
      }
    } catch {
      // Ignore
    }
  }, [idParam]);

  const fetchStatus = useCallback(async (targetId: string, isSilent = false) => {
    if (!targetId.trim()) return;
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/incidents/${targetId.trim()}`);
      const json = await res.json();
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error || `Incident "${targetId}" not found in system.`);
      }
      setIncident(json.data);
    } catch (err: any) {
      console.warn("Status fetch failed:", err);
      setErrorMsg(err.message || "Failed to load incident status.");
      if (!isSilent) setIncident(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Trigger fetch when idParam changes or incidentId is submitted
  useEffect(() => {
    if (idParam) {
      setIncidentId(idParam);
      fetchStatus(idParam);
    } else if (incidentId) {
      fetchStatus(incidentId);
    }
  }, [idParam, fetchStatus]);

  // Polling every 6 seconds when incident is active
  useEffect(() => {
    if (!incident?.id) return;
    if (incident.status === "CLOSED" || incident.status === "RESOLVED") return;

    const interval = setInterval(() => {
      fetchStatus(incident.id, true);
    }, 6000);
    return () => clearInterval(interval);
  }, [incident?.id, incident?.status, fetchStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentId.trim()) return;
    router.push(`/emergency-status?id=${encodeURIComponent(incidentId.trim())}`);
    fetchStatus(incidentId.trim());
  };

  const getStageNumber = (status?: string) => {
    switch (status) {
      case "CLOSED":
      case "RESOLVED":
        return 4;
      case "ASSIGNED":
      case "IN_PROGRESS":
        return 3;
      case "VERIFIED":
        return 2;
      case "REPORTED":
      default:
        return 1;
    }
  };

  const currentStage = getStageNumber(incident?.status);

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", paddingBottom: "40px" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <Activity size={22} color="var(--accent-blue-bright)" />
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>
            Emergency Lifecycle & Status Tracker
          </h1>
        </div>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
          Real-time incident response progression, dispatched fleet telemetry, and tactical event feed.
        </p>
      </div>

      {/* Search by ID Bar */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-primary)",
          borderRadius: "10px",
          padding: "16px",
          marginBottom: "20px",
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-secondary)",
              borderRadius: "6px",
              padding: "8px 14px",
            }}
          >
            <Search size={15} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Enter Incident or SOS Reference ID (e.g. inc-101 or cm1...)"
              value={incidentId}
              onChange={(e) => setIncidentId(e.target.value)}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                color: "var(--text-primary)",
                fontSize: "13px",
                fontFamily: "'JetBrains Mono', monospace",
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 20px",
              background: "var(--accent-blue)",
              border: "none",
              borderRadius: "6px",
              color: "#fff",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
            Track Status
          </button>
        </form>

        {/* Quick select from recent */}
        {recentIncidents.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Recent:</span>
            {recentIncidents.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setIncidentId(r.id);
                  router.push(`/emergency-status?id=${encodeURIComponent(r.id)}`);
                  fetchStatus(r.id);
                }}
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-primary)",
                  borderRadius: "4px",
                  color: "var(--text-secondary)",
                  fontSize: "11px",
                  padding: "2px 8px",
                  cursor: "pointer",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                #{r.id.slice(0, 8)}
              </button>
            ))}
          </div>
        )}
      </div>

      {errorMsg && (
        <div style={{ padding: "14px", background: "#7f1d1d", border: "1px solid #b91c1c", borderRadius: "8px", color: "#fecaca", fontSize: "12px", marginBottom: "20px" }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !incident && (
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-muted)" }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 10px" }} />
          Retrieving live geospatial and dispatch telemetry...
        </div>
      )}

      {/* Incident Status View */}
      {incident && (
        <div className="animate-slide-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Main Status Header Card */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
              borderRadius: "12px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Top row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ fontSize: "32px" }}>
                  {INCIDENT_TYPE_ICONS[incident.type as keyof typeof INCIDENT_TYPE_ICONS] || "🚨"}
                </span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "var(--text-muted)" }}>
                      #{incident.id}
                    </span>
                    <Badge variant={incident.severity as any} dot />
                    <Badge variant={incident.status as any} />
                    {refreshing && (
                      <span style={{ fontSize: "11px", color: "#4ade80", display: "flex", alignItems: "center", gap: "4px" }}>
                        <span className="live-dot" /> Auto-syncing
                      </span>
                    )}
                  </div>
                  <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-primary)", marginTop: "4px", margin: 0 }}>
                    {incident.title}
                  </h2>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => fetchStatus(incident.id, true)}
                  disabled={refreshing}
                  style={{
                    padding: "6px 12px",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-secondary)",
                    borderRadius: "6px",
                    color: "var(--text-secondary)",
                    fontSize: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
                  {refreshing ? "Syncing..." : "Refresh"}
                </button>

                <Link
                  href={`/map?lat=${incident.latitude || 23.0225}&lng=${incident.longitude || 72.5714}`}
                  style={{
                    padding: "6px 12px",
                    background: "rgba(37,99,235,0.15)",
                    border: "1px solid rgba(37,99,235,0.35)",
                    borderRadius: "6px",
                    color: "#60a5fa",
                    fontSize: "12px",
                    fontWeight: "600",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Compass size={13} />
                  View on Map
                </Link>
              </div>
            </div>

            {/* Visual 4-Stage Lifecycle Stepper */}
            <div
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-secondary)",
                borderRadius: "10px",
                padding: "18px",
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "14px" }}>
                Emergency Response Progression
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                {[
                  { stage: 1, label: "Reported", desc: "Logged in Queue", icon: "📨" },
                  { stage: 2, label: "Verified", desc: "Assessed by EOC", icon: "🛡️" },
                  { stage: 3, label: "In Progress", desc: "Fleet Deployed", icon: "🚒" },
                  { stage: 4, label: "Resolved", desc: "Scene Secured", icon: "✅" },
                ].map((s) => {
                  const isDone = currentStage >= s.stage;
                  const isCurrent = currentStage === s.stage;

                  return (
                    <div
                      key={s.stage}
                      style={{
                        background: isCurrent ? "rgba(37,99,235,0.15)" : isDone ? "rgba(34,197,94,0.12)" : "var(--bg-card)",
                        border: `1px solid ${isCurrent ? "var(--accent-blue)" : isDone ? "#10b981" : "var(--border-primary)"}`,
                        borderRadius: "8px",
                        padding: "12px 10px",
                        textAlign: "center",
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{ fontSize: "18px", marginBottom: "4px" }}>{s.icon}</div>
                      <div style={{ fontSize: "12px", fontWeight: "700", color: isCurrent ? "#60a5fa" : isDone ? "#4ade80" : "var(--text-muted)" }}>
                        {s.label}
                      </div>
                      <div style={{ fontSize: "10px", color: isCurrent ? "#93c5fd" : isDone ? "#86efac" : "var(--text-muted)", marginTop: "2px" }}>
                        {s.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description & Scene Telemetry */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6", background: "var(--bg-secondary)", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-primary)" }}>
                {incident.description}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", fontSize: "12px" }}>
                <div style={{ background: "var(--bg-secondary)", padding: "10px 14px", borderRadius: "6px", border: "1px solid var(--border-primary)" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "10px", textTransform: "uppercase", display: "block" }}>Location Landmark</span>
                  <strong style={{ color: "var(--text-primary)" }}>{incident.locationName || "Scene Location"}</strong>
                </div>
                <div style={{ background: "var(--bg-secondary)", padding: "10px 14px", borderRadius: "6px", border: "1px solid var(--border-primary)" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "10px", textTransform: "uppercase", display: "block" }}>Reported Timestamp</span>
                  <strong style={{ color: "var(--text-primary)" }}>{formatRelativeTime(incident.createdAt)}</strong>
                </div>
                <div style={{ background: "var(--bg-secondary)", padding: "10px 14px", borderRadius: "6px", border: "1px solid var(--border-primary)" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "10px", textTransform: "uppercase", display: "block" }}>GPS Geolocation</span>
                  <strong style={{ color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {incident.latitude?.toFixed(4) || "—"}, {incident.longitude?.toFixed(4) || "—"}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Units & Fleet Status */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                <Shield size={16} color="#22c55e" />
                Deployed Emergency Resources ({incident.assignments?.length || 0})
              </h3>
              <Link href={`/incidents/${incident.id}`} style={{ fontSize: "12px", color: "var(--accent-blue-bright)", textDecoration: "none" }}>
                Full SITREP →
              </Link>
            </div>

            {incident.assignments && incident.assignments.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {incident.assignments.map((as) => (
                  <div
                    key={as.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-secondary)",
                      borderRadius: "8px",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)" }}>{as.resource.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {as.resource.agency?.name || "Emergency Agency"} · Type: {as.resource.type}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: "700",
                        background: "#064e3b",
                        color: "#6ee7b7",
                        border: "1px solid #059669",
                        textTransform: "uppercase",
                      }}
                    >
                      {as.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: "16px",
                  background: "rgba(234,179,8,0.06)",
                  border: "1px dashed rgba(234,179,8,0.3)",
                  borderRadius: "8px",
                  textAlign: "center",
                  fontSize: "12px",
                  color: "#fde047",
                }}
              >
                ⏳ Dispatcher review underway. Assigned emergency units will appear here once allocated.
              </div>
            )}
          </div>

          {/* Tactical Event Stream */}
          {incident.events && incident.events.length > 0 && (
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <Clock size={16} color="#60a5fa" />
                Tactical Event Timeline
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {incident.events.map((ev) => (
                  <div
                    key={ev.id}
                    style={{
                      padding: "10px 14px",
                      background: "var(--bg-secondary)",
                      borderLeft: "3px solid var(--accent-blue)",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                      <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>{ev.type}</span>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
                        {formatRelativeTime(ev.createdAt)}
                      </span>
                    </div>
                    <div style={{ color: "var(--text-secondary)" }}>{ev.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function EmergencyStatusPage() {
  return (
    <Suspense fallback={<div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-muted)" }}>Loading Emergency Status...</div>}>
      <EmergencyStatusContent />
    </Suspense>
  );
}

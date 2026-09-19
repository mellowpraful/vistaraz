"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import { INCIDENT_TYPE_ICONS, SEVERITY_DOT } from "@/lib/types";

interface DashboardData {
  incidents: { total: number; byStatus: Record<string, number>; active: number };
  resources: { total: number; byStatus: Record<string, number>; available: number };
  hospitals: { totalBeds: number; availableBeds: number; occupancyRate: string; details: any[] };
  shelters: { totalCapacity: number; occupied: number; occupancyRate: string };
  pendingDispatches: number;
  recentActivity: any[];
}

interface RecentIncident {
  id: string;
  title: string;
  type: string;
  severity: string;
  status: string;
  locationName: string | null;
  createdAt: string;
}

const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "UNKNOWN"];

function MetricCard({ value, label, sub, color, icon, href }: {
  value: string | number; label: string; sub?: string; color?: string; icon: string; href?: string;
}) {
  const content = (
    <div style={{
      background: "#111827",
      border: `1px solid ${color ?? "#1f2937"}30`,
      borderRadius: "10px",
      padding: "20px",
      transition: "all 0.2s",
      cursor: href ? "pointer" : "default",
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = (color ?? "#2563eb") + "60"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = (color ?? "#1f2937") + "30"; }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
        <span style={{ fontSize: "24px" }}>{icon}</span>
        {sub && (
          <span style={{ fontSize: "11px", color: color ?? "#6b7280", fontWeight: "600", background: (color ?? "#1f2937") + "20", padding: "2px 8px", borderRadius: "4px" }}>
            {sub}
          </span>
        )}
      </div>
      <div style={{ fontSize: "32px", fontWeight: "800", color: color ?? "#f1f5f9", letterSpacing: "-1px" }}>
        {value}
      </div>
      <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px", fontWeight: "500" }}>{label}</div>
    </div>
  );
  return href ? <Link href={href} style={{ textDecoration: "none" }}>{content}</Link> : content;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [incidents, setIncidents] = useState<RecentIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchDashboard = useCallback(async () => {
    try {
      const [dashRes, incRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/incidents?limit=6"),
      ]);
      if (dashRes.ok) setData(await dashRes.json());
      if (incRes.ok) {
        const d = await incRes.json();
        setIncidents(d.incidents ?? []);
      }
      setLastUpdated(new Date());
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000); // auto-refresh 30s
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: "120px", borderRadius: "10px" }} />
          ))}
        </div>
      </div>
    );
  }

  const criticalIncidents = incidents.filter(i => i.severity === "CRITICAL");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Alert Banner */}
      {criticalIncidents.length > 0 && (
        <div className="alert-critical" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "20px" }}>🚨</span>
          <div style={{ flex: 1 }}>
            <strong>{criticalIncidents.length} CRITICAL incident{criticalIncidents.length > 1 ? "s" : ""} active</strong>
            {" — "}
            {criticalIncidents.slice(0, 2).map(i => i.title).join("; ")}
          </div>
          <Link href="/incidents" style={{ color: "#f87171", fontSize: "12px", textDecoration: "underline" }}>View All</Link>
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#f1f5f9", margin: 0 }}>
            ⚡ Command Center Dashboard
          </h1>
          <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
            Gujarat Emergency Operations Center — {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "12px", color: "#4b5563" }}>Updated {formatRelativeTime(lastUpdated)}</span>
          <button
            onClick={fetchDashboard}
            style={{
              padding: "6px 14px",
              background: "#111827",
              border: "1px solid #1f2937",
              borderRadius: "6px",
              color: "#6b7280",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            ↻ Refresh
          </button>
          <Link href="/incidents/new" className="btn btn-primary" style={{ fontSize: "13px", padding: "8px 16px" }}>
            + New Incident
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      {data && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          <MetricCard
            icon="🚨" value={data.incidents.active} label="Active Incidents"
            sub={`${data.incidents.total} total`} color="#ef4444" href="/incidents"
          />
          <MetricCard
            icon="🚑" value={data.resources.available} label="Available Resources"
            sub={`${data.resources.total} total`} color="#22c55e" href="/resources"
          />
          <MetricCard
            icon="✅" value={data.pendingDispatches} label="Pending Dispatches"
            color="#f97316" href="/dispatch"
          />
          <MetricCard
            icon="🏥" value={data.hospitals.availableBeds} label="Hospital Beds Available"
            sub={`${data.hospitals.occupancyRate}% occupied`} color="#06b6d4" href="/hospitals"
          />
        </div>
      )}

      {/* Secondary Metrics */}
      {data && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {Object.entries(data.incidents.byStatus).map(([status, count]) => (
            <div key={status} style={{
              background: "#111827",
              border: "1px solid #1f2937",
              borderRadius: "8px",
              padding: "14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "11px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>{status.replace("_", " ")}</div>
                <div style={{ fontSize: "22px", fontWeight: "700", color: "#f1f5f9" }}>{count}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px" }}>
        {/* Recent Incidents */}
        <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{
            padding: "16px 20px",
            borderBottom: "1px solid #1f2937",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "#f1f5f9" }}>Recent Incidents</div>
            <Link href="/incidents" style={{ fontSize: "12px", color: "#2563eb", textDecoration: "none" }}>View All →</Link>
          </div>
          <div>
            {incidents.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#4b5563" }}>No incidents found</div>
            ) : (
              incidents.map((inc, i) => (
                <Link
                  key={inc.id}
                  href={`/incidents/${inc.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px 20px",
                    borderBottom: i < incidents.length - 1 ? "1px solid #1f2937" : "none",
                    textDecoration: "none",
                    transition: "background 0.15s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#1a2332"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <div style={{ fontSize: "20px", flexShrink: 0 }}>
                    {INCIDENT_TYPE_ICONS[inc.type] ?? "⚠️"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#f1f5f9", marginBottom: "4px" }} className="truncate-2">
                      {inc.title}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className={`badge severity-${inc.severity.toLowerCase()}`}>{inc.severity}</span>
                      <span className={`badge status-${inc.status.toLowerCase()}`}>{inc.status.replace("_", " ")}</span>
                      {inc.locationName && (
                        <span style={{ fontSize: "11px", color: "#6b7280" }}>📍 {inc.locationName}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: "11px", color: "#4b5563", flexShrink: 0 }}>
                    {formatRelativeTime(inc.createdAt)}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Resource Status */}
          {data && (
            <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #1f2937" }}>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#f1f5f9" }}>Resource Status</div>
              </div>
              <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {Object.entries(data.resources.byStatus).map(([status, count]) => {
                  const total = data.resources.total;
                  const pct = total > 0 ? (count / total) * 100 : 0;
                  const colors: Record<string, string> = {
                    AVAILABLE: "#22c55e", DISPATCHED: "#f97316", EN_ROUTE: "#3b82f6",
                    ON_SCENE: "#c084fc", RETURNING: "#22d3ee", OUT_OF_SERVICE: "#ef4444", STANDBY: "#6b7280",
                  };
                  return (
                    <div key={status}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>{status.replace("_", " ")}</span>
                        <span style={{ fontSize: "12px", fontWeight: "700", color: colors[status] ?? "#f1f5f9" }}>{count}</span>
                      </div>
                      <div className="confidence-bar">
                        <div className="confidence-fill" style={{
                          width: `${pct}%`,
                          background: colors[status] ?? "#2563eb",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: "10px 16px", borderTop: "1px solid #1f2937" }}>
                <Link href="/resources" style={{ fontSize: "12px", color: "#2563eb", textDecoration: "none" }}>
                  Manage Resources →
                </Link>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {data && (
            <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #1f2937" }}>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#f1f5f9" }}>Recent Activity</div>
              </div>
              <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {data.recentActivity.slice(0, 5).map((log, i) => (
                  <div key={log.id ?? i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <div style={{
                      width: "6px", height: "6px", borderRadius: "50%",
                      background: "#2563eb", flexShrink: 0, marginTop: "6px",
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                        <span style={{ color: "#f1f5f9", fontWeight: "600" }}>{log.user?.name ?? "System"}</span>
                        {" "}
                        {log.action.replace("_", " ").toLowerCase()}
                      </div>
                      <div style={{ fontSize: "11px", color: "#4b5563" }}>
                        {formatRelativeTime(log.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "10px 16px", borderTop: "1px solid #1f2937" }}>
                <Link href="/audit" style={{ fontSize: "12px", color: "#2563eb", textDecoration: "none" }}>
                  Full Audit Log →
                </Link>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "10px", padding: "16px" }}>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#f1f5f9", marginBottom: "12px" }}>Quick Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Link href="/incidents/new" className="btn btn-primary" style={{ justifyContent: "center", padding: "10px" }}>
                🚨 Create Incident
              </Link>
              <Link href="/voicedispatch" className="btn btn-ghost" style={{ justifyContent: "center", padding: "10px" }}>
                📡 VoiceDispatch Console
              </Link>
              <Link href="/simulation" className="btn btn-ghost" style={{ justifyContent: "center", padding: "10px" }}>
                🧪 Run Simulation
              </Link>
              <Link href="/ai-commander" className="btn btn-ghost" style={{ justifyContent: "center", padding: "10px" }}>
                🤖 AI Commander
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import { extractApiData } from "@/lib/utils";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { LoadingState, SkeletonLine } from "@/components/ui/EmptyState";
import {
  AlertTriangle,
  Shield,
  Zap,
  Hospital,
  RefreshCw,
  Plus,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  Activity,
  ChevronRight,
} from "lucide-react";
import { INCIDENT_TYPE_ICONS } from "@/lib/types";

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
  affectedCount: number | null;
}

function ResourceBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.min((count / total) * 100, 100) : 0;
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "5px",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {label.replace(/_/g, " ")}
        </span>
        <span style={{ fontSize: "13px", fontWeight: "700", color }}>{count}</span>
      </div>
      <div
        style={{
          height: "4px",
          background: "var(--border-primary)",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: color,
            borderRadius: "2px",
            transition: "width 0.6s ease-out",
          }}
        />
      </div>
    </div>
  );
}

const RESOURCE_COLORS: Record<string, string> = {
  AVAILABLE: "#4ade80",
  DISPATCHED: "#fb923c",
  EN_ROUTE: "#60a5fa",
  ON_SCENE: "#c084fc",
  RETURNING: "#22d3ee",
  OUT_OF_SERVICE: "#f87171",
  STANDBY: "#6b7280",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [incidents, setIncidents] = useState<RecentIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const [dashRes, incRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/incidents?limit=8"),
      ]);
      if (dashRes.ok) setData(await dashRes.json());
      if (incRes.ok) {
        const d = await incRes.json();
        setIncidents(extractApiData<RecentIncident>(d));
      }
      setLastUpdated(new Date());
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(() => fetchDashboard(), 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const criticalIncidents = incidents.filter((i) => i.severity === "CRITICAL");
  const activeIncidents = incidents.filter(
    (i) => i.status !== "RESOLVED" && i.status !== "CLOSED"
  );

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: "120px", borderRadius: "8px" }} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px" }}>
          <div className="skeleton" style={{ height: "400px", borderRadius: "8px" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="skeleton" style={{ height: "180px", borderRadius: "8px" }} />
            <div className="skeleton" style={{ height: "200px", borderRadius: "8px" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* ── Critical Alert Banner ──────────────────────────────────── */}
      {criticalIncidents.length > 0 && (
        <div
          className="alert-critical animate-slide-in"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "#7f1d1d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={18} color="#f87171" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#fca5a5", marginBottom: "2px" }}>
              {criticalIncidents.length} CRITICAL INCIDENT{criticalIncidents.length > 1 ? "S" : ""} ACTIVE
            </div>
            <div style={{ fontSize: "12px", color: "#f87171" }}>
              {criticalIncidents.slice(0, 2).map((i) => i.title).join(" · ")}
            </div>
          </div>
          <Link
            href="/incidents?severity=CRITICAL"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "6px 14px",
              background: "#7f1d1d",
              border: "1px solid #991b1b",
              borderRadius: "6px",
              color: "#fca5a5",
              fontSize: "12px",
              fontWeight: "600",
              textDecoration: "none",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            View All <ChevronRight size={13} />
          </Link>
        </div>
      )}

      {/* ── Page Header ───────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>
            Command Center
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
            Gujarat Emergency Operations Center —{" "}
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}
          >
            Updated {formatRelativeTime(lastUpdated)}
          </span>
          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
              borderRadius: "6px",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500",
              transition: "all 0.15s",
            }}
          >
            <RefreshCw size={12} style={{ animation: refreshing ? "spin 0.8s linear infinite" : undefined }} />
            Refresh
          </button>
          <Link
            href="/incidents"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 16px",
              background: "var(--accent-blue)",
              border: "none",
              borderRadius: "6px",
              color: "#fff",
              fontSize: "12px",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            <Plus size={13} />
            New Incident
          </Link>
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────── */}
      {data && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          <MetricCard
            icon={<AlertTriangle size={18} />}
            value={data.incidents.active}
            label="Active Incidents"
            sub={`${data.incidents.total} total`}
            color="#ef4444"
            href="/incidents"
            pulse={data.incidents.active > 0}
          />
          <MetricCard
            icon={<Shield size={18} />}
            value={data.resources.available}
            label="Available Resources"
            sub={`${data.resources.total} fleet`}
            color="#22c55e"
            href="/resources"
          />
          <MetricCard
            icon={<Zap size={18} />}
            value={data.pendingDispatches}
            label="Pending Dispatches"
            color="#f97316"
            href="/dispatch"
            pulse={data.pendingDispatches > 0}
          />
          <MetricCard
            icon={<Activity size={18} />}
            value={`${data.hospitals.occupancyRate}%`}
            label="Hospital ICU Occupancy"
            sub={`${data.hospitals.availableBeds} beds free`}
            color={
              parseFloat(data.hospitals.occupancyRate) > 80
                ? "#ef4444"
                : parseFloat(data.hospitals.occupancyRate) > 60
                ? "#f97316"
                : "#06b6d4"
            }
            href="/hospitals"
          />
        </div>
      )}

      {/* ── Status Breakdown Row ───────────────────────────────────── */}
      {data && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px" }}>
          {Object.entries(data.incidents.byStatus).map(([status, count]) => (
            <Link
              key={status}
              href={`/incidents?status=${status}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-primary)",
                  borderRadius: "6px",
                  padding: "12px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border-secondary)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border-primary)";
                }}
              >
                <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-primary)" }}>
                  {count}
                </div>
                <div
                  style={{
                    fontSize: "9px",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    marginTop: "2px",
                  }}
                >
                  {status.replace(/_/g, " ")}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ── Main Grid ─────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px", alignItems: "start" }}>
        {/* Incident Feed */}
        <Card>
          <CardHeader>
            <CardTitle>
              <AlertTriangle size={15} color="#ef4444" />
              Priority Incident Feed
            </CardTitle>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="live-dot" style={{ width: "6px", height: "6px" }} />
              <span style={{ fontSize: "11px", color: "#4ade80" }}>Live</span>
              <Link
                href="/incidents"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "12px",
                  color: "var(--accent-blue-bright)",
                  textDecoration: "none",
                }}
              >
                View All <ChevronRight size={12} />
              </Link>
            </div>
          </CardHeader>
          <div>
            {incidents.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                No incidents in the queue
              </div>
            ) : (
              incidents.map((inc, i) => {
                const icon = INCIDENT_TYPE_ICONS[inc.type as keyof typeof INCIDENT_TYPE_ICONS] ?? "⚠️";
                const isCrit = inc.severity === "CRITICAL";
                const isHigh = inc.severity === "HIGH";
                const accentColor = isCrit ? "#ef4444" : isHigh ? "#f97316" : "#3b82f6";
                return (
                  <Link
                    key={inc.id}
                    href={`/incidents/${inc.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "12px 18px",
                      borderBottom: i < incidents.length - 1 ? "1px solid var(--border-primary)" : "none",
                      textDecoration: "none",
                      transition: "background 0.15s",
                      borderLeft: `3px solid ${accentColor}`,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--bg-card-hover)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    <span style={{ fontSize: "18px", flexShrink: 0 }}>{icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "var(--text-primary)",
                          marginBottom: "4px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {inc.title}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                        <Badge variant={inc.severity as any} dot />
                        <Badge variant={inc.status as any} />
                        {inc.locationName && (
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "3px",
                              fontSize: "10px",
                              color: "var(--text-muted)",
                            }}
                          >
                            <MapPin size={9} /> {inc.locationName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "var(--text-muted)",
                          fontFamily: "'JetBrains Mono', monospace",
                          display: "flex",
                          alignItems: "center",
                          gap: "3px",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Clock size={9} /> {formatRelativeTime(inc.createdAt)}
                      </div>
                      {inc.affectedCount && inc.affectedCount > 0 && (
                        <div
                          style={{
                            fontSize: "10px",
                            color: "var(--text-muted)",
                            display: "flex",
                            alignItems: "center",
                            gap: "3px",
                            justifyContent: "flex-end",
                            marginTop: "2px",
                          }}
                        >
                          <Users size={9} /> {inc.affectedCount}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
          {incidents.length > 0 && (
            <CardFooter>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                {activeIncidents.length} active of {incidents.length} shown
              </span>
              <Link
                href="/incidents"
                style={{
                  fontSize: "11px",
                  color: "var(--accent-blue-bright)",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                Full queue <ChevronRight size={11} />
              </Link>
            </CardFooter>
          )}
        </Card>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Resource Fleet Status */}
          {data && (
            <Card>
              <CardHeader>
                <CardTitle>
                  <Shield size={14} color="#22c55e" />
                  Fleet Status
                </CardTitle>
                <Link
                  href="/resources"
                  style={{
                    fontSize: "11px",
                    color: "var(--accent-blue-bright)",
                    textDecoration: "none",
                  }}
                >
                  Manage →
                </Link>
              </CardHeader>
              <CardContent style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {Object.entries(data.resources.byStatus).map(([status, count]) => (
                  <ResourceBar
                    key={status}
                    label={status}
                    count={count}
                    total={data.resources.total}
                    color={RESOURCE_COLORS[status] ?? "#6b7280"}
                  />
                ))}
              </CardContent>
              <CardFooter>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  {data.resources.available} of {data.resources.total} available
                </span>
                <TrendingUp size={13} color="#4ade80" />
              </CardFooter>
            </Card>
          )}

          {/* Recent Activity */}
          {data && (
            <Card>
              <CardHeader>
                <CardTitle>
                  <Activity size={14} color="#60a5fa" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent style={{ padding: "10px 18px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {data.recentActivity.slice(0, 5).map((log: any, i: number) => (
                  <div key={log.id ?? i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "var(--accent-blue)",
                        flexShrink: 0,
                        marginTop: "5px",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                        <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>
                          {log.user?.name ?? "System"}
                        </span>{" "}
                        {log.action.replace(/_/g, " ").toLowerCase()}
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px", fontFamily: "'JetBrains Mono', monospace" }}>
                        {formatRelativeTime(log.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
                {data.recentActivity.length === 0 && (
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", padding: "10px 0" }}>
                    No recent activity
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Link
                  href="/audit"
                  style={{ fontSize: "11px", color: "var(--accent-blue-bright)", textDecoration: "none" }}
                >
                  Full Audit Log →
                </Link>
              </CardFooter>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { href: "/incidents", label: "🚨 View Incidents", color: "#ef4444" },
                { href: "/voicedispatch", label: "📡 VoiceDispatch Console", color: "#3b82f6" },
                { href: "/dispatch", label: "⚡ Dispatch Studio", color: "#f97316" },
                { href: "/ai-commander", label: "🤖 AI Commander", color: "#a855f7" },
                { href: "/simulation", label: "🧪 Run Simulation", color: "#06b6d4" },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  style={{
                    padding: "9px 12px",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-primary)",
                    borderRadius: "6px",
                    color: "var(--text-secondary)",
                    fontSize: "12px",
                    fontWeight: "500",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = action.color + "60";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                    (e.currentTarget as HTMLElement).style.background = action.color + "08";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-primary)";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                    (e.currentTarget as HTMLElement).style.background = "var(--bg-secondary)";
                  }}
                >
                  {action.label}
                  <ChevronRight size={12} />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  History,
  AlertTriangle,
  Radio,
  Search,
  RefreshCw,
  Plus,
  MapPin,
  Clock,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { INCIDENT_TYPE_ICONS } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

interface MyIncidentItem {
  id: string;
  title: string;
  type: string;
  severity: string;
  status: string;
  locationName: string | null;
  createdAt: string;
  isSos?: boolean;
}

export default function MyIncidentsPage() {
  const [incidents, setIncidents] = useState<MyIncidentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "RESOLVED">("ALL");

  const loadLocalAndSync = useCallback(async () => {
    setLoading(true);
    let localItems: MyIncidentItem[] = [];
    try {
      const raw = localStorage.getItem("crisisos_my_incidents");
      if (raw) localItems = JSON.parse(raw);
    } catch {
      localItems = [];
    }

    // Also check active SOS
    const activeSosId = localStorage.getItem("crisisos_active_sos");

    if (localItems.length === 0 && !activeSosId) {
      try {
        setRefreshing(true);
        const res = await fetch("/api/incidents?limit=15");
        if (res.ok) {
          const json = await res.json();
          const apiIncidents = json.data || json.incidents || [];
          const formatted: MyIncidentItem[] = apiIncidents.map((i: any) => ({
            id: i.id,
            title: i.title,
            type: i.type,
            severity: i.severity,
            status: i.status || "REPORTED",
            locationName: i.locationName,
            createdAt: i.createdAt || new Date().toISOString(),
          }));
          setIncidents(formatted);
          if (formatted.length > 0) {
            localStorage.setItem("crisisos_my_incidents", JSON.stringify(formatted));
          }
        }
      } catch (fetchErr) {
        console.warn("API fallback fetch error:", fetchErr);
        setIncidents([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
      return;
    }

    try {
      setRefreshing(true);
      // Fetch latest updates for these IDs
      const updatedList = await Promise.all(
        localItems.map(async (item) => {
          try {
            const res = await fetch(`/api/incidents/${item.id}`);
            if (res.ok) {
              const json = await res.json();
              if (json.success && json.data) {
                return {
                  ...item,
                  title: json.data.title || item.title,
                  status: json.data.status || item.status,
                  severity: json.data.severity || item.severity,
                  locationName: json.data.locationName || item.locationName,
                };
              }
            }
          } catch {
            // Ignore fetch error per item, retain cached info
          }
          return item;
        })
      );

      // If active SOS exists and not in list, add it
      if (activeSosId && !updatedList.some((i) => i.id === activeSosId)) {
        try {
          const res = await fetch(`/api/incidents/${activeSosId}`);
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              updatedList.unshift({
                id: json.data.id,
                title: json.data.title,
                type: json.data.type,
                severity: json.data.severity,
                status: json.data.status,
                locationName: json.data.locationName,
                createdAt: json.data.createdAt,
                isSos: true,
              });
            }
          }
        } catch {
          // Stale active SOS
        }
      }

      setIncidents(updatedList);
      localStorage.setItem("crisisos_my_incidents", JSON.stringify(updatedList));
    } catch (err) {
      console.warn("Failed syncing incident statuses:", err);
      setIncidents(localItems);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLocalAndSync();
  }, [loadLocalAndSync]);

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your local incident history list on this device?")) {
      localStorage.removeItem("crisisos_my_incidents");
      setIncidents([]);
    }
  };

  const filteredIncidents = incidents.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.locationName && item.locationName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());

    const isResolved = item.status === "RESOLVED" || item.status === "CLOSED";
    if (statusFilter === "ACTIVE") return matchesSearch && !isResolved;
    if (statusFilter === "RESOLVED") return matchesSearch && isResolved;
    return matchesSearch;
  });

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "40px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <History size={22} color="var(--accent-blue-bright)" />
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>
              My Incidents & SOS History
            </h1>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            Track emergency requests, SOS activations, and citizen incident reports submitted from this device.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={loadLocalAndSync}
            disabled={refreshing}
            style={{
              padding: "8px 14px",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-primary)",
              borderRadius: "6px",
              color: "var(--text-secondary)",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Updating..." : "Refresh"}
          </button>

          <Link
            href="/sos"
            style={{
              padding: "8px 14px",
              background: "#dc2626",
              borderRadius: "6px",
              color: "#fff",
              fontSize: "12px",
              fontWeight: "700",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 0 10px rgba(220,38,38,0.4)",
            }}
          >
            <Radio size={14} />
            SOS Beacon
          </Link>

          <Link
            href="/register-incident"
            style={{
              padding: "8px 14px",
              background: "var(--accent-blue)",
              borderRadius: "6px",
              color: "#fff",
              fontSize: "12px",
              fontWeight: "600",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Plus size={14} />
            Report Incident
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          background: "var(--bg-card)",
          border: "1px solid var(--border-primary)",
          borderRadius: "10px",
          padding: "12px 16px",
          marginBottom: "16px",
          flexWrap: "wrap",
        }}
      >
        {/* Status Tabs */}
        <div style={{ display: "flex", gap: "6px" }}>
          {[
            { key: "ALL", label: `All (${incidents.length})` },
            { key: "ACTIVE", label: `Active (${incidents.filter((i) => i.status !== "RESOLVED" && i.status !== "CLOSED").length})` },
            { key: "RESOLVED", label: `Resolved (${incidents.filter((i) => i.status === "RESOLVED" || i.status === "CLOSED").length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key as any)}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "none",
                background: statusFilter === tab.key ? "var(--accent-blue)" : "transparent",
                color: statusFilter === tab.key ? "#fff" : "var(--text-secondary)",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-secondary)",
            borderRadius: "6px",
            padding: "6px 12px",
            minWidth: "220px",
          }}
        >
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by title, ID or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-primary)",
              fontSize: "12px",
              outline: "none",
              width: "100%",
            }}
          />
        </div>
      </div>

      {/* Incidents Feed */}
      {loading ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 10px" }} />
          Loading your registered incidents...
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            borderRadius: "12px",
            padding: "50px 20px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "var(--bg-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
            }}
          >
            📋
          </div>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
              No Incidents Found
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
              {incidents.length === 0
                ? "You haven't submitted any SOS requests or incident reports from this device yet."
                : "No incidents matched your search or status filter."}
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Link
              href="/sos"
              style={{
                padding: "10px 18px",
                background: "#dc2626",
                borderRadius: "6px",
                color: "#fff",
                fontSize: "13px",
                fontWeight: "700",
                textDecoration: "none",
              }}
            >
              Activate Emergency SOS
            </Link>
            <Link
              href="/register-incident"
              style={{
                padding: "10px 18px",
                background: "var(--accent-blue)",
                borderRadius: "6px",
                color: "#fff",
                fontSize: "13px",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Register Incident Report
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredIncidents.map((inc) => {
            const icon = INCIDENT_TYPE_ICONS[inc.type as keyof typeof INCIDENT_TYPE_ICONS] || "⚠️";
            const isCritical = inc.severity === "CRITICAL";
            const isResolved = inc.status === "RESOLVED" || inc.status === "CLOSED";

            return (
              <div
                key={inc.id}
                style={{
                  background: "var(--bg-card)",
                  border: `1px solid ${inc.isSos ? "rgba(239,68,68,0.4)" : "var(--border-primary)"}`,
                  borderLeft: `4px solid ${inc.isSos ? "#ef4444" : isCritical ? "#f97316" : "#3b82f6"}`,
                  borderRadius: "10px",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: "24px", flexShrink: 0 }}>{icon}</span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                      {inc.isSos && (
                        <span
                          style={{
                            background: "#7f1d1d",
                            color: "#fca5a5",
                            fontSize: "10px",
                            fontWeight: "800",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          🚨 SOS BEACON
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: "11px",
                          fontFamily: "'JetBrains Mono', monospace",
                          color: "var(--text-muted)",
                        }}
                      >
                        #{inc.id.slice(0, 8)}
                      </span>
                      <Badge variant={inc.severity as any} dot />
                      <Badge variant={inc.status as any} />
                    </div>

                    <h3
                      style={{
                        fontSize: "15px",
                        fontWeight: "700",
                        color: "var(--text-primary)",
                        margin: "0 0 4px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {inc.title}
                    </h3>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "11px", color: "var(--text-muted)" }}>
                      {inc.locationName && (
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <MapPin size={11} />
                          {inc.locationName}
                        </span>
                      )}
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={11} />
                        {formatRelativeTime(inc.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                  <Link
                    href={`/emergency-status?id=${inc.id}`}
                    style={{
                      padding: "8px 14px",
                      background: "var(--accent-blue)",
                      borderRadius: "6px",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: "700",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Track Status <ChevronRight size={13} />
                  </Link>

                  <Link
                    href={`/incidents/${inc.id}`}
                    style={{
                      padding: "8px 12px",
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-secondary)",
                      borderRadius: "6px",
                      color: "var(--text-secondary)",
                      fontSize: "12px",
                      fontWeight: "600",
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    SITREP
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Bottom clear history button */}
          <div style={{ textAlign: "right", marginTop: "10px" }}>
            <button
              onClick={handleClearHistory}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                fontSize: "11px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Trash2 size={11} />
              Clear local history from this browser
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

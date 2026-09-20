"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, Download, RotateCcw, Search, User } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState, LoadingState } from "@/components/ui/EmptyState";

interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  actor: string;
  actorRole: string;
  details: string | null;
  createdAt: string;
}

const ENTITIES = ["ALL", "Incident", "Resource", "DispatchRecommendation", "Hospital", "Shelter", "User"];

function actionBadgeStyle(action: string): React.CSSProperties {
  const isOverride = action.includes("OVERRIDE");
  const isApprove  = action.includes("APPROVE") || action.includes("CREATED");
  const isReject   = action.includes("REJECT") || action.includes("DELETE");

  if (isOverride) return { background: "rgba(69, 26, 3, 0.75)", color: "#fbbf24", border: "1px solid rgba(234,179,8,0.5)" };
  if (isApprove)  return { background: "rgba(5, 46, 22, 0.75)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.5)" };
  if (isReject)   return { background: "rgba(69, 10, 10, 0.75)", color: "#f87171", border: "1px solid rgba(239,68,68,0.5)" };
  return { background: "rgba(30, 58, 95, 0.75)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.5)" };
}

export default function AuditPage() {
  const [logs, setLogs]                   = useState<AuditEntry[]>([]);
  const [loading, setLoading]             = useState(true);
  const [selectedEntity, setSelectedEntity] = useState("ALL");
  const [searchQuery, setSearchQuery]     = useState("");
  const [expandedId, setExpandedId]       = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedEntity !== "ALL") params.set("entity", selectedEntity);
      const res  = await fetch(`/api/audit?${params.toString()}`);
      const json = await res.json();
      if (json.success) setLogs(json.data ?? []);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedEntity]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleExportJson = () => {
    const dataStr    = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const anchor     = document.createElement("a");
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `crisisos-audit-log-${new Date().toISOString()}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.actor.toLowerCase().includes(q) ||
      log.entity.toLowerCase().includes(q) ||
      log.entityId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* ── Page Header ──────────────────────────────────────────── */}
      <PageHeader
        title="Compliance & Audit Trail"
        description="Immutable record of all commander overrides, AI recommendations, dispatch decisions, and emergency state transitions."
        icon={FileText}
        iconColor="#3b82f6"
        badge={
          <span
            style={{
              fontSize: "10px",
              fontWeight: "700",
              letterSpacing: "0.6px",
              textTransform: "uppercase",
              padding: "3px 10px",
              borderRadius: "4px",
              background: "rgba(5, 46, 22, 0.8)",
              color: "#4ade80",
              border: "1px solid rgba(34,197,94,0.5)",
            }}
          >
            Tamper-Evident
          </span>
        }
        actions={
          <>
            <button onClick={handleExportJson} className="btn btn-secondary" style={{ fontSize: "13px" }}>
              <Download size={14} />
              Export JSON
            </button>
            <button onClick={() => fetchLogs()} className="btn btn-secondary" style={{ fontSize: "13px" }}>
              <RotateCcw size={14} />
              Refresh
            </button>
          </>
        }
      />

      {/* ── Filter Toolbar ───────────────────────────────────────── */}
      <div className="card" style={{ padding: "16px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: "220px", position: "relative" }}>
            <Search
              size={14}
              color="var(--text-muted)"
              style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            />
            <input
              type="text"
              placeholder="Search by action, actor, or entity ID…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              style={{ paddingLeft: "34px", fontSize: "13px" }}
            />
          </div>

          {/* Entity filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "500", whiteSpace: "nowrap" }}>
              Entity:
            </span>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="input"
              style={{ width: "auto", padding: "8px 12px", fontSize: "13px" }}
            >
              {ENTITIES.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          {/* Result count */}
          {!loading && (
            <span style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
              {filteredLogs.length} record{filteredLogs.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* ── Audit Log Table ──────────────────────────────────────── */}
      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "48px" }}>
            <LoadingState label="Loading audit records…" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ padding: "16px" }}>
            <EmptyState
              icon={FileText}
              title="No Audit Records Available"
              description={
                searchQuery || selectedEntity !== "ALL"
                  ? "No records match your current search or filter. Try broadening your criteria."
                  : "Audit records are created when operators perform actions such as dispatch approvals, incident updates, and resource assignments. No records exist yet."
              }
              action={
                searchQuery || selectedEntity !== "ALL"
                  ? { label: "Clear Filters", onClick: () => { setSearchQuery(""); setSelectedEntity("ALL"); } }
                  : { label: "Refresh", onClick: fetchLogs }
              }
            />
          </div>
        ) : (
          <div>
            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 180px 160px 120px",
                padding: "10px 20px",
                background: "rgba(255,255,255,0.02)",
                borderBottom: "1px solid var(--border-primary)",
                gap: "12px",
              }}
            >
              {["Action / Entity", "Actor", "Timestamp", "Details"].map((h) => (
                <div key={h} style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", letterSpacing: "0.3px", textTransform: "uppercase" }}>
                  {h}
                </div>
              ))}
            </div>

            {/* Rows */}
            {filteredLogs.map((log) => {
              const isExpanded = expandedId === log.id;
              let parsedDetails = null;
              try {
                if (log.details) parsedDetails = JSON.parse(log.details);
              } catch {
                parsedDetails = log.details;
              }

              return (
                <div
                  key={log.id}
                  style={{
                    borderBottom: "1px solid var(--border-primary)",
                    transition: "background 0.15s",
                  }}
                  className="incident-feed-row"
                >
                  {/* Main row */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 180px 160px 120px",
                      padding: "14px 20px",
                      gap: "12px",
                      alignItems: "center",
                    }}
                  >
                    {/* Action + entity */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "3px 9px",
                          borderRadius: "5px",
                          fontSize: "11px",
                          fontWeight: "700",
                          letterSpacing: "0.4px",
                          width: "fit-content",
                          ...actionBadgeStyle(log.action),
                        }}
                      >
                        {log.action.replace(/_/g, " ")}
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                        {log.entity}{" "}
                        <span className="technical" style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {log.entityId.slice(0, 10)}…
                        </span>
                      </span>
                    </div>

                    {/* Actor */}
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      <div
                        style={{
                          width: "26px",
                          height: "26px",
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid var(--border-primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <User size={12} color="var(--text-secondary)" />
                      </div>
                      <div>
                        <div style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-primary)" }}>
                          {log.actor}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{log.actorRole}</div>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="technical" style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      {formatRelativeTime(log.createdAt)}
                    </div>

                    {/* Expand toggle */}
                    <div>
                      {log.details && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : log.id)}
                          className="btn btn-secondary"
                          style={{ fontSize: "11px", padding: "4px 10px" }}
                        >
                          {isExpanded ? "Hide" : "View JSON"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded JSON panel */}
                  {isExpanded && log.details && (
                    <div
                      style={{
                        padding: "12px 20px 16px",
                        borderTop: "1px solid var(--border-primary)",
                        background: "rgba(3,7,18,0.6)",
                      }}
                    >
                      <pre
                        className="technical"
                        style={{
                          fontSize: "11.5px",
                          color: "#4ade80",
                          overflowX: "auto",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-all",
                        }}
                      >
                        {JSON.stringify(parsedDetails, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

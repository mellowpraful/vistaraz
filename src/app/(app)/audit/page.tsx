"use client";

import { useState, useEffect, useCallback } from "react";
import { formatRelativeTime } from "@/lib/utils";

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

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedEntity !== "ALL") params.set("entity", selectedEntity);

      const res = await fetch(`/api/audit?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setLogs(json.data);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedEntity]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `crisisos-audit-log-${new Date().toISOString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
              <span>📜</span> Compliance & Immutable Audit Trail
            </h1>
            <span className="badge-critical text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
              TAMPER-EVIDENT
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Complete audit trail of all commander overrides, AI recommendations, dispatches, and emergency state transitions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <span>📥</span> Export Audit JSON
          </button>
          <button
            onClick={() => fetchLogs()}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <span>🔄</span> Refresh
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search by action, actor, or entity ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base pl-9 text-xs w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Entity:</span>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="input-base py-1.5 px-2 text-xs bg-slate-900"
            >
              {ENTITIES.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading audit records...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No audit records found.</div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredLogs.map((log) => {
              const isExpanded = expandedId === log.id;
              let parsedDetails = null;
              try {
                if (log.details) parsedDetails = JSON.parse(log.details);
              } catch {
                parsedDetails = log.details;
              }

              const isOverride = log.action.includes("OVERRIDE");
              const isApprove = log.action.includes("APPROVE");
              const isReject = log.action.includes("REJECT");

              return (
                <div key={log.id} className="p-4 hover:bg-slate-900/40 transition-colors space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                          isOverride
                            ? "bg-amber-950 text-amber-300 border border-amber-800"
                            : isApprove
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : isReject
                            ? "bg-red-950 text-red-300 border border-red-800"
                            : "bg-blue-950 text-blue-300 border border-blue-800"
                        }`}
                      >
                        {log.action}
                      </span>

                      <span className="text-xs font-mono text-slate-300 font-semibold">
                        {log.entity} <span className="text-slate-500">({log.entityId.slice(0, 8)}...)</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                      <span>
                        👤 <strong>{log.actor}</strong> ({log.actorRole})
                      </span>
                      <span className="text-slate-500">{formatRelativeTime(log.createdAt)}</span>
                      {log.details && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : log.id)}
                          className="text-blue-400 hover:underline text-[11px]"
                        >
                          {isExpanded ? "Hide Details ▲" : "View JSON ▼"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded JSON details */}
                  {isExpanded && log.details && (
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                      <pre>{JSON.stringify(parsedDetails, null, 2)}</pre>
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

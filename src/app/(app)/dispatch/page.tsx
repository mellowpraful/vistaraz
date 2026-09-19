"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import { INCIDENT_TYPE_ICONS } from "@/lib/types";

interface Incident {
  id: string;
  title: string;
  type: string;
  severity: string;
  status: string;
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
  requiredCapabilities: string | null;
}

interface Resource {
  id: string;
  name: string;
  type: string;
  status: string;
  agency: { name: string };
  capabilities: Array<{ capability: string }>;
}

interface Recommendation {
  id: string;
  resourceId: string;
  score: number;
  etaMinutes: number | null;
  distanceKm: number | null;
  reasons: string;
  resource: {
    name: string;
    type: string;
    status: string;
    agency: { name: string };
  };
}

function DispatchContent() {
  const searchParams = useSearchParams();
  const initialIncidentId = searchParams.get("incidentId") || "";

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState(initialIncidentId);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [recommending, setRecommending] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Manual Override Form
  const [overrideResourceId, setOverrideResourceId] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [showOverride, setShowOverride] = useState(false);

  // Rejection modal
  const [rejectRecId, setRejectRecId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("Unit needed for higher priority area");

  // Fetch all active incidents
  const fetchIncidents = useCallback(async () => {
    try {
      const res = await fetch("/api/incidents?status=REPORTED,VERIFIED,ASSIGNED,IN_PROGRESS");
      const json = await res.json();
      if (json.success) {
        setIncidents(json.data);
        if (!selectedIncidentId && json.data.length > 0) {
          setSelectedIncidentId(json.data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load incidents:", err);
    }
  }, [selectedIncidentId]);

  // Fetch all resources for manual override
  const fetchResources = useCallback(async () => {
    try {
      const res = await fetch("/api/resources?status=AVAILABLE");
      const json = await res.json();
      if (json.success) {
        setResources(json.data);
      }
    } catch (err) {
      console.error("Failed to load resources:", err);
    }
  }, []);

  // Fetch recommendations for selected incident
  const fetchRecommendations = useCallback(async (incId: string) => {
    if (!incId) return;
    setRecommending(true);
    try {
      const res = await fetch("/api/dispatch/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentId: incId }),
      });
      const json = await res.json();
      if (json.success) {
        setRecommendations(json.data);
      }
    } catch (err) {
      console.error("Failed to generate recommendations:", err);
    } finally {
      setRecommending(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
    fetchResources();
  }, [fetchIncidents, fetchResources]);

  useEffect(() => {
    if (selectedIncidentId) {
      const found = incidents.find((i) => i.id === selectedIncidentId);
      if (found) setSelectedIncident(found);
      fetchRecommendations(selectedIncidentId);
    }
  }, [selectedIncidentId, incidents, fetchRecommendations]);

  const handleApprove = async (recommendationId: string, resourceId: string) => {
    setProcessingId(recommendationId);
    try {
      const res = await fetch("/api/dispatch/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentId: selectedIncidentId,
          resourceId,
          recommendationId,
          action: "APPROVE",
          approvedBy: "demo-commander",
        }),
      });
      const json = await res.json();
      if (json.success) {
        fetchRecommendations(selectedIncidentId);
        fetchIncidents();
        fetchResources();
      }
    } catch (err) {
      console.error("Approval error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectRecId) return;
    setProcessingId(rejectRecId);
    try {
      const rec = recommendations.find((r) => r.id === rejectRecId);
      const res = await fetch("/api/dispatch/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentId: selectedIncidentId,
          resourceId: rec?.resourceId,
          recommendationId: rejectRecId,
          action: "REJECT",
          rejectionReason: rejectReason,
          approvedBy: "demo-commander",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setRejectRecId(null);
        fetchRecommendations(selectedIncidentId);
      }
    } catch (err) {
      console.error("Rejection error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleManualOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideResourceId || !overrideReason.trim()) return;
    setProcessingId("manual");
    try {
      const res = await fetch("/api/dispatch/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentId: selectedIncidentId,
          resourceId: overrideResourceId,
          action: "MANUAL_OVERRIDE",
          notes: overrideReason,
          approvedBy: "demo-commander",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowOverride(false);
        setOverrideResourceId("");
        setOverrideReason("");
        fetchRecommendations(selectedIncidentId);
        fetchIncidents();
        fetchResources();
      }
    } catch (err) {
      console.error("Manual override error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
            <span>⚡</span> AI Dispatch Recommendation & Approval Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Human-in-the-loop resource allocation engine powered by capability matching, proximity & workload scoring
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOverride(!showOverride)}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <span>⚙️</span> {showOverride ? "Hide Manual Override" : "Manual Override"}
          </button>
        </div>
      </div>

      {/* Incident Selector Bar */}
      <div className="card p-4 space-y-3 bg-slate-900 border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Target Incident:
            </span>
            <select
              value={selectedIncidentId}
              onChange={(e) => setSelectedIncidentId(e.target.value)}
              className="input-base text-xs bg-slate-950 font-semibold flex-1 max-w-xl py-2"
            >
              {incidents.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  [{inc.severity}] {inc.title} — ({inc.status})
                </option>
              ))}
            </select>
          </div>

          {selectedIncident && (
            <Link
              href={`/incidents/${selectedIncident.id}`}
              className="btn-secondary text-xs py-1.5 px-3 self-start md:self-auto flex items-center gap-1"
            >
              View Full SITREP →
            </Link>
          )}
        </div>

        {selectedIncident && (
          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <span>{INCIDENT_TYPE_ICONS[selectedIncident.type as keyof typeof INCIDENT_TYPE_ICONS] || "🚨"}</span>
              <strong>{selectedIncident.type}</strong>
            </span>
            <span>📍 {selectedIncident.locationName || "Location coordinates set"}</span>
            <span className="badge-critical text-[10px] px-2 py-0.5 rounded font-mono">
              {selectedIncident.severity}
            </span>
            <span className="badge-neutral text-[10px] px-2 py-0.5 rounded font-mono">
              {selectedIncident.status}
            </span>
          </div>
        )}
      </div>

      {/* Manual Override Drawer */}
      {showOverride && (
        <form onSubmit={handleManualOverride} className="card p-5 border-amber-800/80 bg-amber-950/20 space-y-4">
          <div className="flex items-center justify-between border-b border-amber-900/60 pb-2">
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <span>⚠️</span> Commander Manual Override Dispatch
            </h3>
            <span className="text-[10px] text-amber-400 font-mono">Mandatory Audit Logged</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Select Available Resource *</label>
              <select
                required
                value={overrideResourceId}
                onChange={(e) => setOverrideResourceId(e.target.value)}
                className="input-base text-xs w-full bg-slate-950"
              >
                <option value="">-- Choose Resource --</option>
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.type}) — {r.agency.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Override Rationale / Justification *</label>
              <input
                type="text"
                required
                placeholder="e.g. Tactical proximity override approved by Incident Commander..."
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="input-base text-xs w-full bg-slate-950"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowOverride(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processingId === "manual"}
              className="btn-primary text-xs bg-amber-600 hover:bg-amber-500"
            >
              {processingId === "manual" ? "Executing..." : "Authorize Manual Dispatch"}
            </button>
          </div>
        </form>
      )}

      {/* Recommendations Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span>🤖</span> Ranked Candidate Recommendations ({recommendations.length})
          </h2>
          <button
            onClick={() => fetchRecommendations(selectedIncidentId)}
            disabled={recommending}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <span>🔄</span> {recommending ? "Recalculating..." : "Recalculate AI Match"}
          </button>
        </div>

        {recommending ? (
          <div className="card p-12 text-center text-slate-400 space-y-3 flex flex-col items-center justify-center">
            <div className="animate-spin text-3xl">⚙️</div>
            <p className="text-sm">Analyzing capability matrix, ETA, and real-time fleet telemetry...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="card p-12 text-center text-slate-500 space-y-3">
            <div className="text-4xl">🛡️</div>
            <h3 className="text-base font-semibold text-slate-300">No candidate units found</h3>
            <p className="text-xs max-w-sm mx-auto">
              All capable units may currently be dispatched. Use manual override or free up returning units.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {recommendations.map((rec, rank) => {
              let reasonsArr: string[] = [];
              try {
                reasonsArr = JSON.parse(rec.reasons);
              } catch {
                if (rec.reasons) reasonsArr = [rec.reasons];
              }

              const scorePct = Math.round(rec.score * 100);
              const isTopPick = rank === 0;

              return (
                <div
                  key={rec.id}
                  className={`card p-5 transition-all duration-200 ${
                    isTopPick
                      ? "border-purple-600/80 bg-purple-950/15 shadow-lg shadow-purple-950/40 ring-1 ring-purple-600/40"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    {/* Left: Unit Info & Reasons */}
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        {isTopPick && (
                          <span className="text-[10px] font-bold bg-purple-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                            ★ Primary AI Pick
                          </span>
                        )}
                        <h3 className="text-base font-bold text-slate-100">{rec.resource.name}</h3>
                        <span className="badge-neutral text-[11px] px-2 py-0.5 rounded font-mono">
                          {rec.resource.type}
                        </span>
                        <span className="text-xs text-slate-400">
                          Agency: <strong className="text-slate-200">{rec.resource.agency.name}</strong>
                        </span>
                      </div>

                      {/* Reasons tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {reasonsArr.map((r, i) => (
                          <span
                            key={i}
                            className="text-xs bg-slate-900 border border-slate-800 text-emerald-400 px-2.5 py-1 rounded flex items-center gap-1 font-mono"
                          >
                            ✓ {r}
                          </span>
                        ))}
                      </div>

                      {/* Distance & ETA */}
                      <div className="flex items-center gap-5 text-xs text-slate-400 font-mono">
                        {rec.etaMinutes !== null && (
                          <span>
                            ⏱️ Estimated ETA: <strong className="text-slate-200">{rec.etaMinutes} mins</strong>
                          </span>
                        )}
                        {rec.distanceKm !== null && (
                          <span>
                            📏 Route Distance: <strong className="text-slate-200">{rec.distanceKm} km</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Score Gauge & Action Buttons */}
                    <div className="flex items-center gap-6 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-800">
                      <div className="text-center">
                        <div className="text-2xl font-black text-purple-400 font-mono">{scorePct}%</div>
                        <div className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
                          Match Score
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <button
                          onClick={() => setRejectRecId(rec.id)}
                          disabled={processingId === rec.id}
                          className="btn-secondary text-xs py-2 px-3 hover:border-red-600 hover:text-red-400"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(rec.id, rec.resourceId)}
                          disabled={processingId === rec.id}
                          className="btn-primary text-xs py-2 px-4 shadow-md shadow-blue-600/30"
                        >
                          {processingId === rec.id ? "Deploying..." : "✓ Approve & Dispatch"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectRecId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="card max-w-md w-full p-6 space-y-4 border-slate-700 bg-slate-900 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <span>🚫</span> Reason for Rejecting Recommendation
            </h3>
            <p className="text-xs text-slate-400">
              CrisisOS records all AI recommendation rejections in the compliance audit trail for accountability and model retraining.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="input-base text-xs w-full bg-slate-950"
              placeholder="Specify rejection rationale..."
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setRejectRecId(null)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="btn-primary text-xs bg-red-600 hover:bg-red-500"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DispatchPage() {
  return (
    <Suspense fallback={<div className="card p-12 text-center text-slate-400">Loading dispatch studio...</div>}>
      <DispatchContent />
    </Suspense>
  );
}

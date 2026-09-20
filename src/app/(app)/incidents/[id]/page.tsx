"use client";

import { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import { INCIDENT_TYPE_ICONS, SEVERITY_DOT } from "@/lib/types";
import MapWrapper from "@/components/map/MapWrapper";

interface IncidentDetail {
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
  language: string | null;
  originalReport: string | null;
  aiExtracted: boolean;
  confidence: number | null;
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
      status: string;
      agency: { name: string };
    };
  }>;
  recommendations: Array<{
    id: string;
    resourceId: string;
    score: number;
    etaMinutes: number | null;
    distanceKm: number | null;
    reasons: string;
    confidence: number | null;
    resource: {
      name: string;
      type: string;
      status: string;
      agency: { name: string };
    };
  }>;
  events: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    actor: string | null;
    createdAt: string;
  }>;
}

const STATUS_STEPS = ["REPORTED", "VERIFIED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export default function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");

  // Add event state
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventType, setEventType] = useState("SITUATION_UPDATE");
  const [addingEvent, setAddingEvent] = useState(false);

  // Recommendations state
  const [recommending, setRecommending] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchIncident = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/incidents/${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setIncident(json.data);
        setNewStatus(json.data.status);
      }
    } catch (err) {
      console.error("Failed to fetch incident details:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchIncident();
  }, [fetchIncident]);

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === incident?.status) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/incidents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, notes: statusNote }),
      });
      const json = await res.json();
      if (json.success) {
        setStatusNote("");
        fetchIncident();
      }
    } catch (err) {
      console.error("Status update failed:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;
    setAddingEvent(true);
    try {
      const res = await fetch(`/api/incidents/${id}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: eventTitle,
          description: eventDesc,
          type: eventType,
          authorName: "Command Operator",
          authorRole: "COMMANDER",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setEventTitle("");
        setEventDesc("");
        fetchIncident();
      }
    } catch (err) {
      console.error("Failed to add event:", err);
    } finally {
      setAddingEvent(false);
    }
  };

  const handleGenerateRecommendations = async () => {
    setRecommending(true);
    try {
      const res = await fetch("/api/dispatch/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentId: id }),
      });
      const json = await res.json();
      if (json.success) {
        fetchIncident();
      }
    } catch (err) {
      console.error("Failed to generate recommendations:", err);
    } finally {
      setRecommending(false);
    }
  };

  const handleApproveRecommendation = async (recommendationId: string, resourceId: string) => {
    setApprovingId(recommendationId);
    try {
      const res = await fetch("/api/dispatch/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentId: id,
          resourceId,
          recommendationId,
          action: "APPROVE",
          approvedBy: "demo-commander",
        }),
      });
      const json = await res.json();
      if (json.success) {
        fetchIncident();
      }
    } catch (err) {
      console.error("Approval failed:", err);
    } finally {
      setApprovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="card p-16 text-center text-slate-400 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin text-4xl">⏳</div>
        <p className="text-sm">Loading incident details & live telemetry...</p>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="card p-12 text-center text-slate-400 space-y-4">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-lg font-bold text-slate-200">Incident Not Found</h2>
        <Link href="/incidents" className="btn-secondary text-xs inline-block">
          ← Back to Incident Queue
        </Link>
      </div>
    );
  }

  let parsedHazards: string[] = [];
  let parsedCaps: string[] = [];
  try {
    if (incident.hazards) parsedHazards = JSON.parse(incident.hazards);
  } catch {}
  try {
    if (incident.requiredCapabilities) parsedCaps = JSON.parse(incident.requiredCapabilities);
  } catch {}

  const currentStepIndex = STATUS_STEPS.indexOf(incident.status);

  return (
    <div className="space-y-6">
      {/* Top Navigation & Status Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/incidents" className="btn-secondary text-xs py-1 px-2.5">
            ← Queue
          </Link>
          <span className="text-xs text-slate-500 font-mono">ID: {incident.id}</span>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1.5 ${
              incident.severity === "CRITICAL"
                ? "bg-red-950 text-red-300 border border-red-800 animate-pulse"
                : incident.severity === "HIGH"
                ? "bg-orange-950 text-orange-300 border border-orange-800"
                : "bg-blue-950 text-blue-300 border border-blue-800"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${SEVERITY_DOT[incident.severity as keyof typeof SEVERITY_DOT] || "bg-slate-400"}`} />
            {incident.severity} SEVERITY
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/dispatch?incidentId=${incident.id}`}
            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <span>⚡</span> Open Dispatch Studio
          </Link>
          <Link
            href={`/map?lat=${incident.latitude || 23.0225}&lng=${incident.longitude || 72.5714}`}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <span>🗺️</span> View on Map
          </Link>
        </div>
      </div>

      {/* Incident Header & Live Status Stepper */}
      <div className="card p-5 space-y-4 border-slate-800 bg-slate-900/90">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {INCIDENT_TYPE_ICONS[incident.type as keyof typeof INCIDENT_TYPE_ICONS] || "🚨"}
              </span>
              <h1 className="text-xl font-bold text-slate-100">{incident.title}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span>📍 {incident.locationName || "Coordinates Provided"}</span>
              <span>📡 Source: <strong className="text-slate-300">{incident.source}</strong></span>
              <span>🕒 Created: {formatRelativeTime(incident.createdAt)}</span>
              {incident.aiExtracted && (
                <span className="text-purple-400 font-mono">🤖 Auto-Extracted via AI</span>
              )}
            </div>
          </div>

          {/* Quick Status Transition Dropdown */}
          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="input-base text-xs py-1 px-2 bg-slate-900 font-semibold"
            >
              {STATUS_STEPS.map((st) => (
                <option key={st} value={st}>
                  {st.replace("_", " ")}
                </option>
              ))}
            </select>
            <button
              onClick={handleUpdateStatus}
              disabled={updatingStatus || newStatus === incident.status}
              className="btn-primary text-xs py-1 px-3 disabled:opacity-40"
            >
              {updatingStatus ? "Saving..." : "Update"}
            </button>
          </div>
        </div>

        {/* Interactive Progress Bar */}
        <div className="pt-2">
          <div className="grid grid-cols-6 gap-2">
            {STATUS_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step} className="space-y-1 text-center">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isCurrent
                        ? "bg-blue-500 shadow-md shadow-blue-500/50 animate-pulse"
                        : isPast
                        ? "bg-emerald-500"
                        : "bg-slate-800"
                    }`}
                  />
                  <span
                    className={`text-[10px] font-mono block truncate ${
                      isCurrent
                        ? "text-blue-400 font-bold"
                        : isPast
                        ? "text-emerald-400"
                        : "text-slate-600"
                    }`}
                  >
                    {step.replace("_", " ")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Details, AI Insights, Recommendations, Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Situation Description & Details */}
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span>📋</span> Situation Overview & Description
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-lg border border-slate-800/80">
              {incident.description}
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
                <div className="text-[11px] text-slate-500 uppercase font-mono">Affected</div>
                <div className="text-lg font-bold text-slate-100">{incident.affectedCount || 0}</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
                <div className="text-[11px] text-slate-500 uppercase font-mono">Injuries</div>
                <div className="text-lg font-bold text-red-400">{incident.injuryCount || 0}</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
                <div className="text-[11px] text-slate-500 uppercase font-mono">Assigned</div>
                <div className="text-lg font-bold text-emerald-400">{incident.assignments.length}</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
                <div className="text-[11px] text-slate-500 uppercase font-mono">AI Conf</div>
                <div className="text-lg font-bold text-purple-400">
                  {incident.confidence ? `${Math.round(incident.confidence * 100)}%` : "N/A"}
                </div>
              </div>
            </div>

            {/* Hazards & Required Capabilities */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1.5">Identified Scene Hazards:</span>
                <div className="flex flex-wrap gap-1.5">
                  {parsedHazards.length > 0 ? (
                    parsedHazards.map((h, i) => (
                      <span key={i} className="text-xs bg-red-950/70 text-red-300 border border-red-900 px-2.5 py-1 rounded">
                        ⚠️ {h}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No special hazards flagged</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1.5">Required Resource Capabilities:</span>
                <div className="flex flex-wrap gap-1.5">
                  {parsedCaps.length > 0 ? (
                    parsedCaps.map((c, i) => (
                      <span key={i} className="text-xs bg-blue-950/70 text-blue-300 border border-blue-900 px-2.5 py-1 rounded">
                        🎯 {c}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">Standard emergency response</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Location & Interactive Map Card */}
          <div className="card p-5 space-y-3 flex flex-col h-[400px]">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>📍</span> Incident Location
              </span>
              <span className="text-[10px] text-slate-500 font-mono font-normal">
                {incident.latitude?.toFixed(4) || "N/A"}, {incident.longitude?.toFixed(4) || "N/A"}
              </span>
            </h3>
            
            <div className="flex-1 rounded-lg overflow-hidden border border-slate-800 relative bg-slate-950">
              {incident.latitude && incident.longitude ? (
                <div className="absolute inset-0 z-0">
                  <MapWrapper
                    latitude={incident.latitude}
                    longitude={incident.longitude}
                    readOnly={true}
                  />
                </div>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-500 text-xs italic">
                  Location unavailable
                </div>
              )}
            </div>
            
            <div className="pt-2 text-xs text-slate-400 flex items-center justify-between font-mono">
              <span className="truncate max-w-[200px]">{incident.locationName || "No specific address"}</span>
              <Link
                href={`/map?lat=${incident.latitude || 23.0225}&lng=${incident.longitude || 72.5714}`}
                className="text-blue-400 hover:text-blue-300 transition"
              >
                Open Full Map →
              </Link>
            </div>
          </div>

          {/* AI Recommended Dispatches */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                  AI Capability Matching Recommendations
                </h3>
              </div>
              <button
                onClick={handleGenerateRecommendations}
                disabled={recommending}
                className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1"
              >
                {recommending ? "Matching..." : "⚡ Re-calculate Match"}
              </button>
            </div>

            {incident.recommendations && incident.recommendations.length > 0 ? (
              <div className="space-y-3">
                {incident.recommendations.map((rec) => {
                  let reasonsArr: string[] = [];
                  try {
                    reasonsArr = JSON.parse(rec.reasons);
                  } catch {
                    if (rec.reasons) reasonsArr = [rec.reasons];
                  }

                  return (
                    <div
                      key={rec.id}
                      className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200 text-sm">{rec.resource.name}</span>
                          <span className="badge-neutral text-[10px] px-2 py-0.5 rounded font-mono">
                            {rec.resource.type}
                          </span>
                          <span className="text-xs font-mono text-purple-400 font-bold">
                            Match Score: {Math.round(rec.score * 100)}%
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-3">
                          <span>🏢 {rec.resource.agency.name}</span>
                          {rec.etaMinutes && <span>⏱️ ETA: ~{rec.etaMinutes} mins</span>}
                          {rec.distanceKm && <span>📏 Distance: {rec.distanceKm} km</span>}
                        </div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {reasonsArr.map((r, i) => (
                            <span key={i} className="text-[10px] text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded">
                              ✓ {r}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleApproveRecommendation(rec.id, rec.resourceId)}
                        disabled={approvingId === rec.id}
                        className="btn-primary text-xs py-1.5 px-3 self-end sm:self-center shrink-0"
                      >
                        {approvingId === rec.id ? "Deploying..." : "✓ Approve & Deploy"}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-slate-800 rounded-lg space-y-2">
                <p className="text-xs text-slate-400">
                  No recommendations generated yet for this incident.
                </p>
                <button
                  onClick={handleGenerateRecommendations}
                  disabled={recommending}
                  className="btn-primary text-xs py-1.5 px-4"
                >
                  Run AI Capability Matcher
                </button>
              </div>
            )}
          </div>

          {/* Incident Timeline & Activity Log */}
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span>🕒</span> Real-Time Incident Timeline & Events
            </h3>

            {/* Add Event Form */}
            <form onSubmit={handleAddEvent} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Event title (e.g. 'NDRF Boat 02 reached site')..."
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="input-base text-xs sm:col-span-2"
                />
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="input-base text-xs"
                >
                  <option value="SITUATION_UPDATE">Situation Update</option>
                  <option value="RESOURCE_DEPLOYED">Resource Deployed</option>
                  <option value="CASUALTY_UPDATE">Casualty Update</option>
                  <option value="HAZARD_ALERT">Hazard Alert</option>
                  <option value="STATUS_CHANGE">Status Change</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Additional details / SITREP notes..."
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  className="input-base text-xs flex-1"
                />
                <button
                  type="submit"
                  disabled={addingEvent || !eventTitle.trim()}
                  className="btn-primary text-xs py-1.5 px-3 shrink-0"
                >
                  {addingEvent ? "Posting..." : "+ Post Event"}
                </button>
              </div>
            </form>

            {/* Events Stream */}
            <div className="space-y-3 pt-2">
              {incident.events && incident.events.length > 0 ? (
                incident.events.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 bg-slate-950/70 rounded-lg border-l-2 border-l-blue-500 border-r border-t border-b border-slate-800/80 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">{ev.title}</span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {formatRelativeTime(ev.createdAt)}
                      </span>
                    </div>
                    {ev.description && (
                      <p className="text-xs text-slate-300">{ev.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono pt-0.5">
                      <span>👤 {ev.actor || "System"}</span>
                      <span>•</span>
                      <span className="text-blue-400">{ev.type}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">No events logged yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Assigned Units, Location Card, Original Report */}
        <div className="space-y-6">
          {/* Active Assigned Resources Card */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <span>🛡️</span> Deployed Units ({incident.assignments.length})
              </h3>
              <Link href={`/dispatch?incidentId=${incident.id}`} className="text-xs text-blue-400 hover:underline">
                Manage
              </Link>
            </div>

            {incident.assignments.length > 0 ? (
              <div className="space-y-2.5">
                {incident.assignments.map((as) => (
                  <div
                    key={as.id}
                    className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-200">{as.resource.name}</span>
                      <span className="badge-critical text-[10px] px-1.5 py-0.5 rounded font-mono">
                        {as.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>🏢 {as.resource.agency.name}</span>
                      <span className="font-mono text-slate-500">
                        {formatRelativeTime(as.assignedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-lg text-center space-y-2">
                <p className="text-xs text-amber-300 font-medium">⚠️ No units deployed yet</p>
                <Link
                  href={`/dispatch?incidentId=${incident.id}`}
                  className="btn-primary text-xs py-1 px-3 inline-block"
                >
                  Dispatch Units Now
                </Link>
              </div>
            )}
          </div>

          {/* Original 911 Call / Report Transcript if present */}
          {incident.originalReport && (
            <div className="card p-5 space-y-2.5">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <span>🎙️</span> Raw Intake Transcript
              </h3>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-400 font-mono leading-relaxed max-h-48 overflow-y-auto">
                &ldquo;{incident.originalReport}&rdquo;
              </div>
              <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
                <span>Language: {incident.language || "en"}</span>
                <span>Verified: Yes</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

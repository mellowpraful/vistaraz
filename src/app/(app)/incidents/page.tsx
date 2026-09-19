"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import { INCIDENT_TYPE_ICONS, SEVERITY_DOT } from "@/lib/types";

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
      const params = new URLSearchParams();
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);
      if (selectedSeverity !== "ALL") params.set("severity", selectedSeverity);
      if (selectedType !== "ALL") params.set("type", selectedType);

      const res = await fetch(`/api/incidents?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setIncidents(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch incidents:", err);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Incident Response Queue
            </h1>
            <span className="badge-critical font-mono text-xs px-2.5 py-0.5 rounded-full">
              {incidents.filter((i) => i.status !== "RESOLVED" && i.status !== "CLOSED").length} Active
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time multi-agency incident intake, triage, and live command overview
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchIncidents()}
            className="btn-secondary text-xs flex items-center gap-1.5"
            title="Refresh list"
          >
            <span>🔄</span> Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary text-xs flex items-center gap-2"
          >
            <span>➕</span> Log New Incident
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="flex-1 relative">
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search by title, location, description, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base pl-9 text-xs w-full"
            />
          </div>

          {/* Severity Badges Filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs text-slate-500 font-medium mr-1 uppercase">Severity:</span>
            {SEVERITIES.map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                  selectedSeverity === sev
                    ? "bg-blue-600 text-white font-semibold"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs pt-2 border-t border-slate-800">
          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-base py-1 px-2 text-xs bg-slate-900"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Type Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input-base py-1 px-2 text-xs bg-slate-900"
            >
              {TYPES.map((tp) => (
                <option key={tp} value={tp}>
                  {tp.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto text-slate-500 text-xs">
            Showing <strong className="text-slate-300">{filteredIncidents.length}</strong> of{" "}
            {incidents.length} incidents
          </div>
        </div>
      </div>

      {/* Incident List */}
      {loading ? (
        <div className="card p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
          <div className="animate-spin text-3xl">⏳</div>
          <p className="text-sm">Loading incident queue...</p>
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="card p-12 text-center text-slate-500 space-y-3">
          <div className="text-4xl">🛡️</div>
          <h3 className="text-base font-semibold text-slate-300">No matching incidents found</h3>
          <p className="text-xs max-w-sm mx-auto">
            Try adjusting your search query, severity, or status filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredIncidents.map((incident) => {
            const isCritical = incident.severity === "CRITICAL";
            const isHigh = incident.severity === "HIGH";
            let parsedHazards: string[] = [];
            let parsedCaps: string[] = [];
            try {
              if (incident.hazards) parsedHazards = JSON.parse(incident.hazards);
            } catch {}
            try {
              if (incident.requiredCapabilities) parsedCaps = JSON.parse(incident.requiredCapabilities);
            } catch {}

            return (
              <div
                key={incident.id}
                className={`card p-4 transition-all duration-200 hover:border-slate-600 hover:shadow-lg ${
                  isCritical ? "border-l-4 border-l-red-500" : isHigh ? "border-l-4 border-l-orange-500" : "border-l-4 border-l-blue-500"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xl">
                        {INCIDENT_TYPE_ICONS[incident.type as keyof typeof INCIDENT_TYPE_ICONS] || "🚨"}
                      </span>
                      <Link
                        href={`/incidents/${incident.id}`}
                        className="text-base font-bold text-slate-100 hover:text-blue-400 transition-colors"
                      >
                        {incident.title}
                      </Link>

                      {/* Severity badge */}
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          incident.severity === "CRITICAL"
                            ? "bg-red-950 text-red-300 border border-red-800 animate-pulse"
                            : incident.severity === "HIGH"
                            ? "bg-orange-950 text-orange-300 border border-orange-800"
                            : incident.severity === "MEDIUM"
                            ? "bg-yellow-950 text-yellow-300 border border-yellow-800"
                            : "bg-slate-800 text-slate-300 border border-slate-700"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${SEVERITY_DOT[incident.severity as keyof typeof SEVERITY_DOT] || "bg-slate-400"}`} />
                        {incident.severity}
                      </span>

                      {/* Status badge */}
                      <span className="badge-neutral text-[11px] px-2 py-0.5 rounded font-mono">
                        {incident.status.replace("_", " ")}
                      </span>

                      {/* AI Extracted tag */}
                      {incident.aiExtracted && (
                        <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.5 rounded font-mono">
                          🤖 AI Extracted
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {incident.description}
                    </p>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                      {incident.locationName && (
                        <span className="flex items-center gap-1">
                          📍 <span className="text-slate-300">{incident.locationName}</span>
                        </span>
                      )}
                      {incident.affectedCount !== null && incident.affectedCount > 0 && (
                        <span className="flex items-center gap-1">
                          👥 Affected: <strong className="text-slate-200">{incident.affectedCount}</strong>
                        </span>
                      )}
                      {incident.injuryCount !== null && incident.injuryCount > 0 && (
                        <span className="flex items-center gap-1 text-red-400">
                          🩹 Injured: <strong>{incident.injuryCount}</strong>
                        </span>
                      )}
                      <span className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
                        🕒 {formatRelativeTime(incident.createdAt)}
                      </span>
                    </div>

                    {/* Hazards & Required Capabilities Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {parsedHazards.slice(0, 3).map((h, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-red-950/60 text-red-400 border border-red-900/60 px-2 py-0.5 rounded"
                        >
                          ⚠️ {h}
                        </span>
                      ))}
                      {parsedCaps.slice(0, 3).map((c, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-blue-950/60 text-blue-300 border border-blue-900/60 px-2 py-0.5 rounded"
                        >
                          🎯 {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right Action Column */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-500 font-mono">Assigned Units</div>
                      <div className="text-xs font-semibold text-slate-200">
                        {incident.assignments.length > 0 ? (
                          <span className="text-emerald-400">
                            {incident.assignments.length} Units On Duty
                          </span>
                        ) : (
                          <span className="text-amber-400 font-medium">Unassigned</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dispatch?incidentId=${incident.id}`}
                        className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                      >
                        <span>⚡</span> Dispatch
                      </Link>
                      <Link
                        href={`/incidents/${incident.id}`}
                        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                      >
                        Details →
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="card max-w-2xl w-full p-6 space-y-5 my-8 border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚨</span>
                <h3 className="text-lg font-bold text-slate-100">Log New Emergency Incident</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-lg px-2"
              >
                ✕
              </button>
            </div>

            {/* AI Fast Intake Box */}
            <div className="p-3.5 bg-purple-950/40 border border-purple-800/60 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  ✨ Fast AI Triage / Raw 911 Call Transcript Auto-Fill
                </span>
                <button
                  type="button"
                  onClick={handleAiExtract}
                  disabled={aiExtracting || !formRawText.trim()}
                  className="btn-primary text-[11px] py-1 px-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50"
                >
                  {aiExtracting ? "Analyzing..." : "Auto-Extract with AI"}
                </button>
              </div>
              <textarea
                rows={2}
                placeholder="Paste raw caller transcript, radio chatter, or notes (e.g. 'Massive flood near Sabarmati Ashram, 25 people stranded on roof, elderly injured, need rescue boats ASAP')..."
                value={formRawText}
                onChange={(e) => setFormRawText(e.target.value)}
                className="input-base text-xs w-full bg-slate-950"
              />
            </div>

            {/* Structured Form */}
            <form onSubmit={handleCreateIncident} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-medium text-slate-300">Incident Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Flash Flood - Sabarmati Riverfront Sector 4"
                    className="input-base text-xs w-full"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Incident Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input-base text-xs w-full"
                  >
                    {TYPES.filter((t) => t !== "ALL").map((t) => (
                      <option key={t} value={t}>
                        {t.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Severity Level</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="input-base text-xs w-full"
                  >
                    {SEVERITIES.filter((s) => s !== "ALL").map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-medium text-slate-300">Description / Situation Details *</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe scene conditions, hazards, access routes, and trapped victims..."
                    className="input-base text-xs w-full"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Location Landmark / Address</label>
                  <input
                    type="text"
                    value={formData.locationName}
                    onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                    placeholder="e.g. Near Sabarmati Ashram, Vadaj Road"
                    className="input-base text-xs w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                      className="input-base text-xs w-full font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                      className="input-base text-xs w-full font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Estimated People Affected</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.affectedCount}
                    onChange={(e) => setFormData({ ...formData, affectedCount: parseInt(e.target.value) || 0 })}
                    className="input-base text-xs w-full"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Injuries Reported</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.injuryCount}
                    onChange={(e) => setFormData({ ...formData, injuryCount: parseInt(e.target.value) || 0 })}
                    className="input-base text-xs w-full"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary text-xs px-5"
                >
                  {creating ? "Submitting..." : "🚨 Register Incident"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { INCIDENT_TYPE_ICONS } from "@/lib/types";
import { MapPin, Radio, Users, ChevronRight, RotateCcw, Compass } from "lucide-react";

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
  affectedCount?: number | null;
  injuryCount?: number | null;
  description?: string;
  createdAt?: string | Date;
}

interface DispatchIncidentBannerProps {
  incidents: Incident[];
  selectedIncidentId: string;
  selectedIncident: Incident | null;
  requiredCaps: string[];
  recommending: boolean;
  onSelectIncident: (id: string) => void;
  onRecalculate: () => void;
}

export function DispatchIncidentBanner({
  incidents,
  selectedIncidentId,
  selectedIncident,
  requiredCaps,
  recommending,
  onSelectIncident,
  onRecalculate,
}: DispatchIncidentBannerProps) {
  const typeIcon = selectedIncident
    ? INCIDENT_TYPE_ICONS[selectedIncident.type as keyof typeof INCIDENT_TYPE_ICONS] || "🚨"
    : "🚨";

  return (
    <div className="card relative overflow-hidden p-6 sm:p-8 md:p-10 rounded-3xl shadow-2xl space-y-7 border-slate-800">
      {/* Background Ambience Glow */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-cyan-600/15 blur-3xl" />

      {/* Selector & Action Row */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
          <label className="text-xs font-bold uppercase tracking-wider font-mono text-blue-400 flex-shrink-0 flex items-center gap-2">
            <Radio size={16} className="text-blue-400 animate-pulse" />
            TARGET CAD INCIDENT:
          </label>
          <select
            value={selectedIncidentId}
            onChange={(e) => onSelectIncident(e.target.value)}
            className="input flex-1 min-w-[280px] h-12 text-sm sm:text-base font-bold rounded-2xl bg-slate-950/70 border-slate-800 cursor-pointer shadow-inner"
          >
            {incidents.map((inc) => (
              <option key={inc.id} value={inc.id}>
                [{inc.severity}] {inc.title} — ({inc.status})
              </option>
            ))}
          </select>
        </div>

        {selectedIncident && (
          <div className="flex items-center gap-3.5 self-start lg:self-center flex-shrink-0">
            <button
              onClick={onRecalculate}
              disabled={recommending}
              className="btn btn-secondary px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-sm transition disabled:opacity-50"
            >
              <RotateCcw size={16} className={recommending ? "animate-spin text-blue-400" : ""} />
              <span>{recommending ? "Scanning CAD Units…" : "Recalculate Proximity"}</span>
            </button>

            <Link
              href={`/incidents/${selectedIncident.id}`}
              className="btn btn-primary px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xl shadow-blue-600/30"
            >
              <span>Full Incident SITREP</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        )}
      </div>

      {/* Tactical Incident Details Mission HUD */}
      {selectedIncident && (
        <div className="relative z-10 pt-6 border-t border-slate-800/80 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-start gap-5">
              <span className="text-3xl sm:text-4xl p-4 bg-slate-950/70 border border-slate-800 rounded-2xl shadow-lg flex-shrink-0 flex items-center justify-center">
                {typeIcon}
              </span>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-100">
                    {selectedIncident.title}
                  </h2>
                  <span
                    className={`text-xs font-mono px-3.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                      selectedIncident.severity === "CRITICAL"
                        ? "bg-red-950 text-red-300 border border-red-700 shadow-md"
                        : selectedIncident.severity === "HIGH"
                        ? "bg-orange-950 text-orange-300 border border-orange-700 shadow-md"
                        : "bg-blue-950 text-blue-300 border border-blue-700 shadow-md"
                    }`}
                  >
                    ● {selectedIncident.severity}
                  </span>
                  <span className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 uppercase font-semibold">
                    {selectedIncident.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300">
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin size={16} className="text-blue-400" />
                    <span>{selectedIncident.locationName || "Coordinates Registered"}</span>
                  </span>

                  {selectedIncident.latitude && selectedIncident.longitude && (
                    <span className="font-mono text-slate-300 bg-slate-950/70 px-3 py-1 rounded-lg border border-slate-800">
                      GPS: {selectedIncident.latitude.toFixed(4)}, {selectedIncident.longitude.toFixed(4)}
                    </span>
                  )}

                  {selectedIncident.affectedCount !== undefined && selectedIncident.affectedCount !== null && (
                    <span className="flex items-center gap-1.5 text-amber-300 font-mono bg-amber-950/40 px-3 py-1 rounded-lg border border-amber-800/40">
                      <Users size={15} /> {selectedIncident.affectedCount} casualties reported
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Required Capabilities Pill Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/60">
            <span className="text-xs uppercase font-mono text-slate-400 font-bold flex items-center gap-1.5">
              <Compass size={14} className="text-blue-400" />
              Required Tactical Capabilities:
            </span>
            {requiredCaps.length > 0 ? (
              requiredCaps.map((c, i) => (
                <span
                  key={i}
                  className="text-xs sm:text-sm bg-blue-950/80 border border-blue-700/60 text-blue-300 px-3.5 py-1.5 rounded-xl font-mono font-bold shadow-sm"
                >
                  {c.replace(/_/g, " ")}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic font-mono">Multi-Agency First Responder Standard Response</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DispatchIncidentBanner;

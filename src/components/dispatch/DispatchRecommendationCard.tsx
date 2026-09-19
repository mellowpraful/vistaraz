"use client";

import React, { useState } from "react";
import { formatRelativeTime, parseEquipment, getTelemetryFreshness } from "@/lib/utils";
import { RESOURCE_TYPE_ICONS } from "@/lib/types";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Shield,
  Gauge,
  Sliders,
  ChevronDown,
  ChevronUp,
  Wrench,
  Radio,
  ExternalLink,
  Info,
  Check,
  X,
} from "lucide-react";

export interface ScoreFactor {
  factor: string;
  impact: number;
  description: string;
  category: string;
}

export interface ScoreBreakdown {
  baseScore: number;
  totalScore: number;
  factors: ScoreFactor[];
}

export interface DispatchRecommendationItem {
  id: string;
  incidentId: string;
  resourceId: string;
  rank: number;
  score: number;
  etaMinutes: number | null;
  distanceKm: number | null;
  matchedCapabilities: string | string[];
  missingCapabilities: string | string[];
  reasons: string | string[];
  constraints: string | null;
  status: string;
  resource: {
    id: string;
    name: string;
    type: string;
    status: string;
    latitude: number | null;
    longitude: number | null;
    locationName?: string | null;
    reliabilityScore?: number;
    currentWorkload?: number;
    lastUpdated?: string | Date;
    agency?: {
      id?: string;
      name: string;
      type?: string;
    } | null;
    capabilities?: Array<{
      id?: string;
      capability: string;
      equipment?: string | null;
    }>;
  };
}

interface DispatchRecommendationCardProps {
  recommendation: DispatchRecommendationItem;
  rank: number;
  onApprove: (rec: DispatchRecommendationItem) => void;
  onReject: (rec: DispatchRecommendationItem) => void;
  isProcessing: boolean;
}

export function DispatchRecommendationCard({
  recommendation,
  rank,
  onApprove,
  onReject,
  isProcessing,
}: DispatchRecommendationCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const { resource } = recommendation;
  const isTopPick = rank === 0;

  // Safe parsing of JSON fields
  let matchedCaps: string[] = [];
  if (Array.isArray(recommendation.matchedCapabilities)) {
    matchedCaps = recommendation.matchedCapabilities;
  } else if (typeof recommendation.matchedCapabilities === "string") {
    try {
      matchedCaps = JSON.parse(recommendation.matchedCapabilities);
    } catch {
      matchedCaps = [recommendation.matchedCapabilities];
    }
  }

  let missingCaps: string[] = [];
  if (Array.isArray(recommendation.missingCapabilities)) {
    missingCaps = recommendation.missingCapabilities;
  } else if (typeof recommendation.missingCapabilities === "string") {
    try {
      missingCaps = JSON.parse(recommendation.missingCapabilities);
    } catch {
      missingCaps = [recommendation.missingCapabilities];
    }
  }

  let reasonsArr: string[] = [];
  if (Array.isArray(recommendation.reasons)) {
    reasonsArr = recommendation.reasons;
  } else if (typeof recommendation.reasons === "string") {
    try {
      reasonsArr = JSON.parse(recommendation.reasons);
    } catch {
      reasonsArr = recommendation.reasons ? [recommendation.reasons] : [];
    }
  }

  let constraintsObj: { constraints?: string[]; scoreBreakdown?: ScoreBreakdown } = {};
  if (typeof recommendation.constraints === "string" && recommendation.constraints) {
    try {
      constraintsObj = JSON.parse(recommendation.constraints);
    } catch {
      // fallback
    }
  }

  const scoreBreakdown = constraintsObj.scoreBreakdown;
  const telemetry = getTelemetryFreshness(resource.lastUpdated);
  const typeIcon = RESOURCE_TYPE_ICONS[resource.type] || "🛡️";
  const scorePercent = Math.min(100, Math.round(recommendation.score));

  // Equipment aggregation
  const allEquipment: string[] = [];
  resource.capabilities?.forEach((c) => {
    const parsed = parseEquipment(c.equipment);
    parsed.forEach((eq) => {
      if (!allEquipment.includes(eq)) allEquipment.push(eq);
    });
  });

  return (
    <div
      className={`card p-5 space-y-4 transition-all duration-200 relative ${
        isTopPick
          ? "border-blue-500/70 bg-gradient-to-br from-slate-900 via-blue-950/20 to-slate-900 ring-1 ring-blue-500/50 shadow-lg shadow-blue-950/30"
          : "border-slate-800 bg-slate-900/70 hover:border-slate-700"
      }`}
    >
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="text-2xl p-2 rounded-xl bg-slate-800/90 border border-slate-700/60 leading-none flex-shrink-0">
            {typeIcon}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              {isTopPick && (
                <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  ★ Primary Recommendation
                </span>
              )}
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                Rank #{rank + 1}
              </span>
              <h3 className="text-base font-bold text-slate-100 tracking-tight">{resource.name}</h3>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              {resource.agency && (
                <span className="text-[11px] font-semibold text-slate-300">
                  {resource.agency.name}
                </span>
              )}
              <span>•</span>
              <span className="font-mono text-[11px] text-slate-400">
                {resource.type.replace(/_/g, " ")}
              </span>
              <span>•</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-800">
                {resource.status}
              </span>
            </div>
          </div>
        </div>

        {/* Score Ring & Telemetry Trust */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/60">
          <div className="flex items-baseline gap-1.5">
            <div className="text-2xl font-black font-mono text-blue-400">{scorePercent}</div>
            <span className="text-xs font-mono text-slate-400">/100</span>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                telemetry.status === "live"
                  ? "bg-emerald-400 animate-ping"
                  : telemetry.status === "recent"
                  ? "bg-amber-400"
                  : "bg-slate-500"
              }`}
            />
            <span
              className={
                telemetry.status === "live"
                  ? "text-emerald-400"
                  : telemetry.status === "recent"
                  ? "text-amber-400"
                  : "text-slate-500"
              }
            >
              {telemetry.label}
            </span>
          </div>
        </div>
      </div>

      {/* Proximity & ETA Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center gap-2">
          <Clock size={15} className="text-amber-400 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-mono text-slate-400">Estimated ETA</div>
            <div className="font-bold text-slate-200">
              {recommendation.etaMinutes !== null ? `~${recommendation.etaMinutes} mins` : "Uncalculated"}
            </div>
          </div>
        </div>

        <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center gap-2">
          <MapPin size={15} className="text-blue-400 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-mono text-slate-400">Route Distance</div>
            <div className="font-bold text-slate-200">
              {recommendation.distanceKm !== null ? `${recommendation.distanceKm} km` : "Coordinates Pending"}
            </div>
          </div>
        </div>

        <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center gap-2">
          <Shield size={15} className="text-emerald-400 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-mono text-slate-400">Reliability & Load</div>
            <div className="font-bold text-slate-200">
              {Math.round((resource.reliabilityScore ?? 1.0) * 100)}% rating ({resource.currentWorkload ?? 0}% load)
            </div>
          </div>
        </div>
      </div>

      {/* Estimated ETA Disclaimer Notice */}
      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-950/40 px-2.5 py-1 rounded border border-slate-800/60">
        <Info size={12} className="text-slate-500 flex-shrink-0" />
        <span>
          Estimated transit times are algorithmic approximations based on road vectors and fleet class speeds. Field road blocks may vary.
        </span>
      </div>

      {/* Capability Match Matrix */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] uppercase font-mono text-slate-400">
          <span>Required Capabilities Fulfillable</span>
          <span className="text-emerald-400 font-bold">{matchedCaps.length} Matched</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {matchedCaps.map((cap, idx) => (
            <span
              key={idx}
              className="text-[11px] bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 px-2.5 py-0.5 rounded font-mono font-medium flex items-center gap-1"
            >
              <Check size={12} className="text-emerald-400" />
              <span>{cap.replace(/_/g, " ")}</span>
            </span>
          ))}
          {missingCaps.length > 0 && (
            <span className="text-[11px] bg-red-950/60 border border-red-800/80 text-red-300 px-2 py-0.5 rounded font-mono font-medium flex items-center gap-1">
              <X size={12} className="text-red-400" />
              <span>Missing: {missingCaps.join(", ")}</span>
            </span>
          )}
        </div>
      </div>

      {/* Equipment Inventory */}
      {allEquipment.length > 0 && (
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1 text-[10px] uppercase font-mono text-slate-400">
            <Wrench size={11} className="text-amber-400" />
            <span>Verified Onboard Equipment</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {allEquipment.map((eq, i) => (
              <span
                key={i}
                className="text-[10px] bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono"
              >
                {eq}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Explainable Reasons Summary */}
      <div className="space-y-1.5">
        <div className="text-[10px] uppercase font-mono text-slate-400">Matching Justification</div>
        <div className="space-y-1">
          {reasonsArr.map((r, i) => (
            <div key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
              <span className="text-emerald-400 flex-shrink-0 mt-0.5">✓</span>
              <span>{r}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Explainable Scoring Breakdown Accordion */}
      <div className="pt-2 border-t border-slate-800/80">
        <button
          type="button"
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center justify-between w-full py-1"
        >
          <span className="flex items-center gap-1">
            <Sliders size={12} />
            <span>Explainable Scoring Breakdown ({scoreBreakdown?.factors.length || 0} Factors)</span>
          </span>
          {showBreakdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showBreakdown && (
          <div className="mt-3 p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2 text-xs font-mono animate-slide-in">
            <div className="text-[10px] text-slate-400 uppercase border-b border-slate-800 pb-1.5 flex justify-between font-bold">
              <span>Scoring Vector & Factor</span>
              <span>Point Impact</span>
            </div>

            {scoreBreakdown?.factors ? (
              scoreBreakdown.factors.map((f, i) => (
                <div key={i} className="flex items-start justify-between gap-2 py-0.5 text-[11px]">
                  <div className="text-slate-300 flex-1">
                    <span className="font-semibold text-slate-200">{f.factor}:</span>{" "}
                    <span className="text-slate-400 text-[10px]">{f.description}</span>
                  </div>
                  <span
                    className={`font-bold font-mono ${
                      f.impact > 0
                        ? "text-emerald-400"
                        : f.impact < 0
                        ? "text-red-400"
                        : "text-slate-400"
                    }`}
                  >
                    {f.impact > 0 ? `+${f.impact}` : f.impact === 0 ? "0" : f.impact}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-slate-500 text-[11px]">No granular breakdown telemetry available.</div>
            )}

            <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-xs">
              <span className="text-slate-200">Final Recommendation Score:</span>
              <span className="text-blue-400">{scorePercent} / 100</span>
            </div>
          </div>
        )}
      </div>

      {/* Human Approval / Rejection Action Controls */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onReject(recommendation)}
          disabled={isProcessing}
          className="btn-ghost text-xs px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-950/40 border-red-900/60"
        >
          Reject...
        </button>

        <button
          type="button"
          onClick={() => onApprove(recommendation)}
          disabled={isProcessing}
          className="btn-primary text-xs px-4 py-2 font-semibold shadow-lg shadow-blue-600/20 flex items-center gap-1.5"
        >
          <CheckCircle2 size={14} />
          <span>Authorize Dispatch</span>
        </button>
      </div>
    </div>
  );
}

export default DispatchRecommendationCard;

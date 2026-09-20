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
      className={`card p-6 sm:p-8 rounded-3xl space-y-6 sm:space-y-7 transition-all duration-300 relative shadow-xl hover:shadow-2xl ${
        isTopPick
          ? "border-blue-500/80 bg-gradient-to-br from-slate-900 via-blue-950/30 to-slate-900 ring-2 ring-blue-500/40 shadow-blue-950/40"
          : "border-slate-800 bg-slate-900/80 hover:border-slate-700"
      }`}
    >
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-950/80 border border-blue-800/80 flex items-center justify-center flex-shrink-0 text-blue-400 shadow-inner">
            <Shield size={24} />
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              {isTopPick && (
                <span className="text-xs font-black bg-blue-600 text-white px-3 py-1 rounded-full uppercase tracking-wider font-mono shadow-md">
                  Primary Recommendation
                </span>
              )}
              <span className="text-xs font-mono font-bold bg-slate-800/90 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700/60">
                Rank #{rank + 1}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-100 dark:text-slate-100 tracking-tight truncate">
                {resource.name}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400">
              {resource.agency && (
                <span className="text-xs font-semibold text-slate-200 font-mono bg-slate-800/70 px-2 py-0.5 rounded-md border border-slate-700/60">
                  {resource.agency.name}
                </span>
              )}
              <span>•</span>
              <span className="font-mono text-xs text-slate-300">
                {resource.type.replace(/_/g, " ")}
              </span>
              <span>•</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                {resource.status}
              </span>
            </div>
          </div>
        </div>

        {/* Score Ring & Telemetry Trust */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800/80">
          <div className="flex items-baseline gap-1.5">
            <div className="text-3xl sm:text-4xl font-black font-mono text-blue-400">{scorePercent}</div>
            <span className="text-sm font-mono text-slate-400">/100</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
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
                  ? "text-emerald-400 font-bold"
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

      {/* Proximity & ETA Grid Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
        <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center gap-3 shadow-inner">
          <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400 shrink-0">
            <Clock size={18} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] uppercase font-mono text-slate-400 font-semibold">Estimated ETA</div>
            <div className="text-base font-bold text-slate-100 font-mono">
              {recommendation.etaMinutes !== null ? `~${recommendation.etaMinutes} mins` : "Uncalculated"}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center gap-3 shadow-inner">
          <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400 shrink-0">
            <MapPin size={18} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] uppercase font-mono text-slate-400 font-semibold">Route Distance</div>
            <div className="text-base font-bold text-slate-100 font-mono">
              {recommendation.distanceKm !== null ? `${recommendation.distanceKm} km` : "Coordinates Pending"}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center gap-3 shadow-inner">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
            <Shield size={18} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] uppercase font-mono text-slate-400 font-semibold">Reliability & Load</div>
            <div className="text-base font-bold text-slate-100 font-mono">
              {Math.round((resource.reliabilityScore ?? 1.0) * 100)}% ({resource.currentWorkload ?? 0}% load)
            </div>
          </div>
        </div>
      </div>

      {/* Estimated ETA Disclaimer Notice */}
      <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/50 px-3.5 py-2 rounded-xl border border-slate-800/70 font-sans">
        <Info size={14} className="text-blue-400 flex-shrink-0" />
        <span>
          Estimated transit times are algorithmic approximations based on live road vectors and fleet class speeds.
        </span>
      </div>

      {/* Capability Match Matrix */}
      <div className="space-y-2.5 p-4 bg-slate-950/40 rounded-2xl border border-slate-800/70">
        <div className="flex items-center justify-between text-xs uppercase font-mono text-slate-400">
          <span className="font-semibold">Required Capabilities Fulfillable</span>
          <span className="text-emerald-400 font-bold">{matchedCaps.length} Matched</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {matchedCaps.map((cap, idx) => (
            <span
              key={idx}
              className="text-xs bg-emerald-950/80 border border-emerald-800/90 text-emerald-300 px-3 py-1 rounded-xl font-mono font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Check size={13} className="text-emerald-400" />
              <span>{cap.replace(/_/g, " ")}</span>
            </span>
          ))}
          {missingCaps.length > 0 && (
            <span className="text-xs bg-red-950/80 border border-red-800/90 text-red-300 px-3 py-1 rounded-xl font-mono font-semibold flex items-center gap-1.5 shadow-sm">
              <X size={13} className="text-red-400" />
              <span>Missing: {missingCaps.join(", ")}</span>
            </span>
          )}
        </div>
      </div>

      {/* Equipment Inventory */}
      {allEquipment.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs uppercase font-mono text-slate-400 font-semibold">
            <Wrench size={13} className="text-amber-400" />
            <span>Verified Onboard Equipment</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allEquipment.map((eq, i) => (
              <span
                key={i}
                className="text-xs bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg font-mono"
              >
                {eq}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Explainable Reasons Summary */}
      <div className="space-y-2">
        <div className="text-xs uppercase font-mono text-slate-400 font-semibold">Matching Justification</div>
        <div className="space-y-1.5">
          {reasonsArr.map((r, i) => (
            <div key={i} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2">
              <span className="text-emerald-400 flex-shrink-0 mt-0.5 font-bold">✓</span>
              <span>{r}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Explainable Scoring Breakdown Accordion */}
      <div className="pt-3 border-t border-slate-800/80">
        <button
          type="button"
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="text-xs font-mono font-semibold text-blue-400 hover:text-blue-300 flex items-center justify-between w-full py-1.5 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Sliders size={14} />
            <span>Explainable Scoring Breakdown ({scoreBreakdown?.factors.length || 0} Factors)</span>
          </span>
          {showBreakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showBreakdown && (
          <div className="mt-3.5 p-4 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-2.5 text-xs font-mono animate-slide-in shadow-inner">
            <div className="text-[11px] text-slate-400 uppercase border-b border-slate-800 pb-2 flex justify-between font-bold">
              <span>Scoring Vector & Factor</span>
              <span>Point Impact</span>
            </div>

            {scoreBreakdown?.factors ? (
              scoreBreakdown.factors.map((f, i) => (
                <div key={i} className="flex items-start justify-between gap-3 py-1 text-xs">
                  <div className="text-slate-300 flex-1">
                    <span className="font-semibold text-slate-200">{f.factor}:</span>{" "}
                    <span className="text-slate-400 text-xs">{f.description}</span>
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
              <div className="text-slate-500 text-xs">No granular breakdown telemetry available.</div>
            )}

            <div className="pt-3 border-t border-slate-800 flex justify-between font-bold text-xs sm:text-sm">
              <span className="text-slate-200">Final Recommendation Score:</span>
              <span className="text-blue-400 font-black">{scorePercent} / 100</span>
            </div>
          </div>
        )}
      </div>

      {/* Human Approval / Rejection Action Controls */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4 flex-wrap">
        <button
          type="button"
          onClick={() => onReject(recommendation)}
          disabled={isProcessing}
          className="btn-ghost text-xs sm:text-sm px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 border-red-900/60 rounded-xl font-medium cursor-pointer"
        >
          Reject...
        </button>

        <button
          type="button"
          onClick={() => onApprove(recommendation)}
          disabled={isProcessing}
          className="btn-primary text-xs sm:text-sm px-6 py-2.5 font-bold shadow-xl shadow-blue-600/30 flex items-center gap-2 rounded-xl cursor-pointer"
        >
          <CheckCircle2 size={16} />
          <span>Authorize Dispatch</span>
        </button>
      </div>
    </div>
  );
}

export default DispatchRecommendationCard;

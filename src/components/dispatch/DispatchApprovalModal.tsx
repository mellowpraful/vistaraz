"use client";

import React, { useState } from "react";
import { DispatchRecommendationItem } from "./DispatchRecommendationCard";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Shield,
  X,
  Radio,
  FileText,
} from "lucide-react";

interface DispatchApprovalModalProps {
  recommendation: DispatchRecommendationItem | null;
  incidentTitle: string;
  incidentSeverity: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (recId: string) => void;
}

export function DispatchApprovalModal({
  recommendation,
  incidentTitle,
  incidentSeverity,
  isOpen,
  onClose,
  onSuccess,
}: DispatchApprovalModalProps) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !recommendation) return null;

  const { resource } = recommendation;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/dispatch/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recommendationId: recommendation.id,
          action: "APPROVED",
          notes: notes.trim() || undefined,
          userId: "demo-commander",
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Approval request rejected by backend");
      }

      onSuccess(recommendation.id);
      onClose();
    } catch (err: any) {
      console.error("Approval error:", err);
      setError(err.message || "Failed to execute consequential dispatch authorization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-lg border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden rounded-xl">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 bg-blue-950 border border-blue-800 rounded text-base">⚡</span>
              <h2 className="text-base font-bold text-slate-100">Human Dispatch Authorization</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Review and confirm consequential resource mobilization orders
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleConfirm} className="p-5 space-y-4">
          {/* Consequential Notice Banner */}
          <div className="p-3 bg-blue-950/50 border border-blue-800/80 rounded-lg flex items-start gap-2.5 text-xs text-blue-200">
            <Radio size={16} className="text-blue-400 flex-shrink-0 mt-0.5 animate-pulse" />
            <div>
              <span className="font-bold text-blue-100">MANDATORY HUMAN-IN-THE-LOOP APPROVAL:</span> AI recommendations do not automatically dispatch units. Your authorization will transition{" "}
              <span className="font-semibold text-slate-100">{resource.name}</span> to DISPATCHED state and notify field telemetry systems.
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-950/80 border border-red-800 rounded-lg flex items-start gap-2 text-xs text-red-200">
              <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Dispatch Authorization Failed:</span> {error}
                <div className="text-[11px] text-red-300 mt-0.5">
                  The operation could not be confirmed. State was not altered.
                </div>
              </div>
            </div>
          )}

          {/* Deployment Assignment Review Box */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-[10px] uppercase font-mono text-slate-400">Target Incident</span>
              <span className="font-mono text-[10px] bg-red-950 text-red-300 border border-red-800 px-1.5 py-0.2 rounded font-bold">
                {incidentSeverity}
              </span>
            </div>
            <div className="font-bold text-slate-100">{incidentTitle}</div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">Assigned Resource</span>
                <span className="font-bold text-slate-200">{resource.name}</span>
                <span className="text-[10px] text-slate-400 block">{resource.agency?.name}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-mono">Estimated Arrival</span>
                <span className="font-bold text-blue-400">
                  {recommendation.etaMinutes !== null ? `~${recommendation.etaMinutes} mins` : "Pending"}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {recommendation.distanceKm !== null ? `${recommendation.distanceKm} km transit` : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Operational Dispatch Directive Notes */}
          <div>
            <label className="text-xs font-semibold uppercase font-mono text-slate-400 block mb-1.5">
              Tactical Deployment Instructions / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Approach via North Sector entrance due to southern road flooding..."
              className="input w-full text-xs bg-slate-950/80 border-slate-800 focus:border-blue-500 text-slate-200 rounded-lg p-2.5"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-ghost text-xs px-3.5 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs px-4 py-2 font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/30"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Transmitting Dispatch Orders...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Authorize & Transmit Dispatch</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DispatchApprovalModal;

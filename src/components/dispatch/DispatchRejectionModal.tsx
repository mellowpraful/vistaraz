"use client";

import React, { useState } from "react";
import { DispatchRecommendationItem } from "./DispatchRecommendationCard";
import { AlertTriangle, Ban, X } from "lucide-react";

interface DispatchRejectionModalProps {
  recommendation: DispatchRecommendationItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (recId: string) => void;
}

const PRESET_REASONS = [
  "Unit retained for higher-priority critical incident",
  "Reported transit bottleneck / road closure on route",
  "Unit scheduled for immediate shift change / refuel",
  "Tactical reserve retention for secondary disaster surge",
  "Specialized equipment mismatch with current site hazards",
];

export function DispatchRejectionModal({
  recommendation,
  isOpen,
  onClose,
  onSuccess,
}: DispatchRejectionModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !recommendation) return null;

  const { resource } = recommendation;

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("A specific rejection rationale is mandatory to reject an AI recommendation");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/dispatch/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recommendationId: recommendation.id,
          action: "REJECTED",
          notes: reason.trim(),
          userId: "demo-commander",
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to submit recommendation rejection");
      }

      onSuccess(recommendation.id);
      onClose();
    } catch (err: any) {
      console.error("Rejection error:", err);
      setError(err.message || "Failed to submit recommendation rejection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-md border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden rounded-xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-red-950 border border-red-800 rounded text-sm text-red-400">
              <Ban size={16} />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Reject Dispatch Recommendation
              </h2>
              <p className="text-[11px] text-slate-400">Unit: {resource.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleReject} className="p-5 space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            CrisisOS requires a recorded rationale for every rejected AI dispatch recommendation to maintain audit compliance and AI retraining accuracy.
          </p>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-950/80 border border-red-800 rounded-lg flex items-start gap-2 text-xs text-red-200">
              <AlertTriangle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Preset Chips */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
              Select Preset Rationale
            </label>
            <div className="flex flex-col gap-1">
              {PRESET_REASONS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setReason(preset)}
                  className={`text-left text-[11px] p-2 rounded border transition ${
                    reason === preset
                      ? "bg-slate-800 border-red-500/80 text-slate-100 font-medium"
                      : "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/40"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Reason Textarea */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
              Or Specify Custom Reason *
            </label>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide specific operational reason for rejection..."
              className="input w-full text-xs bg-slate-950/80 border-slate-800 text-slate-200 rounded-lg p-2.5"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-ghost text-xs px-3 py-1.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="btn-primary text-xs px-3.5 py-1.5 bg-red-600 hover:bg-red-500 border-red-600 font-semibold"
            >
              {loading ? "Recording Rejection..." : "Confirm Rejection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DispatchRejectionModal;

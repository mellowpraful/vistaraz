"use client";

import React from "react";
import type { AICommanderRecommendation } from "@/lib/ai/commander-service";
import { FileCheck2, CheckCircle2, Eye, XCircle, AlertTriangle, Shield } from "lucide-react";

interface DecisionModalProps {
  recommendation: AICommanderRecommendation | null;
  decisionType: "APPROVED" | "REJECTED" | "FIELD_VERIFY";
  decisionNotes: string;
  submittingDecision: boolean;
  onDecisionTypeChange: (type: "APPROVED" | "REJECTED" | "FIELD_VERIFY") => void;
  onNotesChange: (notes: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function DecisionModal({
  recommendation,
  decisionType,
  decisionNotes,
  submittingDecision,
  onDecisionTypeChange,
  onNotesChange,
  onClose,
  onConfirm,
}: DecisionModalProps) {
  if (!recommendation) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xl w-full p-7 md:p-8 space-y-6 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-950/80 border border-purple-800 rounded-xl text-purple-300">
              <FileCheck2 size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                Commander Decision Authorization
              </h3>
              <p className="text-xs text-slate-400">
                Human-in-the-loop validation for tactical advisory directives
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-lg p-2 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Selected Directive Details */}
        <div className="space-y-3">
          <div className="text-xs font-mono font-bold uppercase text-slate-400">
            Target Directive:
          </div>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 shadow-inner">
            <div className="text-sm md:text-base font-bold text-slate-100">
              {recommendation.title}
            </div>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              {recommendation.recommendation}
            </p>
          </div>
        </div>

        {/* Decision Option Buttons */}
        <div className="space-y-2.5">
          <label className="text-xs font-mono text-slate-400 uppercase font-bold">
            Select Officer Authorization Action:
          </label>
          <div className="grid grid-cols-3 gap-3 text-xs md:text-sm">
            <button
              type="button"
              onClick={() => onDecisionTypeChange("APPROVED")}
              className={`p-3.5 rounded-xl border text-center font-bold flex flex-col items-center gap-1.5 transition-all ${
                decisionType === "APPROVED"
                  ? "bg-emerald-950 text-emerald-300 border-emerald-500 shadow-lg shadow-emerald-950/50 scale-[1.02]"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-850 hover:text-slate-200"
              }`}
            >
              <CheckCircle2 size={18} />
              <span>Authorize Order</span>
            </button>
            <button
              type="button"
              onClick={() => onDecisionTypeChange("FIELD_VERIFY")}
              className={`p-3.5 rounded-xl border text-center font-bold flex flex-col items-center gap-1.5 transition-all ${
                decisionType === "FIELD_VERIFY"
                  ? "bg-amber-950 text-amber-300 border-amber-500 shadow-lg shadow-amber-950/50 scale-[1.02]"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-850 hover:text-slate-200"
              }`}
            >
              <Eye size={18} />
              <span>Field Verify First</span>
            </button>
            <button
              type="button"
              onClick={() => onDecisionTypeChange("REJECTED")}
              className={`p-3.5 rounded-xl border text-center font-bold flex flex-col items-center gap-1.5 transition-all ${
                decisionType === "REJECTED"
                  ? "bg-red-950 text-red-300 border-red-500 shadow-lg shadow-red-950/50 scale-[1.02]"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-850 hover:text-slate-200"
              }`}
            >
              <XCircle size={18} />
              <span>Reject Directive</span>
            </button>
          </div>
        </div>

        {/* Commander Notes */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-slate-400 uppercase font-bold">
            Officer Justification & Operational Notes:
          </label>
          <textarea
            rows={3}
            placeholder="Enter mandatory tactical rationale, operational constraints, or situational amendments..."
            value={decisionNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition resize-none font-sans"
          />
        </div>

        {/* Audit Trail Disclaimer */}
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono bg-slate-950/80 p-3 rounded-xl border border-slate-800">
          <Shield size={14} className="text-purple-400 flex-shrink-0" />
          <span>Action will be permanently recorded in the immutable audit log with Commander credentials.</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs md:text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submittingDecision}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs md:text-sm shadow-xl shadow-purple-600/30 flex items-center gap-2 transition disabled:opacity-50"
          >
            {submittingDecision ? "Committing Order..." : "Authorize Decision"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DecisionModal;

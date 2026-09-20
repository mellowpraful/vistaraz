"use client";

import React from "react";
import type { AICommanderRecommendation } from "@/lib/ai/commander-service";
import { Zap, CheckCircle2, Eye, XCircle, Clock, ShieldCheck, AlertCircle } from "lucide-react";

interface RecommendationsViewProps {
  recommendations: AICommanderRecommendation[];
  onOpenDecisionModal: (rec: AICommanderRecommendation, defaultType: "APPROVED" | "REJECTED" | "FIELD_VERIFY") => void;
}

export function RecommendationsView({
  recommendations,
  onOpenDecisionModal,
}: RecommendationsViewProps) {
  const pendingCount = recommendations.filter((r) => r.approvalStatus === "PENDING").length;

  return (
    <div className="space-y-8 md:space-y-10 animate-fade-in">
      {/* Title & Stats HUD */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-900/90 p-8 md:p-9 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 uppercase tracking-wider flex items-center gap-3">
            <Zap size={24} className="text-purple-400" /> Explainable Tactical Recommendations
          </h2>
          <p className="text-sm md:text-base text-slate-300 mt-1.5">
            Algorithmic priority directives requiring authorized officer sign-off before field dispatch and deployment.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs font-mono text-amber-300 bg-amber-950/90 border border-amber-700 px-4 py-2 rounded-2xl font-bold shadow-sm">
            {pendingCount} Pending Authorization
          </span>
        </div>
      </div>

      {/* Recommendation Cards */}
      <div className="space-y-8 md:space-y-10">
        {recommendations.length === 0 ? (
          <div className="p-16 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
            No active recommendations pending commander decision.
          </div>
        ) : (
          recommendations.map((rec) => {
            const isApproved = rec.approvalStatus === "APPROVED";
            const isRejected = rec.approvalStatus === "REJECTED";
            const isVerify = rec.approvalStatus === "FIELD_VERIFY";

            return (
              <div
                key={rec.id}
                className={`p-6 md:p-7 space-y-5 border rounded-2xl transition-all shadow-xl ${
                  isApproved
                    ? "border-emerald-700/60 bg-emerald-950/20"
                    : isRejected
                    ? "border-red-800/40 bg-red-950/20 opacity-75"
                    : isVerify
                    ? "border-amber-700/60 bg-amber-950/20"
                    : "border-slate-800 bg-slate-900/90 hover:border-purple-800/60"
                }`}
              >
                {/* Top Bar: Title & Approval Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 text-xs font-mono rounded-lg bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                      {rec.actionType}
                    </span>
                    <h3 className="text-base md:text-lg font-bold text-slate-100">{rec.title}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400">
                      Confidence: <strong className="text-purple-300 font-stat text-sm">{rec.confidenceScore}%</strong>
                    </span>
                    <span
                      className={`text-xs font-mono px-3 py-1 rounded-full border font-bold ${
                        isApproved
                          ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                          : isRejected
                          ? "bg-red-950 text-red-300 border-red-800"
                          : isVerify
                          ? "bg-amber-950 text-amber-300 border-amber-700"
                          : "bg-slate-800 text-slate-300 border-slate-700"
                      }`}
                    >
                      ● {rec.approvalStatus}
                    </span>
                  </div>
                </div>

                {/* Recommendation Details: What & Why */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2 p-5 bg-slate-950/80 rounded-xl border border-slate-800/80">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      What is Recommended:
                    </div>
                    <p className="text-sm md:text-base text-slate-200 leading-relaxed font-medium">{rec.recommendation}</p>
                  </div>

                  <div className="space-y-2 p-5 bg-slate-950/80 rounded-xl border border-slate-800/80">
                    <div className="text-xs font-bold uppercase tracking-wider text-purple-400">
                      Operational Rationale (Why):
                    </div>
                    <p className="text-sm md:text-base text-slate-300 leading-relaxed">{rec.whyRecommended}</p>
                  </div>
                </div>

                {/* Supporting Data & Uncertainty Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1.5">
                    <span className="text-xs text-slate-400 font-mono font-bold block uppercase">SUPPORTING DATA</span>
                    <span className="font-semibold text-slate-100 text-sm block">{rec.supportingData.incidentTitle}</span>
                    <span className="text-xs text-slate-400 block">
                      {rec.supportingData.location} (Severity: {rec.supportingData.severity})
                    </span>
                    {rec.supportingData.resourceName && (
                      <span className="text-xs text-emerald-400 font-mono block font-semibold">
                        Unit: {rec.supportingData.resourceName} (ETA ~{rec.supportingData.etaMinutes}m)
                      </span>
                    )}
                  </div>

                  <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1.5">
                    <span className="text-xs text-amber-400 font-mono font-bold block uppercase">UNCERTAINTY & GAPS</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{rec.uncertaintyOrMissingInfo}</p>
                  </div>

                  <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1.5">
                    <span className="text-xs text-blue-400 font-mono font-bold block uppercase">REQUIRED HUMAN DECISION</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{rec.requiredHumanDecision}</p>
                    {rec.reviewedBy && (
                      <span className="text-xs text-emerald-400 font-mono block mt-2 font-bold">
                        Reviewed by: {rec.reviewedBy}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer & Human Decision Action Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2.5 text-xs font-mono text-slate-400">
                    <span>Sources: {rec.sourceReferences.join(", ")}</span>
                    <span>•</span>
                    <span>{new Date(rec.timestamp).toLocaleTimeString()}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onOpenDecisionModal(rec, "APPROVED")}
                      disabled={isApproved}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-40 transition-all"
                    >
                      <CheckCircle2 size={16} /> Approve Action
                    </button>

                    <button
                      onClick={() => onOpenDecisionModal(rec, "FIELD_VERIFY")}
                      disabled={isApproved || isVerify}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 disabled:opacity-40 transition-all"
                    >
                      <Eye size={16} /> Field Verify First
                    </button>

                    <button
                      onClick={() => onOpenDecisionModal(rec, "REJECTED")}
                      disabled={isRejected}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-red-950 text-red-400 hover:text-red-300 border border-slate-700 hover:border-red-800 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 disabled:opacity-40 transition-all"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default RecommendationsView;

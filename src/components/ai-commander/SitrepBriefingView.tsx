"use client";

import React from "react";
import type { ExecutiveSitrep } from "@/lib/ai/commander-service";
import { CheckCircle2, HelpCircle, RefreshCw, AlertTriangle, Shield, Clock } from "lucide-react";

interface SitrepBriefingViewProps {
  sitrep: ExecutiveSitrep | null;
  loading: boolean;
}

export function SitrepBriefingView({ sitrep, loading }: SitrepBriefingViewProps) {
  return (
    <div className="space-y-8 md:space-y-10 animate-fade-in">
      {/* Executive Summary Narrative Card */}
      <div className="p-8 md:p-10 bg-slate-900/90 border border-purple-900/40 space-y-6 relative overflow-hidden rounded-3xl shadow-2xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-900/30 pb-5">
          <div className="flex items-center gap-4">
            <span className="text-3xl p-3 bg-purple-950/80 border border-purple-800 rounded-2xl shadow-inner">📋</span>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-purple-300 uppercase tracking-wider">
                Automated Multi-Agency Situation Summary
              </h2>
              <p className="text-xs md:text-sm text-slate-300 mt-1">
                Synthesized across civic telemetry, citizen emergency calls, hospital beds, and fleet CAD logs
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-center">
            <span className="text-xs font-mono bg-purple-950 text-purple-300 border border-purple-800 px-3.5 py-1.5 rounded-xl font-bold">
              {sitrep?.sitrepId || "SITREP-LIVE"}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {sitrep ? new Date(sitrep.generatedAt).toLocaleTimeString() : "Live"}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-20 text-center text-slate-400 space-y-4">
            <RefreshCw size={36} className="animate-spin mx-auto text-purple-400" />
            <p className="text-base font-medium">Synthesizing live sensor telemetry, citizen calls, and fleet dispatch logs...</p>
          </div>
        ) : (
          <div className="p-7 bg-slate-950/90 rounded-2xl border border-slate-800 text-sm md:text-base text-slate-200 leading-relaxed font-sans whitespace-pre-line shadow-inner">
            {sitrep?.summary || "Analyzing operational telemetry and emergency dispatch vectors..."}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs md:text-sm text-slate-400 pt-3 gap-2 border-t border-slate-800/80">
          <span className="flex items-center gap-2 text-amber-400 font-mono font-medium">
            <AlertTriangle size={16} /> Advisory only: Emergency officer confirmation required before consequential field orders.
          </span>
          <span className="font-mono">
            Confidence Index: <strong className="text-purple-300 font-stat text-base">{sitrep?.confidenceScore || 88}%</strong>
          </span>
        </div>
      </div>

      {/* Confirmed Facts vs. Unverified Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
        {/* Key Confirmed Facts */}
        <div className="p-8 md:p-9 bg-slate-900/90 border border-emerald-900/40 space-y-6 rounded-3xl shadow-2xl">
          <div className="flex items-center justify-between border-b border-emerald-900/30 pb-4">
            <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-base uppercase tracking-wider">
              <CheckCircle2 size={20} /> Key Confirmed Facts
            </div>
            <span className="text-xs font-mono bg-emerald-950 text-emerald-300 px-3 py-1 rounded-lg border border-emerald-800 font-bold">
              Verified by Field Units & Sensors
            </span>
          </div>

          <div className="space-y-4">
            {sitrep?.confirmedFacts && sitrep.confirmedFacts.length > 0 ? (
              sitrep.confirmedFacts.map((fact) => (
                <div
                  key={fact.id}
                  className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3 hover:border-emerald-900/60 transition-colors shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm md:text-base text-slate-200 font-medium leading-relaxed">{fact.statement}</p>
                    <span className="text-xs font-mono bg-emerald-950/90 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-800/80 whitespace-nowrap font-bold">
                      {fact.confidence}% Verified
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-2 border-t border-slate-900">
                    <span className="flex items-center gap-1.5">
                      <Shield size={13} className="text-emerald-400" /> Source: <strong>{fact.source}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} /> {new Date(fact.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm italic">
                No confirmed field assertions logged in current cycle.
              </div>
            )}
          </div>
        </div>

        {/* Unverified Reports & Uncertainties */}
        <div className="p-7 bg-slate-900/90 border border-amber-900/40 space-y-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between border-b border-amber-900/30 pb-4">
            <div className="flex items-center gap-2.5 text-amber-400 font-bold text-base uppercase tracking-wider">
              <HelpCircle size={20} /> Unverified Reports & Uncertainties
            </div>
            <span className="text-xs font-mono bg-amber-950 text-amber-300 px-3 py-1 rounded-lg border border-amber-800 font-bold">
              Field Verification Required
            </span>
          </div>

          <div className="space-y-4">
            {sitrep?.unverifiedReports && sitrep.unverifiedReports.length > 0 ? (
              sitrep.unverifiedReports.map((report) => (
                <div
                  key={report.id}
                  className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3 hover:border-amber-900/60 transition-colors shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm md:text-base text-slate-200 font-medium leading-relaxed">{report.statement}</p>
                    <span className="text-xs font-mono bg-amber-950/90 text-amber-400 px-2.5 py-1 rounded-lg border border-amber-800/80 whitespace-nowrap font-bold">
                      ~{report.confidence}% Conf
                    </span>
                  </div>
                  <div className="text-xs text-amber-300/95 bg-amber-950/50 p-3 rounded-xl border border-amber-900/50 leading-relaxed">
                    <strong>Uncertainty Factor:</strong> {report.uncertaintyReason}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
                    <span>Origin: {report.reportedBy} ({report.channel})</span>
                    <span className="text-blue-400 font-medium">Directive: {report.requiredAction.slice(0, 45)}...</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm italic">
                All reports currently reconciled with verified sensor data.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SitrepBriefingView;

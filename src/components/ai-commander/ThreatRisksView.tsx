"use client";

import React from "react";
import type { ExecutiveSitrep } from "@/lib/ai/commander-service";
import { AlertTriangle, Clock, MapPin, Activity, ShieldAlert, Zap } from "lucide-react";

interface ThreatRisksViewProps {
  sitrep: ExecutiveSitrep | null;
}

export function ThreatRisksView({ sitrep }: ThreatRisksViewProps) {
  return (
    <div className="space-y-8 md:space-y-10 animate-fade-in">
      {/* 4-Hour Escalation Forecast Card */}
      <div className="p-8 md:p-10 bg-slate-900/90 border border-slate-800 space-y-8 rounded-3xl shadow-2xl backdrop-blur-md">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 uppercase tracking-wider flex items-center gap-3">
            <AlertTriangle size={24} className="text-amber-400" /> 4-Hour Escalation & Priority Risk Forecast
          </h2>
          <p className="text-sm md:text-base text-slate-300 mt-1.5">
            Predictive risk assessment based on combined meteorological, hydrological, and hazardous material models.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sitrep?.priorityRisks && sitrep.priorityRisks.length > 0 ? (
            sitrep.priorityRisks.map((risk) => (
              <div
                key={risk.id}
                className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-5 flex flex-col justify-between shadow-lg hover:border-slate-700 transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-base font-bold text-red-400 leading-snug">{risk.title}</span>
                    <span className="text-xs font-mono font-bold text-red-300 bg-red-950/90 px-3 py-1 rounded-lg border border-red-800 flex-shrink-0">
                      {risk.probabilityScore}% Prob
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-white/5">
                    <Clock size={15} className="text-amber-400" />
                    <span>Time to Breach: <strong className="text-amber-300 font-stat text-sm">{risk.timeToImpact}</strong></span>
                  </div>

                  <div className="text-xs md:text-sm text-slate-300 flex items-center gap-2">
                    <MapPin size={15} className="text-blue-400 flex-shrink-0" />
                    <span><strong>Target Zone:</strong> {risk.affectedZone}</span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-mono uppercase text-slate-400 font-bold">Cascading Threats:</span>
                    <ul className="text-xs md:text-sm text-slate-400 space-y-2 list-disc list-inside">
                      {risk.cascadingThreats.map((ct, i) => (
                        <li key={i}>{ct}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 text-xs md:text-sm text-blue-300 bg-blue-950/40 p-4 rounded-xl border border-blue-900/50 leading-relaxed">
                  <strong>Mitigation Directive:</strong> {risk.recommendedMitigation}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 p-12 text-center text-slate-400 italic">
              No priority risks exceeding escalation threshold in current telemetry cycle.
            </div>
          )}
        </div>
      </div>

      {/* Multi-Sector Cascading Pathways */}
      <div className="p-7 md:p-8 bg-slate-900/90 border border-slate-800 space-y-5 rounded-2xl shadow-xl backdrop-blur-md">
        <h3 className="text-base md:text-lg font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2.5">
          <Activity size={20} /> Multi-Sector Cascading Failure Pathways
        </h3>
        <div className="space-y-4">
          {sitrep?.cascadingEffects && sitrep.cascadingEffects.length > 0 ? (
            sitrep.cascadingEffects.map((effect, idx) => (
              <div
                key={idx}
                className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 text-sm md:text-base text-slate-300 flex items-start gap-4 shadow-sm"
              >
                <span className="text-purple-400 font-mono font-bold text-lg leading-none">0{idx + 1}.</span>
                <p className="leading-relaxed">{effect}</p>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 italic text-sm">
              No cascading systemic failure pathways detected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ThreatRisksView;

"use client";

import React, { useState } from "react";
import { RESOURCE_TYPE_ICONS } from "@/lib/types";
import { ChevronDown, ChevronUp, ShieldCheck, XCircle } from "lucide-react";

export interface IneligibleUnit {
  resource: {
    id: string;
    name: string;
    type: string;
    status: string;
    agency?: { name: string } | null;
  };
  reasons: string[];
  missingCapabilities: string[];
}

interface EligibilityAuditDrawerProps {
  ineligibleUnits: IneligibleUnit[];
  requiredCapabilities: string[];
}

export function EligibilityAuditDrawer({
  ineligibleUnits,
  requiredCapabilities,
}: EligibilityAuditDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!ineligibleUnits || ineligibleUnits.length === 0) return null;

  return (
    <div className="card overflow-hidden border border-slate-800 bg-slate-900/60 rounded-3xl shadow-xl">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3.5">
          <span className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0">
            <ShieldCheck size={18} />
          </span>
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2.5">
              <span>Capability & Availability Eligibility Audit</span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700/60">
                {ineligibleUnits.length} Units Filtered Out
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Hard filter transparency — Detailed criteria for fleet exclusions from algorithmic ranking
            </p>
          </div>
        </div>

        <span className="text-slate-400 text-xs sm:text-sm flex items-center gap-1.5 font-mono">
          <span>{isExpanded ? "Hide Audit" : "View Audit"}</span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {isExpanded && (
        <div className="p-5 sm:p-7 border-t border-slate-800 space-y-4 bg-slate-950/80 text-xs">
          {requiredCapabilities.length > 0 && (
            <div className="text-xs text-slate-400 font-mono flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-300">Mandatory Capabilities:</span>
              {requiredCapabilities.map((c, i) => (
                <span key={i} className="bg-blue-950/80 text-blue-300 px-2.5 py-1 rounded-xl border border-blue-800 font-semibold shadow-sm">
                  {c}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ineligibleUnits.map((item) => {
              const { resource, reasons } = item;
              const typeIcon = RESOURCE_TYPE_ICONS[resource.type] || "🛡️";

              return (
                <div
                  key={resource.id}
                  className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 flex items-start gap-3.5 shadow-md"
                >
                  <span className="text-2xl p-2 bg-slate-800 rounded-xl border border-slate-700 leading-none shrink-0">
                    {typeIcon}
                  </span>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold text-slate-100 text-sm">{resource.name}</div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                        {resource.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 font-mono">
                      {resource.agency?.name || "General Agency"} • {resource.type.replace(/_/g, " ")}
                    </div>

                    <div className="space-y-1 pt-1.5 border-t border-slate-800/60">
                      {reasons.map((r, idx) => (
                        <div key={idx} className="text-xs text-amber-400/90 flex items-start gap-1.5">
                          <XCircle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default EligibilityAuditDrawer;

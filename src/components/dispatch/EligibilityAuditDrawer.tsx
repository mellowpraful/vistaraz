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
    <div className="card overflow-hidden border border-slate-800 bg-slate-900/60 rounded-xl">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/30 transition"
      >
        <div className="flex items-center gap-2.5">
          <span className="p-1 bg-slate-800 border border-slate-700 text-slate-300 rounded text-xs">
            <ShieldCheck size={14} />
          </span>
          <div>
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span>Capability & Availability Eligibility Audit</span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-800 text-slate-400">
                {ineligibleUnits.length} Units Filtered Out
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Hard filter transparency — Why units were excluded from candidate recommendations
            </p>
          </div>
        </div>

        <span className="text-slate-400 text-xs flex items-center gap-1 font-mono">
          <span>{isExpanded ? "Hide Audit" : "View Audit"}</span>
          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </span>
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/70 text-xs">
          {requiredCapabilities.length > 0 && (
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
              <span className="font-bold text-slate-300">Mandatory Capabilities:</span>
              {requiredCapabilities.map((c, i) => (
                <span key={i} className="bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded border border-blue-800">
                  {c}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {ineligibleUnits.map((item) => {
              const { resource, reasons } = item;
              const typeIcon = RESOURCE_TYPE_ICONS[resource.type] || "🛡️";

              return (
                <div
                  key={resource.id}
                  className="p-3 rounded-lg border border-slate-800/80 bg-slate-900/50 flex items-start gap-2.5"
                >
                  <span className="text-lg p-1 bg-slate-800 rounded border border-slate-700 leading-none">
                    {typeIcon}
                  </span>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-200 text-xs">{resource.name}</div>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {resource.status}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400">
                      {resource.agency?.name || "General Agency"} • {resource.type.replace(/_/g, " ")}
                    </div>

                    <div className="space-y-0.5 pt-1">
                      {reasons.map((r, idx) => (
                        <div key={idx} className="text-[10px] text-amber-400/90 flex items-start gap-1">
                          <XCircle size={11} className="text-amber-500 flex-shrink-0 mt-0.5" />
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

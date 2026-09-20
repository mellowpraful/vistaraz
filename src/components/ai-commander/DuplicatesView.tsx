"use client";

import React from "react";
import Link from "next/link";
import { Search, RefreshCw, ChevronRight, Layers, MapPin, Radio } from "lucide-react";

interface DuplicatesViewProps {
  duplicates: any[];
  checkingDuplicates: boolean;
  onScanDuplicates: () => void;
}

export function DuplicatesView({
  duplicates,
  checkingDuplicates,
  onScanDuplicates,
}: DuplicatesViewProps) {
  return (
    <div className="space-y-8 md:space-y-10 animate-fade-in">
      <div className="p-8 md:p-10 bg-slate-900/90 border border-slate-800 space-y-8 rounded-3xl shadow-2xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100 uppercase tracking-wider flex items-center gap-3">
              <Search size={24} className="text-purple-400" /> AI Incident Deduplication & Report Clustering
            </h2>
            <p className="text-sm md:text-base text-slate-300 mt-1.5">
              Identifies, cross-references, and clusters multiple citizen 112/108 calls describing the same geographic emergency event.
            </p>
          </div>
          <button
            onClick={onScanDuplicates}
            disabled={checkingDuplicates}
            className="flex items-center gap-2.5 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs md:text-sm font-bold shadow-lg shadow-purple-600/30 disabled:opacity-50 transition-all self-start sm:self-center hover:scale-[1.02] active:scale-[0.98]"
          >
            <RefreshCw size={16} className={checkingDuplicates ? "animate-spin" : ""} />
            <span>{checkingDuplicates ? "Clustering Reports..." : "Scan Active Incidents"}</span>
          </button>
        </div>

        <div className="space-y-6 md:space-y-8">
          {duplicates.length === 0 ? (
            <div className="p-16 text-center text-slate-400 bg-slate-950/60 rounded-2xl border border-slate-800 text-sm">
              No duplicate incident clusters detected across active incidents in current window.
            </div>
          ) : (
            duplicates.map((cluster) => (
              <div
                key={cluster.id}
                className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4 hover:border-purple-900/60 transition-all shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-slate-100">{cluster.clusterTitle}</span>
                    <span className="text-xs font-mono bg-purple-950 text-purple-300 px-3 py-1 rounded-lg border border-purple-800 font-bold">
                      {cluster.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-mono text-xs font-semibold bg-emerald-950/80 px-3 py-1 rounded-lg border border-emerald-800">
                      {cluster.totalReports} Correlated Calls
                    </span>
                    <span className="text-xs font-mono bg-slate-900 text-slate-200 px-3 py-1 rounded-lg border border-slate-700 font-bold">
                      {cluster.confidence}% Match
                    </span>
                  </div>
                </div>

                <p className="text-sm md:text-base text-slate-300 leading-relaxed">{cluster.summary}</p>

                <div className="flex items-center justify-between text-xs md:text-sm font-mono text-slate-400 pt-3 border-t border-slate-900">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={15} className="text-blue-400" /> Geographic Radius: <strong>&lt;{cluster.proximityKm} km</strong>
                  </span>
                  <Link
                    href={`/dispatch?incidentId=${cluster.primaryIncidentId}`}
                    className="text-purple-400 hover:text-purple-300 flex items-center gap-1.5 font-sans font-bold hover:underline"
                  >
                    <span>Open in Dispatch Studio</span>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default DuplicatesView;

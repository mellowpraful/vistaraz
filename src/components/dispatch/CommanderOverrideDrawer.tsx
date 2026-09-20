"use client";

import React, { useState } from "react";
import { AlertTriangle, Radio, ShieldAlert, X } from "lucide-react";
import { RESOURCE_TYPE_ICONS } from "@/lib/types";

interface ResourceOption {
  id: string;
  name: string;
  type: string;
  status: string;
  agency?: { name: string } | null;
  capabilities?: Array<{ capability: string }>;
}

interface CommanderOverrideDrawerProps {
  incidentId: string;
  incidentTitle: string;
  resources: ResourceOption[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CommanderOverrideDrawer({
  incidentId,
  incidentTitle,
  resources,
  isOpen,
  onClose,
  onSuccess,
}: CommanderOverrideDrawerProps) {
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [justification, setJustification] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const availableResources = resources.filter(
    (r) => r.status === "AVAILABLE" || r.status === "STANDBY"
  );

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResourceId) {
      setError("Please select a resource unit to dispatch");
      return;
    }
    if (!justification.trim()) {
      setError("A mandatory operational rationale is required for Commander overrides");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/dispatch/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentId,
          resourceId: selectedResourceId,
          action: "MODIFIED",
          notes: justification.trim(),
          userId: "demo-commander",
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Commander override dispatch failed");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Commander override error:", err);
      setError(err.message || "Failed to execute commander override dispatch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 sm:p-8 border-amber-800/80 bg-amber-950/20 space-y-6 animate-slide-in rounded-3xl border shadow-xl">
      <div className="flex items-center justify-between border-b border-amber-900/60 pb-4">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 text-amber-400 flex items-center justify-center shrink-0">
            <ShieldAlert size={20} />
          </span>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-wider">
              Commander Tactical Manual Override
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Direct allocation for incident: <span className="text-slate-200 font-semibold">{incidentTitle}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono bg-amber-950 text-amber-300 border border-amber-800 px-3 py-1 rounded-xl">
            Mandatory Audit Logged
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800/60 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <form onSubmit={handleOverrideSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-950/90 border border-red-800 rounded-2xl flex items-start gap-3 text-xs sm:text-sm text-red-200">
            <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase font-mono text-slate-300">
              Select Fleet Resource Unit *
            </label>
            <select
              required
              value={selectedResourceId}
              onChange={(e) => setSelectedResourceId(e.target.value)}
              className="input text-xs sm:text-sm w-full bg-slate-950/90 border-slate-800 rounded-2xl h-12 font-medium"
            >
              <option value="">-- Choose Available Resource ({availableResources.length}) --</option>
              {availableResources.map((r) => (
                <option key={r.id} value={r.id}>
                  {RESOURCE_TYPE_ICONS[r.type] ? `${RESOURCE_TYPE_ICONS[r.type]} ` : ""}
                  {r.name} ({r.type}) — {r.agency?.name || "General"} [{r.status}]
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase font-mono text-slate-300">
              Tactical Justification / Operational Rationale *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Commander discretion: direct proximity override for life safety..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="input text-xs sm:text-sm w-full bg-slate-950/90 border-slate-800 rounded-2xl h-12 text-slate-200 placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-amber-900/40">
          <div className="text-xs text-amber-400/90 font-mono flex items-center gap-2">
            <Radio size={14} className="animate-pulse" />
            <span>Direct dispatch bypasses capability match ranking under Incident Commander authority</span>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-ghost text-xs sm:text-sm px-4 py-2.5 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedResourceId || !justification.trim()}
              className="btn-primary text-xs sm:text-sm bg-amber-600 hover:bg-amber-500 border-amber-600 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-600/20 cursor-pointer"
            >
              {loading ? "Authorizing Override..." : "Authorize Manual Dispatch"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CommanderOverrideDrawer;

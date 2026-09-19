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
    <div className="card p-5 border-amber-800/80 bg-amber-950/20 space-y-4 animate-slide-in rounded-xl border">
      <div className="flex items-center justify-between border-b border-amber-900/60 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="p-1 bg-amber-950 border border-amber-800 text-amber-400 rounded text-sm">
            <ShieldAlert size={16} />
          </span>
          <div>
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Commander Tactical Manual Override
            </h3>
            <p className="text-[11px] text-slate-400">
              Direct allocation for incident: <span className="text-slate-200 font-semibold">{incidentTitle}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded">
            Mandatory Audit Logged
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <form onSubmit={handleOverrideSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-950/80 border border-red-800 rounded-lg flex items-start gap-2 text-xs text-red-200">
            <AlertTriangle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase font-mono text-slate-300">
              Select Fleet Resource Unit *
            </label>
            <select
              required
              value={selectedResourceId}
              onChange={(e) => setSelectedResourceId(e.target.value)}
              className="input text-xs w-full bg-slate-950/90 border-slate-800 rounded-lg h-10"
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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase font-mono text-slate-300">
              Tactical Justification / Operational Rationale *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Commander discretion: direct proximity override for life safety..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="input text-xs w-full bg-slate-950/90 border-slate-800 rounded-lg h-10 text-slate-200 placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-amber-900/40">
          <div className="text-[11px] text-amber-400/90 font-mono flex items-center gap-1.5">
            <Radio size={13} className="animate-pulse" />
            <span>Direct dispatch bypasses capability match ranking under Incident Commander authority</span>
          </div>

          <div className="flex items-center gap-2">
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
              disabled={loading || !selectedResourceId || !justification.trim()}
              className="btn-primary text-xs bg-amber-600 hover:bg-amber-500 border-amber-600 font-semibold px-4 py-2"
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

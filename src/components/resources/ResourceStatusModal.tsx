"use client";

import React, { useState } from "react";
import { ResourceStatus, RESOURCE_STATUS_COLORS } from "@/lib/types";
import { ResourceStatusBadge } from "./ResourceStatusBadge";
import { AlertTriangle, CheckCircle, Clock, Info, ShieldAlert, X } from "lucide-react";

export interface ResourceItem {
  id: string;
  name: string;
  type: string;
  status: ResourceStatus | string;
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
  reliabilityScore: number;
  currentWorkload: number;
  estimatedEtaMinutes?: number | null;
  lastUpdated?: string | Date;
  agency?: {
    id: string;
    name: string;
    type: string;
  } | null;
  capabilities?: Array<{
    id: string;
    capability: string;
    equipment?: string | null;
  }>;
  assignments?: Array<{
    id: string;
    status: string;
    assignedAt: string;
    incident: {
      id: string;
      title: string;
      severity: string;
      locationName?: string | null;
    };
  }>;
}

interface ResourceStatusModalProps {
  resource: ResourceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: (updatedResource: ResourceItem) => void;
}

const ALL_STATUSES: Array<{
  value: ResourceStatus;
  label: string;
  description: string;
  color: string;
}> = [
  {
    value: "AVAILABLE",
    label: "Available & Ready",
    description: "Fully staffed, equipped, and ready for immediate dispatch.",
    color: "#4ade80",
  },
  {
    value: "STANDBY",
    label: "Standby Reserve",
    description: "Staged at base or outpost, ready on short notice.",
    color: "#9ca3af",
  },
  {
    value: "DISPATCHED",
    label: "Dispatched",
    description: "Assigned to incident, crew mobilizing for departure.",
    color: "#fb923c",
  },
  {
    value: "EN_ROUTE",
    label: "En Route",
    description: "Actively traveling toward incident scene.",
    color: "#60a5fa",
  },
  {
    value: "ON_SCENE",
    label: "On Scene",
    description: "Arrived at location, conducting emergency operations.",
    color: "#c084fc",
  },
  {
    value: "RETURNING",
    label: "Returning to Base",
    description: "Mission finished or released, returning to station.",
    color: "#22d3ee",
  },
  {
    value: "OUT_OF_SERVICE",
    label: "Out of Service",
    description: "Maintenance, refueling, crew break, or equipment repair.",
    color: "#f87171",
  },
];

export function ResourceStatusModal({
  resource,
  isOpen,
  onClose,
  onStatusUpdated,
}: ResourceStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<ResourceStatus | "">(
    (resource?.status as ResourceStatus) || "AVAILABLE"
  );
  const [notes, setNotes] = useState("");
  const [workload, setWorkload] = useState<number>(resource?.currentWorkload ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state when resource changes
  React.useEffect(() => {
    if (resource) {
      setSelectedStatus((resource.status as ResourceStatus) || "AVAILABLE");
      setWorkload(resource.currentWorkload ?? 0);
      setNotes("");
      setError(null);
    }
  }, [resource]);

  if (!isOpen || !resource) return null;

  const activeAssignment = resource.assignments?.[0];
  const isCurrentlyDeployed = ["DISPATCHED", "EN_ROUTE", "ON_SCENE", "RETURNING"].includes(
    resource.status
  );
  const isDecommissioningOrResetting =
    isCurrentlyDeployed &&
    ["AVAILABLE", "STANDBY", "OUT_OF_SERVICE"].includes(selectedStatus);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/resources", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: resource.id,
          status: selectedStatus,
          currentWorkload: workload,
          notes: notes.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update resource status");
      }

      const updated = json.data || json.resource;
      onStatusUpdated(updated);
      onClose();
    } catch (err: any) {
      console.error("Status update error:", err);
      setError(err.message || "An unexpected error occurred while updating status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-lg border border-slate-700 bg-slate-900/95 shadow-2xl overflow-hidden rounded-xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">Update Resource Status</h2>
              <ResourceStatusBadge status={resource.status} size="sm" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Unit: <span className="text-slate-200 font-semibold">{resource.name}</span>
              {resource.agency && ` • ${resource.agency.name}`}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Error Banner if API failed */}
          {error && (
            <div className="p-3 bg-red-950/80 border border-red-800/80 rounded-lg flex items-start gap-2.5 text-xs text-red-200 animate-slide-in">
              <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Status Update Failed:</span> {error}
                <div className="text-[11px] text-red-300 mt-0.5">
                  The requested status transition could not be committed. Live state preserved.
                </div>
              </div>
            </div>
          )}

          {/* Active Mission Warning */}
          {isDecommissioningOrResetting && activeAssignment && (
            <div className="p-3 bg-amber-950/60 border border-amber-800/60 rounded-lg flex items-start gap-2 text-xs text-amber-200">
              <ShieldAlert size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-300">Operational Notice:</span> Unit is currently assigned to mission{" "}
                <span className="font-bold text-slate-100">"{activeAssignment.incident.title}"</span>. Changing status to{" "}
                <span className="font-bold text-amber-300">{selectedStatus}</span> will release or alter active field tracking.
              </div>
            </div>
          )}

          {/* Target Status Picker */}
          <div>
            <label className="text-xs font-semibold uppercase font-mono text-slate-400 block mb-2">
              Select Operational State
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ALL_STATUSES.map((item) => {
                const isSelected = selectedStatus === item.value;
                const isCurrent = resource.status === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setSelectedStatus(item.value)}
                    className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-slate-800/90 border-blue-500 ring-1 ring-blue-500 shadow-md"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span
                        className="text-xs font-bold font-mono uppercase"
                        style={{ color: item.color }}
                      >
                        {item.label}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded font-mono">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{item.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Workload / Readiness Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label className="font-semibold uppercase font-mono text-slate-400">
                Workload / Capacity Utilization
              </label>
              <span className="font-mono font-bold text-slate-200">{workload}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={workload}
              onChange={(e) => setWorkload(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Operational Log Notes */}
          <div>
            <label className="text-xs font-semibold uppercase font-mono text-slate-400 block mb-1.5">
              Status Change Reason / Log Entry (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Unit returned to station for replenishment, refueled and ready..."
              rows={2}
              className="input w-full text-xs bg-slate-950/60 border-slate-800 focus:border-blue-500 text-slate-200 placeholder:text-slate-600 rounded-lg p-2.5"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-ghost text-xs px-3.5 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (selectedStatus === resource.status && workload === resource.currentWorkload && !notes)}
              className="btn-primary text-xs px-4 py-2 font-semibold flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Committing State...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={14} />
                  <span>Confirm Status Update</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResourceStatusModal;

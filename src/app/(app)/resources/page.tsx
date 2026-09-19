"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatRelativeTime, extractApiData } from "@/lib/utils";

interface Resource {
  id: string;
  name: string;
  type: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  capacity: number | null;
  fuelPercent: number | null;
  agency: {
    id: string;
    name: string;
    type: string;
  };
  capabilities: Array<{
    id: string;
    capability: string;
    rating: number;
  }>;
  assignments: Array<{
    id: string;
    status: string;
    assignedAt: string;
    incident: {
      id: string;
      title: string;
      severity: string;
    };
  }>;
}

const RESOURCE_TYPES = [
  "ALL",
  "AMBULANCE",
  "FIRE_ENGINE",
  "RESCUE_TEAM",
  "POLICE_UNIT",
  "MEDICAL_TEAM",
  "BOAT",
  "DRONE",
  "RELIEF_VEHICLE",
  "HELICOPTER",
  "HAZMAT_UNIT",
];

const RESOURCE_STATUSES = [
  "ALL",
  "AVAILABLE",
  "DISPATCHED",
  "EN_ROUTE",
  "ON_SCENE",
  "RETURNING",
  "OUT_OF_SERVICE",
];

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);

      const res = await fetch(`/api/resources?${params.toString()}`);
      const json = await res.json();
      setResources(extractApiData<Resource>(json));
    } catch (err) {
      console.error("Failed to load resources:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/resources", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        fetchResources();
      }
    } catch (err) {
      console.error("Failed to update resource status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredResources = resources.filter((r) => {
    if (selectedType !== "ALL" && r.type !== selectedType) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.agency.name.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q)
    );
  });

  const availableCount = resources.filter((r) => r.status === "AVAILABLE").length;
  const deployedCount = resources.filter((r) =>
    ["DISPATCHED", "EN_ROUTE", "ON_SCENE"].includes(r.status)
  ).length;
  const maintenanceCount = resources.filter((r) => r.status === "OUT_OF_SERVICE").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
            <span>🛡️</span> Emergency Fleet & Resource Registry
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time multi-agency fleet telemetry, capability matrix, and field unit readiness
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchResources()}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <span>🔄</span> Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 space-y-1">
          <div className="text-[11px] text-slate-400 uppercase font-mono">Total Units</div>
          <div className="text-2xl font-black text-slate-100">{resources.length}</div>
        </div>
        <div className="card p-4 space-y-1 border-l-4 border-l-emerald-500">
          <div className="text-[11px] text-emerald-400 uppercase font-mono">Available & Ready</div>
          <div className="text-2xl font-black text-emerald-400">{availableCount}</div>
        </div>
        <div className="card p-4 space-y-1 border-l-4 border-l-amber-500">
          <div className="text-[11px] text-amber-400 uppercase font-mono">Active Deployment</div>
          <div className="text-2xl font-black text-amber-400">{deployedCount}</div>
        </div>
        <div className="card p-4 space-y-1 border-l-4 border-l-red-500">
          <div className="text-[11px] text-red-400 uppercase font-mono">Out of Service</div>
          <div className="text-2xl font-black text-red-400">{maintenanceCount}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="flex-1 relative">
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search resource by name, agency, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base pl-9 text-xs w-full"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input-base py-1.5 px-2 text-xs bg-slate-900"
            >
              {RESOURCE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-base py-1.5 px-2 text-xs bg-slate-900"
            >
              {RESOURCE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resource Cards Grid */}
      {loading ? (
        <div className="card p-12 text-center text-slate-400 space-y-3 flex flex-col items-center justify-center">
          <div className="animate-spin text-3xl">⚙️</div>
          <p className="text-sm">Fetching live fleet status...</p>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="card p-12 text-center text-slate-500 space-y-3">
          <div className="text-4xl">🛡️</div>
          <h3 className="text-base font-semibold text-slate-300">No resources found</h3>
          <p className="text-xs max-w-sm mx-auto">
            Try adjusting your type or status filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((res) => {
            const isAvailable = res.status === "AVAILABLE";
            const isDeployed = ["DISPATCHED", "EN_ROUTE", "ON_SCENE"].includes(res.status);
            const activeAssignment = res.assignments?.[0];

            return (
              <div
                key={res.id}
                className="card p-5 space-y-4 hover:border-slate-700 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top info */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-100">{res.name}</h3>
                      <p className="text-xs text-slate-400">{res.agency.name}</p>
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded font-mono ${
                        isAvailable
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : isDeployed
                          ? "bg-amber-950 text-amber-300 border border-amber-800 animate-pulse"
                          : "bg-red-950 text-red-300 border border-red-800"
                      }`}
                    >
                      {res.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Capabilities */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-500 uppercase font-mono">Specialized Capabilities</span>
                    <div className="flex flex-wrap gap-1">
                      {res.capabilities && res.capabilities.length > 0 ? (
                        res.capabilities.map((c) => (
                          <span
                            key={c.id}
                            className="text-[10px] bg-slate-900 border border-slate-800 text-blue-300 px-2 py-0.5 rounded font-mono"
                          >
                            {c.capability}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-600">Standard Response</span>
                      )}
                    </div>
                  </div>

                  {/* Active Deployment Details if any */}
                  {activeAssignment && (
                    <div className="p-2.5 bg-amber-950/20 border border-amber-900/40 rounded text-xs space-y-1">
                      <div className="text-[10px] text-amber-400 font-mono font-bold uppercase">
                        Current Mission
                      </div>
                      <Link
                        href={`/incidents/${activeAssignment.incident.id}`}
                        className="font-medium text-slate-200 hover:text-amber-300 block truncate"
                      >
                        {activeAssignment.incident.title}
                      </Link>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Deployed {formatRelativeTime(activeAssignment.assignedAt)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Toggle Buttons */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 font-mono">Quick Status:</span>
                  <div className="flex items-center gap-1.5">
                    {res.status !== "AVAILABLE" && (
                      <button
                        onClick={() => handleStatusChange(res.id, "AVAILABLE")}
                        disabled={updatingId === res.id}
                        className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-1 rounded hover:bg-emerald-900 transition-colors"
                      >
                        Set Available
                      </button>
                    )}
                    {res.status !== "ON_SCENE" && (
                      <button
                        onClick={() => handleStatusChange(res.id, "ON_SCENE")}
                        disabled={updatingId === res.id}
                        className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-1 rounded hover:bg-amber-900 transition-colors"
                      >
                        Set On Scene
                      </button>
                    )}
                    {res.status !== "OUT_OF_SERVICE" && (
                      <button
                        onClick={() => handleStatusChange(res.id, "OUT_OF_SERVICE")}
                        disabled={updatingId === res.id}
                        className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-2 py-1 rounded hover:bg-red-900 transition-colors"
                      >
                        Maintenance
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ResourceItem } from "./ResourceStatusModal";
import { ResourceStatusBadge } from "./ResourceStatusBadge";
import { formatRelativeTime, parseEquipment, getTelemetryFreshness } from "@/lib/utils";
import { RESOURCE_TYPE_ICONS } from "@/lib/types";
import {
  MapPin,
  Clock,
  Gauge,
  Shield,
  Radio,
  Sliders,
  ArrowUpDown,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ResourceTableViewProps {
  resources: ResourceItem[];
  onOpenStatusModal: (resource: ResourceItem) => void;
  onQuickStatusChange: (id: string, newStatus: string) => Promise<boolean>;
  updatingId: string | null;
}

type SortField = "name" | "agency" | "status" | "workload" | "lastUpdated";
type SortDirection = "asc" | "desc";

export function ResourceTableView({
  resources,
  onOpenStatusModal,
  onQuickStatusChange,
  updatingId,
}: ResourceTableViewProps) {
  const [sortField, setSortField] = useState<SortField>("status");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedResources = [...resources].sort((a, b) => {
    let comparison = 0;
    if (sortField === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === "agency") {
      comparison = (a.agency?.name || "").localeCompare(b.agency?.name || "");
    } else if (sortField === "status") {
      comparison = (a.status || "").localeCompare(b.status || "");
    } else if (sortField === "workload") {
      comparison = (a.currentWorkload ?? 0) - (b.currentWorkload ?? 0);
    } else if (sortField === "lastUpdated") {
      const timeA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
      const timeB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
      comparison = timeA - timeB;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  return (
    <div className="card overflow-hidden border border-slate-800 bg-slate-900/60 rounded-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-[11px] uppercase font-mono text-slate-400 border-b border-slate-800">
            <tr>
              <th
                onClick={() => handleSort("name")}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-200 select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Unit & Type</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th
                onClick={() => handleSort("agency")}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-200 select-none hidden sm:table-cell"
              >
                <div className="flex items-center gap-1.5">
                  <span>Agency</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th
                onClick={() => handleSort("status")}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-200 select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th className="py-3 px-4 font-semibold hidden md:table-cell">
                <span>Location & Telemetry</span>
              </th>
              <th
                onClick={() => handleSort("workload")}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-200 select-none hidden lg:table-cell"
              >
                <div className="flex items-center gap-1.5">
                  <span>Workload</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th className="py-3 px-4 font-semibold hidden xl:table-cell">
                <span>Capabilities</span>
              </th>
              <th className="py-3 px-4 font-semibold">
                <span>Mission</span>
              </th>
              <th className="py-3 px-4 font-semibold text-right">
                <span>Controls</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sortedResources.map((res) => {
              const activeAssignment = res.assignments?.[0];
              const telemetry = getTelemetryFreshness(res.lastUpdated);
              const typeIcon = RESOURCE_TYPE_ICONS[res.type] || "🛡️";
              const isUpdating = updatingId === res.id;

              return (
                <tr
                  key={res.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Unit Name & Type */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg p-1 bg-slate-800 rounded border border-slate-700/60 leading-none flex-shrink-0">
                        {typeIcon}
                      </span>
                      <div>
                        <div className="font-bold text-slate-100 group-hover:text-blue-300 transition-colors">
                          {res.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {res.type.replace(/_/g, " ")}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Agency */}
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <span className="text-xs text-slate-300 font-medium">
                      {res.agency?.name || "State Emergency"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <ResourceStatusBadge status={res.status} size="sm" />
                  </td>

                  {/* Location & Telemetry */}
                  <td className="py-3 px-4 hidden md:table-cell">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[11px] text-slate-300">
                        <MapPin size={12} className="text-blue-400 flex-shrink-0" />
                        <span className="truncate max-w-[180px]">
                          {res.locationName || <span className="text-amber-400 italic">Unset</span>}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-mono">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            telemetry.status === "live"
                              ? "bg-emerald-400"
                              : telemetry.status === "recent"
                              ? "bg-amber-400"
                              : "bg-slate-500"
                          }`}
                        />
                        <span
                          className={
                            telemetry.status === "live"
                              ? "text-emerald-400 font-medium"
                              : telemetry.status === "recent"
                              ? "text-amber-400"
                              : "text-slate-500"
                          }
                        >
                          {telemetry.label}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Workload */}
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <div className="space-y-1 w-24">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>Load</span>
                        <span className="text-slate-200 font-bold">{res.currentWorkload}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full ${
                            (res.currentWorkload ?? 0) > 75
                              ? "bg-red-500"
                              : (res.currentWorkload ?? 0) > 40
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, res.currentWorkload ?? 0))}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Capabilities */}
                  <td className="py-3 px-4 hidden xl:table-cell">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {res.capabilities && res.capabilities.length > 0 ? (
                        res.capabilities.slice(0, 2).map((c) => (
                          <span
                            key={c.id}
                            className="text-[9px] bg-blue-950/40 border border-blue-900/50 text-blue-300 px-1.5 py-0.5 rounded font-mono"
                          >
                            {c.capability.replace(/_/g, " ")}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-600">Standard</span>
                      )}
                      {res.capabilities && res.capabilities.length > 2 && (
                        <span className="text-[9px] bg-slate-800 text-slate-400 px-1 py-0.5 rounded font-mono">
                          +{res.capabilities.length - 2}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Mission */}
                  <td className="py-3 px-4">
                    {activeAssignment ? (
                      <div className="space-y-0.5 max-w-[180px]">
                        <Link
                          href={`/incidents/${activeAssignment.incident.id}`}
                          className="font-semibold text-amber-300 hover:text-amber-200 truncate block text-[11px]"
                        >
                          {activeAssignment.incident.title}
                        </Link>
                        <div className="text-[9px] text-slate-400 font-mono">
                          {activeAssignment.status} • {formatRelativeTime(activeAssignment.assignedAt)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-mono italic">Ready / Staged</span>
                    )}
                  </td>

                  {/* Controls */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {res.status !== "AVAILABLE" && (
                        <button
                          onClick={() => onQuickStatusChange(res.id, "AVAILABLE")}
                          disabled={isUpdating}
                          className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded hover:bg-emerald-900 transition disabled:opacity-50"
                        >
                          Ready
                        </button>
                      )}
                      <button
                        onClick={() => onOpenStatusModal(res)}
                        disabled={isUpdating}
                        className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded border border-slate-700 transition flex items-center gap-1"
                      >
                        <Sliders size={12} />
                        <span>Manage</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ResourceTableView;

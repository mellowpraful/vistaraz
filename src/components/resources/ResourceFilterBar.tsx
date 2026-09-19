"use client";

import React from "react";
import { Search, Filter, X, LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { RESOURCE_TYPE_ICONS } from "@/lib/types";

interface ResourceFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedAgency: string;
  onAgencyChange: (val: string) => void;
  agenciesList: string[];
  selectedType: string;
  onTypeChange: (val: string) => void;
  typesList: string[];
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  statusesList: string[];
  selectedCapability: string;
  onCapabilityChange: (val: string) => void;
  capabilitiesList: string[];
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  totalCount: number;
  filteredCount: number;
  onResetFilters: () => void;
}

export function ResourceFilterBar({
  searchQuery,
  onSearchChange,
  selectedAgency,
  onAgencyChange,
  agenciesList,
  selectedType,
  onTypeChange,
  typesList,
  selectedStatus,
  onStatusChange,
  statusesList,
  selectedCapability,
  onCapabilityChange,
  capabilitiesList,
  viewMode,
  onViewModeChange,
  totalCount,
  filteredCount,
  onResetFilters,
}: ResourceFilterBarProps) {
  const hasActiveFilters =
    searchQuery !== "" ||
    selectedAgency !== "ALL" ||
    selectedType !== "ALL" ||
    selectedStatus !== "ALL" ||
    selectedCapability !== "ALL";

  return (
    <div className="card p-4 space-y-3 bg-slate-900/80 border-slate-800">
      {/* Search & Main Selectors */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search input */}
        <div className="flex-1 relative min-w-[240px]">
          <Search size={15} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, callsign, agency, equipment, location..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input pl-9 pr-8 text-xs w-full bg-slate-950/70 border-slate-800 focus:border-blue-500 text-slate-100 placeholder:text-slate-500 rounded-lg h-9"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Agency Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">Agency:</span>
            <select
              value={selectedAgency}
              onChange={(e) => onAgencyChange(e.target.value)}
              className="input py-1 px-2.5 text-xs bg-slate-950/80 border-slate-800 rounded-lg h-9 max-w-[170px]"
            >
              <option value="ALL">All Agencies ({agenciesList.length})</option>
              {agenciesList.map((agency) => (
                <option key={agency} value={agency}>
                  {agency}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="input py-1 px-2.5 text-xs bg-slate-950/80 border-slate-800 rounded-lg h-9 max-w-[170px]"
            >
              <option value="ALL">All Types</option>
              {typesList.map((t) => (
                <option key={t} value={t}>
                  {RESOURCE_TYPE_ICONS[t] ? `${RESOURCE_TYPE_ICONS[t]} ` : ""}
                  {t.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="input py-1 px-2.5 text-xs bg-slate-950/80 border-slate-800 rounded-lg h-9"
            >
              <option value="ALL">All Statuses</option>
              {statusesList.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-lg p-0.5 h-9">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 transition ${
                viewMode === "grid"
                  ? "bg-slate-800 text-blue-400 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Grid Card View"
            >
              <LayoutGrid size={14} />
              <span className="hidden md:inline">Grid</span>
            </button>
            <button
              onClick={() => onViewModeChange("table")}
              className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 transition ${
                viewMode === "table"
                  ? "bg-slate-800 text-blue-400 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Dense Table View"
            >
              <List size={14} />
              <span className="hidden md:inline">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Capability Quick-Filter Chips & Result Count */}
      <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1 mr-1">
            <SlidersHorizontal size={11} /> Capability:
          </span>
          <button
            onClick={() => onCapabilityChange("ALL")}
            className={`text-[10px] px-2 py-0.5 rounded font-mono transition ${
              selectedCapability === "ALL"
                ? "bg-blue-600 text-white font-bold"
                : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
            }`}
          >
            ALL
          </button>
          {capabilitiesList.slice(0, 6).map((cap) => {
            const isSelected = selectedCapability === cap;
            return (
              <button
                key={cap}
                onClick={() => onCapabilityChange(isSelected ? "ALL" : cap)}
                className={`text-[10px] px-2 py-0.5 rounded font-mono transition ${
                  isSelected
                    ? "bg-blue-600 text-white font-bold"
                    : "bg-slate-800/80 text-slate-300 border border-slate-700/60 hover:border-slate-500"
                }`}
              >
                {cap.replace(/_/g, " ")}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 text-xs justify-between sm:justify-end">
          <span className="text-[11px] font-mono text-slate-400">
            Showing <span className="font-bold text-slate-100">{filteredCount}</span> of {totalCount} units
          </span>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-[10px] font-mono text-red-400 hover:text-red-300 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-red-950/40 transition"
            >
              <X size={12} /> Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResourceFilterBar;

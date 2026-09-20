"use client";

import React from "react";
import { Search, Filter, X, LayoutGrid, List, SlidersHorizontal } from "lucide-react";

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
    <div className="card p-6 sm:p-7 rounded-3xl space-y-5 shadow-xl">
      {/* Search & Main Selectors Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1 min-w-[260px]">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search fleet by callsign, agency, equipment, location…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input pl-11 pr-10 text-sm w-full h-12 rounded-2xl bg-slate-950/60 dark:bg-slate-950/60 border-slate-800 focus:border-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filters and View Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Agency */}
          <select
            value={selectedAgency}
            onChange={(e) => onAgencyChange(e.target.value)}
            className="input text-xs sm:text-sm h-12 min-w-[150px] rounded-2xl bg-slate-950/60 dark:bg-slate-950/60 border-slate-800 cursor-pointer font-medium"
          >
            <option value="ALL">All Agencies ({agenciesList.length})</option>
            {agenciesList.map((agency) => (
              <option key={agency} value={agency}>
                {agency}
              </option>
            ))}
          </select>

          {/* Unit Type */}
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="input text-xs sm:text-sm h-12 min-w-[150px] rounded-2xl bg-slate-950/60 dark:bg-slate-950/60 border-slate-800 cursor-pointer font-medium"
          >
            <option value="ALL">All Unit Types</option>
            {typesList.map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, " ")}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="input text-xs sm:text-sm h-12 min-w-[140px] rounded-2xl bg-slate-950/60 dark:bg-slate-950/60 border-slate-800 cursor-pointer font-medium"
          >
            <option value="ALL">All Statuses</option>
            {statusesList.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-950/80 dark:bg-slate-950/80 border border-slate-800 p-1 rounded-2xl h-12">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Grid View"
            >
              <LayoutGrid size={15} />
              <span>Grid</span>
            </button>
            <button
              onClick={() => onViewModeChange("table")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Table View"
            >
              <List size={15} />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Capability Filter Chips & Unit Counts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mr-1 font-mono">
            <SlidersHorizontal size={14} className="text-blue-400" /> Capabilities:
          </span>
          <button
            onClick={() => onCapabilityChange("ALL")}
            className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
              selectedCapability === "ALL"
                ? "bg-blue-600 text-white shadow-sm font-bold"
                : "bg-slate-950/60 text-slate-300 border border-slate-800 hover:border-slate-700"
            }`}
          >
            All
          </button>
          {capabilitiesList.slice(0, 7).map((cap) => {
            const isSelected = selectedCapability === cap;
            return (
              <button
                key={cap}
                onClick={() => onCapabilityChange(isSelected ? "ALL" : cap)}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm font-bold"
                    : "bg-slate-950/60 text-slate-300 border border-slate-800 hover:border-slate-700"
                }`}
              >
                {cap.replace(/_/g, " ")}
              </button>
            );
          })}
        </div>

        {/* Counter and Clear filter */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <span className="text-xs text-slate-400 font-mono">
            Showing <strong className="text-white font-bold">{filteredCount}</strong> of {totalCount} units
          </span>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1.5 text-xs text-red-400 bg-red-950/50 hover:bg-red-950 border border-red-800/80 rounded-xl px-3 py-1.5 transition-colors cursor-pointer font-mono font-medium"
            >
              <X size={13} /> Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResourceFilterBar;

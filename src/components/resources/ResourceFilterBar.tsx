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
    <div
      style={{
        background: "rgba(15, 23, 42, 0.65)",
        border: "1px solid var(--border-primary)",
        borderRadius: "12px",
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      {/* Search & Main Selectors */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        {/* Search input */}
        <div style={{ position: "relative", flex: "1 1 280px", minWidth: "220px" }}>
          <Search size={15} style={{ position: "absolute", left: "12px", top: "11px", color: "var(--text-muted)", pointerEvents: "none" }} />
          <input
            type="text"
            placeholder="Search fleet by callsign, agency, equipment, location…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input"
            style={{
              paddingLeft: "36px",
              paddingRight: searchQuery ? "32px" : "12px",
              fontSize: "13px",
              width: "100%",
              height: "38px",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              style={{
                position: "absolute",
                right: "10px",
                top: "10px",
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filters and View Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Agency */}
          <select
            value={selectedAgency}
            onChange={(e) => onAgencyChange(e.target.value)}
            className="input"
            style={{ fontSize: "12.5px", height: "38px", minWidth: "140px", cursor: "pointer" }}
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
            className="input"
            style={{ fontSize: "12.5px", height: "38px", minWidth: "140px", cursor: "pointer" }}
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
            className="input"
            style={{ fontSize: "12.5px", height: "38px", minWidth: "130px", cursor: "pointer" }}
          >
            <option value="ALL">All Statuses</option>
            {statusesList.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>

          {/* View mode toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "rgba(3, 7, 18, 0.6)",
              border: "1px solid var(--border-primary)",
              borderRadius: "8px",
              padding: "2px",
              height: "38px",
            }}
          >
            <button
              onClick={() => onViewModeChange("grid")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 12px",
                borderRadius: "6px",
                border: "none",
                background: viewMode === "grid" ? "rgba(59, 130, 246, 0.2)" : "transparent",
                color: viewMode === "grid" ? "#60a5fa" : "var(--text-muted)",
                fontSize: "12px",
                fontWeight: viewMode === "grid" ? "600" : "500",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              title="Grid View"
            >
              <LayoutGrid size={14} />
              <span>Grid</span>
            </button>
            <button
              onClick={() => onViewModeChange("table")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 12px",
                borderRadius: "6px",
                border: "none",
                background: viewMode === "table" ? "rgba(59, 130, 246, 0.2)" : "transparent",
                color: viewMode === "table" ? "#60a5fa" : "var(--text-muted)",
                fontSize: "12px",
                fontWeight: viewMode === "table" ? "600" : "500",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              title="Table View"
            >
              <List size={14} />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Capability Filter Chips & Counts */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          paddingTop: "12px",
          borderTop: "1px solid var(--border-primary)",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.4px", display: "flex", alignItems: "center", gap: "5px", marginRight: "4px" }}>
            <SlidersHorizontal size={12} /> Capability:
          </span>
          <button
            onClick={() => onCapabilityChange("ALL")}
            style={{
              fontSize: "11.5px",
              padding: "3px 10px",
              borderRadius: "6px",
              border: selectedCapability === "ALL" ? "1px solid #3b82f6" : "1px solid var(--border-primary)",
              background: selectedCapability === "ALL" ? "rgba(59, 130, 246, 0.25)" : "rgba(255,255,255,0.03)",
              color: selectedCapability === "ALL" ? "#93c5fd" : "var(--text-secondary)",
              fontWeight: selectedCapability === "ALL" ? "600" : "400",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            All
          </button>
          {capabilitiesList.slice(0, 6).map((cap) => {
            const isSelected = selectedCapability === cap;
            return (
              <button
                key={cap}
                onClick={() => onCapabilityChange(isSelected ? "ALL" : cap)}
                style={{
                  fontSize: "11.5px",
                  padding: "3px 10px",
                  borderRadius: "6px",
                  border: isSelected ? "1px solid #3b82f6" : "1px solid var(--border-primary)",
                  background: isSelected ? "rgba(59, 130, 246, 0.25)" : "rgba(255,255,255,0.03)",
                  color: isSelected ? "#93c5fd" : "var(--text-secondary)",
                  fontWeight: isSelected ? "600" : "400",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {cap.replace(/_/g, " ")}
              </button>
            );
          })}
        </div>

        {/* Counter and Clear filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Showing <strong style={{ color: "var(--text-primary)" }}>{filteredCount}</strong> of {totalCount} units
          </span>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11.5px",
                color: "#f87171",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                borderRadius: "6px",
                padding: "3px 8px",
                cursor: "pointer",
              }}
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

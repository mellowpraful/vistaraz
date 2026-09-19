"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { extractApiData, parseEquipment } from "@/lib/utils";
import { fetchSafeJson } from "@/lib/api-client";
import { ResourceItem, ResourceStatusModal } from "@/components/resources/ResourceStatusModal";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { ResourceTableView } from "@/components/resources/ResourceTableView";
import { ResourceFilterBar } from "@/components/resources/ResourceFilterBar";
import { ResourceStatsOverview } from "@/components/resources/ResourceStatsOverview";
import { EmptyState, LoadingState } from "@/components/ui/EmptyState";
import {
  RotateCcw,
  Shield,
  Radio,
  Activity,
  AlertTriangle,
  CheckCircle,
  Wifi,
  Sparkles,
} from "lucide-react";

const RESOURCE_TYPES = [
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
  "SEARCH_DOG_UNIT",
  "SPECIALIZED",
];

const RESOURCE_STATUSES = [
  "AVAILABLE",
  "DISPATCHED",
  "EN_ROUTE",
  "ON_SCENE",
  "RETURNING",
  "STANDBY",
  "OUT_OF_SERVICE",
];

export default function ResourcesPage() {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgency, setSelectedAgency] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedCapability, setSelectedCapability] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modal & Quick Status state
  const [modalResource, setModalResource] = useState<ResourceItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Fetch live resources
  const fetchResources = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    setFetchError(null);
    try {
      const json = await fetchSafeJson<ResourceItem>("/api/resources");
      if (!json.success) {
        setFetchError(json.error || "Failed to fetch resource fleet data");
      }
      const extracted = extractApiData<ResourceItem>(json);
      setResources(extracted);
      setLastRefreshed(new Date());
    } catch (err: any) {
      console.error("Failed to load resources:", err);
      setFetchError(err.message || "Failed to fetch resource fleet data");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
    // Auto-refresh telemetry every 25 seconds
    const interval = setInterval(() => {
      fetchResources();
    }, 25000);
    return () => clearInterval(interval);
  }, [fetchResources]);

  // Derive unique agencies and capabilities for filters
  const agenciesList = useMemo(() => {
    const set = new Set<string>();
    resources.forEach((r) => {
      if (r.agency?.name) set.add(r.agency.name);
    });
    return Array.from(set).sort();
  }, [resources]);

  const capabilitiesList = useMemo(() => {
    const set = new Set<string>();
    resources.forEach((r) => {
      r.capabilities?.forEach((c) => {
        if (c.capability) set.add(c.capability);
      });
    });
    return Array.from(set).sort();
  }, [resources]);

  // Quick Status Transition Handler
  const handleQuickStatusChange = async (id: string, newStatus: string): Promise<boolean> => {
    setUpdatingId(id);
    setFeedbackMessage(null);
    try {
      const res = await fetch("/api/resources", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update status");
      }

      // Update state locally & refresh
      const updated = json.data || json.resource;
      setResources((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updated, lastUpdated: new Date().toISOString() } : r))
      );

      setFeedbackMessage({
        type: "success",
        text: `Unit status successfully updated to ${newStatus.replace(/_/g, " ")}`,
      });

      // Clear feedback after 4 seconds
      setTimeout(() => setFeedbackMessage(null), 4000);
      return true;
    } catch (err: any) {
      console.error("Quick status update error:", err);
      setFeedbackMessage({
        type: "error",
        text: `Status change failed: ${err.message || "Network error"}. Live state preserved.`,
      });
      setTimeout(() => setFeedbackMessage(null), 6000);
      return false;
    } finally {
      setUpdatingId(null);
    }
  };

  const handleModalStatusUpdated = (updatedResource: ResourceItem) => {
    setResources((prev) =>
      prev.map((r) => (r.id === updatedResource.id ? { ...r, ...updatedResource } : r))
    );
    setFeedbackMessage({
      type: "success",
      text: `${updatedResource.name} updated to ${String(updatedResource.status).replace(/_/g, " ")}`,
    });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleOpenStatusModal = (resource: ResourceItem) => {
    setModalResource(resource);
    setIsModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedAgency("ALL");
    setSelectedType("ALL");
    setSelectedStatus("ALL");
    setSelectedCapability("ALL");
  };

  // Filter logic
  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      // Type Filter
      if (selectedType !== "ALL" && r.type !== selectedType) return false;

      // Status Filter
      if (selectedStatus !== "ALL" && r.status !== selectedStatus) return false;

      // Agency Filter
      if (selectedAgency !== "ALL" && r.agency?.name !== selectedAgency) return false;

      // Capability Filter
      if (selectedCapability !== "ALL") {
        const hasCap = r.capabilities?.some((c) => c.capability === selectedCapability);
        if (!hasCap) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = r.name.toLowerCase().includes(q);
        const typeMatch = r.type.toLowerCase().includes(q);
        const agencyMatch = r.agency?.name?.toLowerCase().includes(q);
        const locMatch = r.locationName?.toLowerCase().includes(q);
        const capMatch = r.capabilities?.some((c) => c.capability.toLowerCase().includes(q));
        const equipMatch = r.capabilities?.some((c) => {
          const eqList = parseEquipment(c.equipment);
          return eqList.some((eq) => eq.toLowerCase().includes(q));
        });
        const missionMatch = r.assignments?.some((a) =>
          a.incident?.title?.toLowerCase().includes(q)
        );

        if (
          !nameMatch &&
          !typeMatch &&
          !agencyMatch &&
          !locMatch &&
          !capMatch &&
          !equipMatch &&
          !missionMatch
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    resources,
    selectedType,
    selectedStatus,
    selectedAgency,
    selectedCapability,
    searchQuery,
  ]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
              <span className="p-1.5 bg-blue-950 border border-blue-800 rounded-lg text-xl">🛡️</span>
              Emergency Fleet & Resource Registry
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time multi-agency fleet telemetry, capability tracking, readiness levels, and field unit dispatch status
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Live Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Telemetry Feed Live</span>
          </div>

          <button
            onClick={() => fetchResources(true)}
            disabled={isRefreshing || loading}
            className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-2"
          >
            <RotateCcw size={14} className={isRefreshing ? "animate-spin text-blue-400" : ""} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh Telemetry"}</span>
          </button>
        </div>
      </div>

      {/* Feedback / Notification Banner */}
      {feedbackMessage && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-2 animate-slide-in ${
            feedbackMessage.type === "success"
              ? "bg-emerald-950/80 border-emerald-800 text-emerald-200"
              : "bg-red-950/80 border-red-800 text-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === "success" ? (
              <CheckCircle size={16} className="text-emerald-400" />
            ) : (
              <AlertTriangle size={16} className="text-red-400" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-400 hover:text-slate-200 font-mono text-[10px]"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Fetch Error Banner */}
      {fetchError && (
        <div className="p-3 bg-red-950/80 border border-red-800 rounded-lg text-xs text-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-400" />
            <span>Telemetry connection issue: {fetchError}</span>
          </div>
          <button
            onClick={() => fetchResources(true)}
            className="text-xs bg-red-900 hover:bg-red-800 text-white px-2.5 py-1 rounded"
          >
            Retry
          </button>
        </div>
      )}

      {/* Fleet KPI Overview Cards */}
      <ResourceStatsOverview
        resources={resources}
        selectedStatus={selectedStatus}
        onSelectStatusFilter={(st) => setSelectedStatus(st)}
      />

      {/* Filter & Search Bar */}
      <ResourceFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedAgency={selectedAgency}
        onAgencyChange={setSelectedAgency}
        agenciesList={agenciesList}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        typesList={RESOURCE_TYPES}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        statusesList={RESOURCE_STATUSES}
        selectedCapability={selectedCapability}
        onCapabilityChange={setSelectedCapability}
        capabilitiesList={capabilitiesList}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={resources.length}
        filteredCount={filteredResources.length}
        onResetFilters={handleResetFilters}
      />

      {/* Main Content Area */}
      {loading ? (
        <div className="card p-12 text-center text-slate-400 space-y-3 flex flex-col items-center justify-center">
          <LoadingState label="Syncing live fleet telemetry & capability matrix..." />
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="card p-12 text-center border-slate-800 bg-slate-900/40">
          <EmptyState
            icon={Shield}
            title="No Matching Resources Found"
            description="No emergency fleet units match your current search parameters or active filters."
            action={{
              label: "Reset All Filters",
              onClick: handleResetFilters,
            }}
          />
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onQuickStatusChange={handleQuickStatusChange}
              onOpenStatusModal={handleOpenStatusModal}
              isUpdating={updatingId === resource.id}
            />
          ))}
        </div>
      ) : (
        <ResourceTableView
          resources={filteredResources}
          onOpenStatusModal={handleOpenStatusModal}
          onQuickStatusChange={handleQuickStatusChange}
          updatingId={updatingId}
        />
      )}

      {/* Status Management Modal */}
      <ResourceStatusModal
        resource={modalResource}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalResource(null);
        }}
        onStatusUpdated={handleModalStatusUpdated}
      />
    </div>
  );
}

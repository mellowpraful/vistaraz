"use client";

import { useState, useEffect, useCallback } from "react";
import { extractApiData } from "@/lib/utils";
import { fetchSafeJson } from "@/lib/api-client";
import { IncidentPageHeader } from "@/components/incidents/IncidentPageHeader";
import { IncidentFilterBar } from "@/components/incidents/IncidentFilterBar";
import { IncidentCard } from "@/components/incidents/IncidentCard";
import { CreateIncidentModal } from "@/components/incidents/CreateIncidentModal";
import { LoadingState } from "@/components/ui/EmptyState";
import { AlertTriangle } from "lucide-react";

interface IncidentItem {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: string;
  status: string;
  source: string;
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
  affectedCount: number | null;
  injuryCount: number | null;
  hazards: string | null;
  requiredCapabilities: string | null;
  aiExtracted: boolean;
  createdAt: string;
  assignments: Array<{
    id: string;
    resource: {
      name: string;
      type: string;
    };
  }>;
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const params = new URLSearchParams();
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);
      if (selectedSeverity !== "ALL") params.set("severity", selectedSeverity);
      if (selectedType !== "ALL") params.set("type", selectedType);

      const json = await fetchSafeJson<IncidentItem>(`/api/incidents?${params.toString()}`);
      if (!json.success) {
        setFetchError(json.error || "Server error while fetching incidents");
      }
      setIncidents(extractApiData<IncidentItem>(json));
    } catch (err: any) {
      console.error("Failed to fetch incidents:", err);
      setFetchError(err?.message || "Failed to fetch incidents");
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, selectedSeverity, selectedType]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const handleCreateIncident = async (formData: any, rawText: string) => {
    if (!formData.title || !formData.description) return;
    setCreating(true);
    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          originalReport: rawText || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowCreateModal(false);
        fetchIncidents();
      }
    } catch (err) {
      console.error("Create incident failed:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleClearAll = () => {
    setSelectedSeverity("ALL");
    setSelectedStatus("ALL");
    setSelectedType("ALL");
    setSearchQuery("");
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      inc.title.toLowerCase().includes(q) ||
      inc.description.toLowerCase().includes(q) ||
      (inc.locationName && inc.locationName.toLowerCase().includes(q)) ||
      inc.id.toLowerCase().includes(q)
    );
  });

  const activeCount = incidents.filter(
    (i) => i.status !== "RESOLVED" && i.status !== "CLOSED"
  ).length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 sm:space-y-9 animate-fade-in pb-24">
      {/* Header */}
      <IncidentPageHeader
        activeCount={activeCount}
        onRefresh={() => fetchIncidents()}
        onCreateNew={() => setShowCreateModal(true)}
      />

      {/* Filter Toolbar */}
      <IncidentFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSeverity={selectedSeverity}
        onSeverityChange={setSelectedSeverity}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        totalCount={incidents.length}
        filteredCount={filteredIncidents.length}
        onClearAll={handleClearAll}
      />

      {/* Incident List Feed */}
      {loading ? (
        <div className="card p-16 text-center rounded-3xl shadow-xl">
          <LoadingState label="Synchronizing CAD multi-agency emergency incident feed…" />
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="card p-16 text-center rounded-3xl space-y-4 shadow-xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-center text-slate-400">
            <AlertTriangle size={32} />
          </div>
          <div className="text-xl font-bold text-slate-100">No matching incidents found</div>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Try adjusting your search query, severity, or status filters to view incidents.
          </p>
          <button onClick={handleClearAll} className="btn btn-secondary text-xs px-4 py-2 rounded-xl">
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredIncidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
        </div>
      )}

      {/* Create Incident Modal */}
      {showCreateModal && (
        <CreateIncidentModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateIncident}
          creating={creating}
        />
      )}
    </div>
  );
}



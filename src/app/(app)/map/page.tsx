"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  RefreshCw,
  AlertTriangle,
  Truck,
  Building2,
  Home,
  ShieldAlert,
  ChevronRight,
  Zap,
  Clock,
  X,
  Compass,
  Radio,
  FileText,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { fetchSafeJson } from "@/lib/api-client";
import { extractApiData } from "@/lib/utils";

// Dynamically import map component with SSR disabled
const SituationMap = dynamic(() => import("@/components/map/SituationMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-slate-950 text-slate-400">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-slate-400">Initializing GIS Telemetry Vector Layer...</p>
      </div>
    </div>
  ),
});

function MapViewContent() {
  const searchParams = useSearchParams();
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");

  const [incidents, setIncidents] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [shelters, setShelters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected map entity for the slide-over inspector
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  const [selectedType, setSelectedType] = useState<string>("");

  // Layer toggles
  const [layers, setLayers] = useState({
    incidents: true,
    resources: true,
    hospitals: true,
    shelters: true,
    hazardZones: true,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [incJson, resJson, hospJson, sheltJson] = await Promise.all([
        fetchSafeJson("/api/incidents"),
        fetchSafeJson("/api/resources"),
        fetchSafeJson("/api/hospitals"),
        fetchSafeJson("/api/shelters"),
      ]);

      const incData = extractApiData(incJson);
      const resData = extractApiData(resJson);
      const hospData = extractApiData(hospJson);
      const sheltData = extractApiData(sheltJson);

      setIncidents(incData);
      setResources(resData);
      setHospitals(hospData);
      setShelters(sheltData);
    } catch (err) {
      console.error("Map data fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectEntity = (entity: any, type: string) => {
    setSelectedEntity(entity);
    setSelectedType(type);
  };

  const centerLat = latParam ? parseFloat(latParam) : 23.0225;
  const centerLng = lngParam ? parseFloat(lngParam) : 72.5714;

  const layerConfigs = [
    { key: "incidents" as const, label: "Incidents", count: incidents.length, icon: AlertTriangle, color: "text-red-400", activeBg: "bg-red-950/70 border-red-800 text-red-300" },
    { key: "resources" as const, label: "Fleet Units", count: resources.length, icon: Truck, color: "text-emerald-400", activeBg: "bg-emerald-950/70 border-emerald-800 text-emerald-300" },
    { key: "hospitals" as const, label: "Hospitals", count: hospitals.length, icon: Building2, color: "text-blue-400", activeBg: "bg-blue-950/70 border-blue-800 text-blue-300" },
    { key: "shelters" as const, label: "Shelters", count: shelters.length, icon: Home, color: "text-amber-400", activeBg: "bg-amber-950/70 border-amber-800 text-amber-300" },
    { key: "hazardZones" as const, label: "Danger Zones", count: 2, icon: ShieldAlert, color: "text-purple-400", activeBg: "bg-purple-950/70 border-purple-800 text-purple-300" },
  ];

  return (
    <div className="space-y-4 h-[calc(100vh-105px)] flex flex-col">
      {/* ── Top Header & Controls ──────────────────────────────────── */}
      <PageHeader
        title="Live Geospatial Situation Room"
        description="Multi-agency incident telemetry, tactical fleet tracking, and infrastructure capacity overlay."
        icon={Compass}
        iconColor="#10b981"
        badge={
          <div className="flex items-center gap-2">
            <span className="badge badge-success flex items-center gap-1">
              <Radio size={11} className="animate-pulse" /> Live Telemetry
            </span>
            <span className="badge badge-neutral">CartoDB Dark Vector</span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="btn btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span>{loading ? "Syncing…" : "Refresh"}</span>
            </button>
          </div>
        }
      />

      {/* ── Layer Toggles Strip ────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 p-2 bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase px-2 hidden sm:inline-block">
            Layers:
          </span>
          {layerConfigs.map(({ key, label, count, icon: Icon, activeBg }) => {
            const isActive = layers[key];
            return (
              <button
                key={key}
                onClick={() => setLayers({ ...layers, [key]: !isActive })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap ${
                  isActive
                    ? activeBg
                    : "bg-slate-950 border-slate-800/80 text-slate-500 hover:text-slate-300"
                }`}
              >
                <Icon size={13} />
                <span>{label}</span>
                <span className="text-[10px] font-mono opacity-80">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="text-[11px] font-mono text-slate-400 hidden lg:flex items-center gap-2 pr-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Sector: Ahmedabad EOC</span>
        </div>
      </div>

      {/* ── Main Map + Inspector Split ─────────────────────────────── */}
      <div className="flex-1 flex gap-4 min-h-0 relative">
        {/* Map View Area */}
        <div className="flex-1 h-full min-h-[500px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl relative">
          <SituationMap
            incidents={incidents}
            resources={resources}
            hospitals={hospitals}
            shelters={shelters}
            centerLat={centerLat}
            centerLng={centerLng}
            zoom={latParam ? 14 : 12}
            selectedEntity={selectedEntity}
            onSelectEntity={handleSelectEntity}
            layers={layers}
          />

          {/* Floating Helper Pill if nothing selected */}
          {!selectedEntity && (
            <div className="absolute bottom-4 left-4 z-[400] pointer-events-none bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg px-3.5 py-2 text-xs text-slate-300 font-sans shadow-lg flex items-center gap-2">
              <MapPin size={13} className="text-emerald-400" />
              <span>Click any map marker to inspect real-time telemetry</span>
            </div>
          )}
        </div>

        {/* ── Selected Entity Slide-over Inspector ──────────────────── */}
        {selectedEntity && (
          <div className="w-80 sm:w-96 h-full shrink-0 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl p-5 shadow-2xl overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right-4 duration-200">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-purple-400 bg-purple-950/80 border border-purple-800 px-2 py-0.5 rounded">
                  {selectedType} Inspector
                </span>
                <button
                  onClick={() => setSelectedEntity(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* INCIDENT DETAILS */}
              {selectedType === "INCIDENT" && (
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-red-950 text-red-300 border border-red-800">
                        {selectedEntity.severity}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-300">
                        {selectedEntity.type}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-100 mt-1 leading-snug">
                      {selectedEntity.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                    {selectedEntity.description}
                  </p>

                  <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin size={13} className="text-red-400" />
                      <span>{selectedEntity.locationName || "Scene Coordinates"}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 pl-4">
                      {typeof selectedEntity.latitude === "number" ? selectedEntity.latitude.toFixed(4) : "—"},{" "}
                      {typeof selectedEntity.longitude === "number" ? selectedEntity.longitude.toFixed(4) : "—"}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Link
                      href={`/dispatch?incidentId=${selectedEntity.id}`}
                      className="btn-primary text-xs py-2.5 w-full flex items-center justify-center gap-2 font-semibold shadow-md"
                    >
                      <Zap size={14} /> Open Dispatch Studio
                    </Link>
                    <Link
                      href={`/incidents/${selectedEntity.id}`}
                      className="btn btn-secondary text-xs py-2 w-full flex items-center justify-center gap-1.5 text-slate-300"
                    >
                      <FileText size={13} /> Full SITREP & Timeline
                    </Link>
                  </div>
                </div>
              )}

              {/* RESOURCE DETAILS */}
              {selectedType === "RESOURCE" && (
                <div className="space-y-3.5">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{selectedEntity.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedEntity.agency?.name || "Emergency Agency"}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {selectedEntity.type}
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-semibold">
                      ● {selectedEntity.status}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
                    <div className="text-[10px] uppercase text-slate-500">Live GPS Coordinates</div>
                    <div className="text-slate-200">
                      {typeof selectedEntity.latitude === "number" ? selectedEntity.latitude.toFixed(4) : "—"},{" "}
                      {typeof selectedEntity.longitude === "number" ? selectedEntity.longitude.toFixed(4) : "—"}
                    </div>
                  </div>

                  <Link
                    href="/resources"
                    className="btn btn-secondary text-xs py-2 w-full flex items-center justify-center gap-1 text-slate-200"
                  >
                    Manage Fleet Unit <ChevronRight size={13} />
                  </Link>
                </div>
              )}

              {/* HOSPITAL DETAILS */}
              {selectedType === "HOSPITAL" && (
                <div className="space-y-3.5">
                  <h3 className="text-sm font-bold text-slate-100">{selectedEntity.name}</h3>

                  <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Available General Beds</span>
                      <strong className="text-emerald-400 font-mono text-sm">
                        {selectedEntity.availableBeds ?? 0} / {selectedEntity.totalBeds ?? 0}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1.5 border-t border-slate-800/80">
                      <span className="text-slate-400">ICU Bed Reserves</span>
                      <strong className="text-blue-400 font-mono text-sm">
                        {selectedEntity.icuBedsAvailable ?? selectedEntity.availableIcu ?? 0} Beds
                      </strong>
                    </div>
                  </div>

                  <Link
                    href="/hospitals"
                    className="btn btn-secondary text-xs py-2 w-full flex items-center justify-center gap-1 text-slate-200"
                  >
                    Hospital Network Capacity <ChevronRight size={13} />
                  </Link>
                </div>
              )}

              {/* SHELTER DETAILS */}
              {selectedType === "SHELTER" && (
                <div className="space-y-3.5">
                  <h3 className="text-sm font-bold text-slate-100">{selectedEntity.name}</h3>

                  <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Current Occupancy</span>
                      <strong className="text-amber-400 font-mono text-sm">
                        {selectedEntity.currentOccupancy ?? selectedEntity.occupied ?? 0} / {selectedEntity.capacity ?? 0}
                      </strong>
                    </div>
                  </div>

                  <Link
                    href="/hospitals"
                    className="btn btn-secondary text-xs py-2 w-full flex items-center justify-center gap-1 text-slate-200"
                  >
                    Shelter Logistics & Supplies <ChevronRight size={13} />
                  </Link>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedEntity(null)}
              className="btn btn-secondary text-xs py-2 w-full text-slate-400 hover:text-white mt-4"
            >
              Close Inspector
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={<div className="card p-12 text-center text-slate-400">Loading map...</div>}>
      <MapViewContent />
    </Suspense>
  );
}

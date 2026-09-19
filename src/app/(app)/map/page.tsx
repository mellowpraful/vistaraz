"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { INCIDENT_TYPE_ICONS } from "@/lib/types";
import { fetchSafeJson } from "@/lib/api-client";

// Dynamically import map component with SSR disabled
const SituationMap = dynamic(() => import("@/components/map/SituationMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-slate-950 text-slate-400">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin text-3xl">🌐</div>
        <p className="text-xs">Initializing GIS Map Telemetry Layer...</p>
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

      if (incJson.success && incJson.data) setIncidents(incJson.data);
      if (resJson.success && resJson.data) setResources(resJson.data);
      if (hospJson.success && hospJson.data) setHospitals(hospJson.data);
      if (sheltJson.success && sheltJson.data) setShelters(sheltJson.data);
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

  return (
    <div className="space-y-4 h-[calc(100vh-110px)] flex flex-col">
      {/* Top Header & Layer Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl">🗺️</span>
          <div>
            <h1 className="text-base font-bold text-slate-100">Live Geospatial Situation Room</h1>
            <p className="text-[11px] text-slate-400">Multi-Agency Incident & Fleet Command Map</p>
          </div>
        </div>

        {/* Layer Checkboxes */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={layers.incidents}
              onChange={(e) => setLayers({ ...layers, incidents: e.target.checked })}
              className="rounded accent-red-500"
            />
            <span>🚨 Incidents ({incidents.length})</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={layers.resources}
              onChange={(e) => setLayers({ ...layers, resources: e.target.checked })}
              className="rounded accent-emerald-500"
            />
            <span>🛡️ Fleet Units ({resources.length})</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={layers.hospitals}
              onChange={(e) => setLayers({ ...layers, hospitals: e.target.checked })}
              className="rounded accent-blue-500"
            />
            <span>🏥 Hospitals ({hospitals.length})</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={layers.shelters}
              onChange={(e) => setLayers({ ...layers, shelters: e.target.checked })}
              className="rounded accent-amber-500"
            />
            <span>⛺ Shelters ({shelters.length})</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={layers.hazardZones}
              onChange={(e) => setLayers({ ...layers, hazardZones: e.target.checked })}
              className="rounded accent-purple-500"
            />
            <span>⚠️ Danger Zones</span>
          </label>
        </div>
      </div>

      {/* Main Map + Inspector Split */}
      <div className="flex-1 flex gap-4 min-h-0 relative">
        {/* Map View Area */}
        <div className="flex-1 h-full rounded-xl overflow-hidden border border-slate-800 shadow-2xl relative">
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
        </div>

        {/* Selected Entity Slide-over Inspector */}
        {selectedEntity && (
          <div className="w-80 h-full card p-4 space-y-4 overflow-y-auto bg-slate-900/95 border-slate-800 shadow-2xl shrink-0 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] font-bold uppercase font-mono text-purple-400">
                  {selectedType} Inspector
                </span>
                <button
                  onClick={() => setSelectedEntity(null)}
                  className="text-slate-400 hover:text-white text-xs px-1"
                >
                  ✕
                </button>
              </div>

              {selectedType === "INCIDENT" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {INCIDENT_TYPE_ICONS[selectedEntity.type as keyof typeof INCIDENT_TYPE_ICONS] || "🚨"}
                    </span>
                    <h3 className="font-bold text-sm text-slate-100">{selectedEntity.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="badge-critical text-[10px] px-2 py-0.5 rounded font-mono">
                      {selectedEntity.severity}
                    </span>
                    <span className="badge-neutral text-[10px] px-2 py-0.5 rounded font-mono">
                      {selectedEntity.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedEntity.description}
                  </p>

                  <div className="p-2.5 bg-slate-950 rounded text-xs space-y-1 font-mono">
                    <div className="text-slate-400">📍 {selectedEntity.locationName || "Scene"}</div>
                    <div className="text-slate-500">
                      Coordinates: {selectedEntity.latitude?.toFixed(4)}, {selectedEntity.longitude?.toFixed(4)}
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <Link
                      href={`/dispatch?incidentId=${selectedEntity.id}`}
                      className="btn-primary text-xs py-2 text-center"
                    >
                      ⚡ Open Dispatch Studio
                    </Link>
                    <Link
                      href={`/incidents/${selectedEntity.id}`}
                      className="btn-secondary text-xs py-1.5 text-center"
                    >
                      Full SITREP & Timeline →
                    </Link>
                  </div>
                </div>
              )}

              {selectedType === "RESOURCE" && (
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">{selectedEntity.name}</h3>
                    <p className="text-xs text-slate-400">{selectedEntity.agency.name}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="badge-neutral text-[10px] px-2 py-0.5 rounded font-mono">
                      {selectedEntity.type}
                    </span>
                    <span className="text-xs font-semibold text-emerald-400">
                      Status: {selectedEntity.status}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded text-xs space-y-1 font-mono">
                    <div className="text-slate-500">
                      GPS: {selectedEntity.latitude?.toFixed(4)}, {selectedEntity.longitude?.toFixed(4)}
                    </div>
                  </div>
                </div>
              )}

              {selectedType === "HOSPITAL" && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-slate-100">{selectedEntity.name}</h3>
                  <div className="p-3 bg-slate-950 rounded space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Available Beds:</span>
                      <strong className="text-emerald-400">
                        {selectedEntity.availableBeds} / {selectedEntity.totalBeds}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">ICU Capacity:</span>
                      <strong className="text-blue-400">{selectedEntity.icuBedsAvailable} Beds</strong>
                    </div>
                  </div>
                  <Link href="/hospitals" className="btn-secondary text-xs w-full text-center block py-1.5">
                    View Network Capacity →
                  </Link>
                </div>
              )}

              {selectedType === "SHELTER" && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-slate-100">{selectedEntity.name}</h3>
                  <div className="p-3 bg-slate-950 rounded space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Occupancy:</span>
                      <strong className="text-amber-400">
                        {selectedEntity.currentOccupancy} / {selectedEntity.capacity}
                      </strong>
                    </div>
                  </div>
                  <Link href="/hospitals" className="btn-secondary text-xs w-full text-center block py-1.5">
                    Manage Shelter Stocks →
                  </Link>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedEntity(null)}
              className="btn-secondary text-xs w-full py-1.5"
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

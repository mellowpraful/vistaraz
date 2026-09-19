"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { INCIDENT_TYPE_ICONS } from "@/lib/types";
import { fetchSafeJson } from "@/lib/api-client";
import { extractApiData } from "@/lib/utils";

// Dynamically import map component with SSR disabled
const SituationMap = dynamic(() => import("@/components/map/SituationMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-slate-950 text-slate-400">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin text-3xl">🌐</div>
        <p className="text-xs font-mono text-slate-400">Initializing GIS Map Telemetry Layer...</p>
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

  return (
    <div className="space-y-4 h-[calc(100vh-110px)] flex flex-col">
      {/* Top Header & Layer Toolbar */}
      <div style={{
        display: "flex", flexWrap: "wrap", alignItems: "center",
        justifyContent: "space-between", gap: "16px",
        background: "var(--bg-card)", padding: "18px 24px",
        borderRadius: "12px", border: "1px solid var(--border-primary)",
        borderLeft: "4px solid #22c55e", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: "42px", height: "42px", borderRadius: "10px",
            background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px",
          }}>🗺️</div>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>
              Live Geospatial Situation Room
            </h1>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "3px 0 0" }}>
              Multi-Agency Incident &amp; Fleet Command Map
            </p>
          </div>
        </div>

        {/* Layer Checkboxes */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "14px" }}>
          {[
            { key: "incidents" as const, label: `🚨 Incidents (${incidents.length})`, accent: "#ef4444" },
            { key: "resources" as const, label: `🛡️ Fleet Units (${resources.length})`, accent: "#22c55e" },
            { key: "hospitals" as const, label: `🏥 Hospitals (${hospitals.length})`, accent: "#3b82f6" },
            { key: "shelters" as const, label: `⛺ Shelters (${shelters.length})`, accent: "#f59e0b" },
            { key: "hazardZones" as const, label: "⚠️ Danger Zones", accent: "#a855f7" },
          ].map(({ key, label, accent }) => (
            <label key={key} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "var(--text-secondary)", fontSize: "13px", fontWeight: "600" }}>
              <input
                type="checkbox"
                checked={layers[key]}
                onChange={(e) => setLayers({ ...layers, [key]: e.target.checked })}
                style={{ accentColor: accent, width: "14px", height: "14px" }}
              />
              <span>{label}</span>
            </label>
          ))}

          <button
            onClick={fetchData}
            disabled={loading}
            style={{
              padding: "8px 16px", fontSize: "13px", fontWeight: "600",
              background: "var(--bg-secondary)", color: "var(--text-secondary)",
              border: "1px solid var(--border-primary)", borderRadius: "8px",
              cursor: "pointer", marginLeft: "4px", opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "⟳ Refreshing..." : "⟳ Refresh"}
          </button>
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
          <div style={{
            width: "320px", height: "100%", flexShrink: 0,
            background: "var(--bg-card)", border: "1px solid var(--border-secondary)",
            borderRadius: "12px", padding: "20px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px",
          }}>
            {/* Inspector Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-primary)", paddingBottom: "14px" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", color: "#a78bfa", fontFamily: "'JetBrains Mono', monospace" }}>
                {selectedType} Inspector
              </span>
              <button
                onClick={() => setSelectedEntity(null)}
                style={{ background: "transparent", border: "1px solid var(--border-primary)", borderRadius: "6px", color: "var(--text-muted)", cursor: "pointer", padding: "4px 8px", fontSize: "14px" }}
              >
                ✕
              </button>
            </div>

            {/* INCIDENT */}
            {selectedType === "INCIDENT" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <span style={{ fontSize: "28px", lineHeight: 1, flexShrink: 0 }}>
                    {INCIDENT_TYPE_ICONS[selectedEntity.type as keyof typeof INCIDENT_TYPE_ICONS] || "🚨"}
                  </span>
                  <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", margin: 0, lineHeight: 1.4 }}>{selectedEntity.title}</h3>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ background: "#450a0a", color: "#f87171", border: "1px solid #7f1d1d", fontSize: "12px", fontWeight: "700", padding: "4px 10px", borderRadius: "6px", fontFamily: "monospace" }}>{selectedEntity.severity}</span>
                  <span style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border-primary)", fontSize: "12px", fontWeight: "700", padding: "4px 10px", borderRadius: "6px", fontFamily: "monospace" }}>{selectedEntity.status}</span>
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{selectedEntity.description}</p>
                <div style={{ padding: "12px", background: "rgba(0,0,0,0.3)", borderRadius: "8px", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ color: "var(--text-secondary)" }}>📍 {selectedEntity.locationName || "Scene"}</div>
                  <div style={{ color: "var(--text-muted)" }}>
                    {typeof selectedEntity.latitude === "number" ? selectedEntity.latitude.toFixed(4) : "—"}, {typeof selectedEntity.longitude === "number" ? selectedEntity.longitude.toFixed(4) : "—"}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "4px" }}>
                  <Link href={`/dispatch?incidentId=${selectedEntity.id}`} style={{ display: "block", padding: "10px", background: "var(--accent-blue)", color: "#fff", borderRadius: "8px", textAlign: "center", textDecoration: "none", fontSize: "13px", fontWeight: "700" }}>
                    ⚡ Open Dispatch Studio
                  </Link>
                  <Link href={`/incidents/${selectedEntity.id}`} style={{ display: "block", padding: "9px", background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", color: "var(--text-secondary)", borderRadius: "8px", textAlign: "center", textDecoration: "none", fontSize: "13px", fontWeight: "600" }}>
                    Full SITREP & Timeline →
                  </Link>
                </div>
              </div>
            )}

            {/* RESOURCE */}
            {selectedType === "RESOURCE" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", margin: "0 0 4px" }}>{selectedEntity.name}</h3>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>{selectedEntity.agency?.name || "Emergency Agency"}</p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <span style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border-primary)", fontSize: "12px", fontWeight: "700", padding: "4px 10px", borderRadius: "6px", fontFamily: "monospace" }}>{selectedEntity.type}</span>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#4ade80" }}>● {selectedEntity.status}</span>
                </div>
                <div style={{ padding: "12px", background: "rgba(0,0,0,0.3)", borderRadius: "8px", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "var(--text-muted)" }}>
                  GPS: {typeof selectedEntity.latitude === "number" ? selectedEntity.latitude.toFixed(4) : "—"}, {typeof selectedEntity.longitude === "number" ? selectedEntity.longitude.toFixed(4) : "—"}
                </div>
              </div>
            )}

            {/* HOSPITAL */}
            {selectedType === "HOSPITAL" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>{selectedEntity.name}</h3>
                <div style={{ padding: "14px", background: "rgba(0,0,0,0.3)", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "var(--text-muted)" }}>Available Beds</span>
                    <strong style={{ color: "#4ade80" }}>{selectedEntity.availableBeds ?? 0} / {selectedEntity.totalBeds ?? 0}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "var(--text-muted)" }}>ICU Capacity</span>
                    <strong style={{ color: "#60a5fa" }}>{selectedEntity.icuBedsAvailable ?? selectedEntity.availableIcu ?? 0} Beds</strong>
                  </div>
                </div>
                <Link href="/hospitals" style={{ display: "block", padding: "9px", background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", color: "var(--text-secondary)", borderRadius: "8px", textAlign: "center", textDecoration: "none", fontSize: "13px", fontWeight: "600" }}>
                  View Network Capacity →
                </Link>
              </div>
            )}

            {/* SHELTER */}
            {selectedType === "SHELTER" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>{selectedEntity.name}</h3>
                <div style={{ padding: "14px", background: "rgba(0,0,0,0.3)", borderRadius: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "var(--text-muted)" }}>Current Occupancy</span>
                    <strong style={{ color: "#fbbf24" }}>{selectedEntity.currentOccupancy ?? selectedEntity.occupied ?? 0} / {selectedEntity.capacity ?? 0}</strong>
                  </div>
                </div>
                <Link href="/hospitals" style={{ display: "block", padding: "9px", background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", color: "var(--text-secondary)", borderRadius: "8px", textAlign: "center", textDecoration: "none", fontSize: "13px", fontWeight: "600" }}>
                  Manage Shelter Stocks →
                </Link>
              </div>
            )}

            <button
              onClick={() => setSelectedEntity(null)}
              style={{ padding: "10px", background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", borderRadius: "8px", color: "var(--text-muted)", cursor: "pointer", fontSize: "13px", fontWeight: "600", marginTop: "auto" }}
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

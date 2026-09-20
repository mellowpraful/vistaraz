"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";

// Ensure Leaflet default icon paths are resolved
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

// Crisp Vector SVG map icons
const MAP_SVGS = {
  INCIDENT_CRITICAL: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  INCIDENT_DEFAULT: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  AMBULANCE: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="14" rx="2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/><path d="M12 8v6M9 11h6"/></svg>`,
  FIRE_ENGINE: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
  BOAT: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a6 6 0 0 0 6-2 6 6 0 0 1 6-2 6 6 0 0 0 6 2 6 6 0 0 1 6 2"/><path d="M4 10l8-6 8 6-2 6H6z"/></svg>`,
  DRONE: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="3"/></svg>`,
  RESOURCE_DEFAULT: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  HOSPITAL: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`,
  SHELTER: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
};

const createCustomIcon = (svgMarkup: string, bgColor: string, isCritical?: boolean) => {
  const pulseHtml = isCritical
    ? `<div style="
        position: absolute;
        inset: -7px;
        border-radius: 50%;
        background: ${bgColor};
        opacity: 0.5;
        animation: radar-ring 2s cubic-bezier(0, 0.2, 0.8, 1) infinite;
        pointer-events: none;
      "></div>`
    : "";

  return L.divIcon({
    className: "custom-map-pin",
    html: `<div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
      ${pulseHtml}
      <div style="
        background-color: ${bgColor};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 14px rgba(0,0,0,0.8), 0 0 12px ${bgColor}90;
        border: 2px solid rgba(255,255,255,0.9);
        cursor: pointer;
        position: relative;
        z-index: 2;
        transition: transform 0.15s ease;
      ">${svgMarkup}</div>
    </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
};

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [center, zoom, map]);
  return null;
}

interface MapProps {
  incidents?: Array<{
    id: string;
    title: string;
    type: string;
    severity: string;
    status: string;
    latitude: number | null;
    longitude: number | null;
    locationName: string | null;
    affectedCount: number | null;
    injuryCount: number | null;
  }>;
  resources?: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    latitude: number | null;
    longitude: number | null;
    agency?: { name?: string };
  }>;
  hospitals?: Array<{
    id: string;
    name: string;
    latitude?: number | null;
    longitude?: number | null;
    availableBeds?: number;
    totalBeds?: number;
    icuBedsAvailable?: number;
    availableIcu?: number;
  }>;
  shelters?: Array<{
    id: string;
    name: string;
    latitude?: number | null;
    longitude?: number | null;
    capacity?: number;
    currentOccupancy?: number;
    occupied?: number;
    status?: string;
  }>;
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  selectedEntity?: any;
  onSelectEntity?: (entity: any, type: string) => void;
  layers?: {
    incidents?: boolean;
    resources?: boolean;
    hospitals?: boolean;
    shelters?: boolean;
    hazardZones?: boolean;
  };
}

export default function SituationMap({
  incidents = [],
  resources = [],
  hospitals = [],
  shelters = [],
  centerLat = 23.0225,
  centerLng = 72.5714,
  zoom = 12,
  onSelectEntity = () => {},
  layers,
}: MapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-slate-400">Loading Geospatial Engine...</span>
        </div>
      </div>
    );
  }

  const safeIncidents = (incidents || []).filter(
    (i) => i && typeof i.latitude === "number" && typeof i.longitude === "number" && !isNaN(i.latitude) && !isNaN(i.longitude)
  );
  const safeResources = (resources || []).filter(
    (r) => r && typeof r.latitude === "number" && typeof r.longitude === "number" && !isNaN(r.latitude) && !isNaN(r.longitude)
  );
  const safeHospitals = (hospitals || []).filter(
    (h) => h && typeof h.latitude === "number" && typeof h.longitude === "number" && !isNaN(h.latitude) && !isNaN(h.longitude)
  );
  const safeShelters = (shelters || []).filter(
    (s) => s && typeof s.latitude === "number" && typeof s.longitude === "number" && !isNaN(s.latitude) && !isNaN(s.longitude)
  );

  const safeLayers = {
    incidents: layers?.incidents ?? true,
    resources: layers?.resources ?? true,
    hospitals: layers?.hospitals ?? true,
    shelters: layers?.shelters ?? true,
    hazardZones: layers?.hazardZones ?? true,
  };

  const getIncidentBg = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "#ef4444";
      case "HIGH":
        return "#f97316";
      case "MEDIUM":
        return "#eab308";
      default:
        return "#3b82f6";
    }
  };

  const getResourceBg = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "#10b981";
      case "ON_SCENE":
      case "DISPATCHED":
      case "EN_ROUTE":
        return "#f59e0b";
      default:
        return "#64748b";
    }
  };

  const getResourceSvg = (type: string) => {
    switch (type) {
      case "AMBULANCE":
        return MAP_SVGS.AMBULANCE;
      case "FIRE_ENGINE":
        return MAP_SVGS.FIRE_ENGINE;
      case "BOAT":
        return MAP_SVGS.BOAT;
      case "DRONE":
        return MAP_SVGS.DRONE;
      default:
        return MAP_SVGS.RESOURCE_DEFAULT;
    }
  };

  const validLat = typeof centerLat === "number" && !isNaN(centerLat) ? centerLat : 23.0225;
  const validLng = typeof centerLng === "number" && !isNaN(centerLng) ? centerLng : 72.5714;
  const validZoom = typeof zoom === "number" && !isNaN(zoom) ? zoom : 12;

  return (
    <MapContainer
      center={[validLat, validLng]}
      zoom={validZoom}
      scrollWheelZoom={true}
      className="h-full w-full min-h-[500px] rounded-xl z-0"
      style={{ background: "#0b0f19", height: "100%", width: "100%" }}
    >
      <MapUpdater center={[validLat, validLng]} zoom={validZoom} />

      {/* Free OSM tiles with CSS dark filter — no API key needed */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
        className="map-tiles-dark"
      />

      {/* Flood / Hazard Simulation Circles */}
      {safeLayers.hazardZones && (
        <>
          <Circle
            center={[23.0305, 72.5801]}
            radius={2200}
            pathOptions={{
              color: "#3b82f6",
              fillColor: "#1d4ed8",
              fillOpacity: 0.22,
              weight: 2,
              dashArray: "6, 6",
            }}
          />
          <Circle
            center={[23.0112, 72.5623]}
            radius={1400}
            pathOptions={{
              color: "#ef4444",
              fillColor: "#b91c1c",
              fillOpacity: 0.2,
              weight: 2,
            }}
          />
        </>
      )}

      {/* Incidents Markers */}
      {safeLayers.incidents &&
        safeIncidents.map((inc) => {
          const isCritical = inc.severity === "CRITICAL";
          const icon = createCustomIcon(
            isCritical ? MAP_SVGS.INCIDENT_CRITICAL : MAP_SVGS.INCIDENT_DEFAULT,
            getIncidentBg(inc.severity),
            isCritical
          );

          return (
            <Marker
              key={`inc-${inc.id}`}
              position={[inc.latitude!, inc.longitude!]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectEntity(inc, "INCIDENT"),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-3 space-y-2 text-slate-100 min-w-[220px] bg-slate-900 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-white">{inc.title}</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                      {inc.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-2">
                    {inc.locationName || "Scene Location"}
                  </p>
                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800">
                    <span className="text-slate-400 font-mono text-[10px]">Status: <strong className="text-slate-200">{inc.status}</strong></span>
                    <Link
                      href={`/dispatch?incidentId=${inc.id}`}
                      className="text-blue-400 font-bold hover:text-blue-300 text-xs"
                    >
                      Dispatch →
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

      {/* Resources Markers */}
      {safeLayers.resources &&
        safeResources.map((res) => {
          const icon = createCustomIcon(
            getResourceSvg(res.type),
            getResourceBg(res.status)
          );

          return (
            <Marker
              key={`res-${res.id}`}
              position={[res.latitude!, res.longitude!]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectEntity(res, "RESOURCE"),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-3 space-y-1.5 text-slate-100 min-w-[190px] bg-slate-900 rounded-lg border border-slate-700">
                  <div className="font-bold text-xs text-white">{res.name}</div>
                  <div className="text-[11px] text-slate-400">{res.agency?.name || "Emergency Agency"}</div>
                  <div className="text-[10px] font-mono text-emerald-400 font-semibold pt-1 border-t border-slate-800">
                    Status: {res.status}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

      {/* Hospitals Markers */}
      {safeLayers.hospitals &&
        safeHospitals.map((hosp) => {
          const icon = createCustomIcon(MAP_SVGS.HOSPITAL, "#0284c7");
          return (
            <Marker
              key={`hosp-${hosp.id}`}
              position={[hosp.latitude!, hosp.longitude!]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectEntity(hosp, "HOSPITAL"),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-3 space-y-1.5 text-slate-100 min-w-[200px] bg-slate-900 rounded-lg border border-slate-700">
                  <div className="font-bold text-xs text-white">{hosp.name}</div>
                  <div className="text-[11px] text-slate-300">
                    Beds: <strong className="text-emerald-400">{hosp.availableBeds ?? 0}/{hosp.totalBeds ?? 0}</strong>
                  </div>
                  <div className="text-[10px] font-mono text-blue-300">
                    ICU Available: {hosp.icuBedsAvailable ?? hosp.availableIcu ?? 0}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

      {/* Shelters Markers */}
      {safeLayers.shelters &&
        safeShelters.map((shelter) => {
          const icon = createCustomIcon(MAP_SVGS.SHELTER, "#d97706");
          return (
            <Marker
              key={`shelt-${shelter.id}`}
              position={[shelter.latitude!, shelter.longitude!]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectEntity(shelter, "SHELTER"),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-3 space-y-1.5 text-slate-100 min-w-[200px] bg-slate-900 rounded-lg border border-slate-700">
                  <div className="font-bold text-xs text-white">{shelter.name}</div>
                  <div className="text-[11px] text-slate-300">
                    Occupancy: <strong className="text-amber-400">{shelter.currentOccupancy ?? shelter.occupied ?? 0}/{shelter.capacity ?? 0}</strong>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
    </MapContainer>
  );
}

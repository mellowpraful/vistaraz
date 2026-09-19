"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { INCIDENT_TYPE_ICONS } from "@/lib/types";

// Ensure Leaflet default icon paths are resolved
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

// Custom SVG map icons
const createCustomIcon = (emoji: string, bgColor: string, isCritical?: boolean) => {
  const pulseHtml = isCritical
    ? `<div style="
        position: absolute;
        inset: -8px;
        border-radius: 50%;
        background: ${bgColor};
        opacity: 0.4;
        animation: radar-ring 2s cubic-bezier(0, 0.2, 0.8, 1) infinite;
        pointer-events: none;
      "></div>`
    : "";

  return L.divIcon({
    className: "custom-map-pin",
    html: `<div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
      ${pulseHtml}
      <div style="
        background-color: ${bgColor};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.6), 0 0 12px ${bgColor}80;
        border: 2px solid #ffffff;
        cursor: pointer;
        position: relative;
        z-index: 2;
        transition: transform 0.15s ease;
      ">${emoji}</div>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
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
          <div className="animate-spin text-3xl">🌐</div>
          <span className="text-xs text-slate-500">Loading Geospatial Engine...</span>
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

  const validLat = typeof centerLat === "number" && !isNaN(centerLat) ? centerLat : 23.0225;
  const validLng = typeof centerLng === "number" && !isNaN(centerLng) ? centerLng : 72.5714;
  const validZoom = typeof zoom === "number" && !isNaN(zoom) ? zoom : 12;

  return (
    <MapContainer
      center={[validLat, validLng]}
      zoom={validZoom}
      scrollWheelZoom={true}
      className="h-full w-full rounded-xl z-0"
      style={{ background: "#0b0f19", height: "100%", width: "100%" }}
    >
      <MapUpdater center={[validLat, validLng]} zoom={validZoom} />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
              fillOpacity: 0.25,
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
          const icon = createCustomIcon(
            INCIDENT_TYPE_ICONS[inc.type as keyof typeof INCIDENT_TYPE_ICONS] || "🚨",
            getIncidentBg(inc.severity),
            inc.severity === "CRITICAL"
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
                <div className="p-2 space-y-1.5 text-slate-900 min-w-[200px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs">{inc.title}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                      {inc.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    📍 {inc.locationName || "Scene Location"}
                  </p>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200">
                    <span>Status: <strong>{inc.status}</strong></span>
                    <Link
                      href={`/incidents/${inc.id}`}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      SITREP →
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
            res.type === "AMBULANCE"
              ? "🚑"
              : res.type === "FIRE_ENGINE"
              ? "🚒"
              : res.type === "BOAT"
              ? "🚤"
              : res.type === "DRONE"
              ? "🚁"
              : "🛡️",
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
              <Popup>
                <div className="p-2 space-y-1 text-slate-900 min-w-[180px]">
                  <div className="font-bold text-xs">{res.name}</div>
                  <div className="text-[11px] text-slate-600">{res.agency?.name || "Emergency Response Agency"}</div>
                  <div className="text-[10px] font-mono text-emerald-700 font-semibold">
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
          const icon = createCustomIcon("🏥", "#0284c7");
          return (
            <Marker
              key={`hosp-${hosp.id}`}
              position={[hosp.latitude!, hosp.longitude!]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectEntity(hosp, "HOSPITAL"),
              }}
            >
              <Popup>
                <div className="p-2 space-y-1 text-slate-900 min-w-[180px]">
                  <div className="font-bold text-xs">{hosp.name}</div>
                  <div className="text-[11px] text-slate-700">
                    Beds: {hosp.availableBeds ?? 0}/{hosp.totalBeds ?? 0} (ICU: {hosp.icuBedsAvailable ?? hosp.availableIcu ?? 0})
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

      {/* Shelters Markers */}
      {safeLayers.shelters &&
        safeShelters.map((shelter) => {
          const icon = createCustomIcon("⛺", "#d97706");
          return (
            <Marker
              key={`shelt-${shelter.id}`}
              position={[shelter.latitude!, shelter.longitude!]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectEntity(shelter, "SHELTER"),
              }}
            >
              <Popup>
                <div className="p-2 space-y-1 text-slate-900 min-w-[180px]">
                  <div className="font-bold text-xs">{shelter.name}</div>
                  <div className="text-[11px] text-slate-700">
                    Occupancy: {shelter.currentOccupancy ?? shelter.occupied ?? 0}/{shelter.capacity ?? 0}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
    </MapContainer>
  );
}

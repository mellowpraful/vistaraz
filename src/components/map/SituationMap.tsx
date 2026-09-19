"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { INCIDENT_TYPE_ICONS } from "@/lib/types";

// Custom SVG map icons
const createCustomIcon = (emoji: string, bgColor: string) => {
  return L.divIcon({
    className: "custom-map-pin",
    html: `<div style="
      background-color: ${bgColor};
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      box-shadow: 0 0 10px rgba(0,0,0,0.5), 0 0 15px ${bgColor};
      border: 2px solid white;
    ">${emoji}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -20],
  });
};

interface MapProps {
  incidents: Array<{
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
  resources: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    latitude: number | null;
    longitude: number | null;
    agency: { name: string };
  }>;
  hospitals: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    availableBeds: number;
    totalBeds: number;
    icuBedsAvailable: number;
  }>;
  shelters: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    capacity: number;
    currentOccupancy: number;
    status: string;
  }>;
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  selectedEntity: any;
  onSelectEntity: (entity: any, type: string) => void;
  layers: {
    incidents: boolean;
    resources: boolean;
    hospitals: boolean;
    shelters: boolean;
    hazardZones: boolean;
  };
}

export default function SituationMap({
  incidents,
  resources,
  hospitals,
  shelters,
  centerLat = 23.0225,
  centerLng = 72.5714,
  zoom = 12,
  onSelectEntity,
  layers,
}: MapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="animate-spin text-3xl">🌐</div>
      </div>
    );
  }

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
        return "#f59e0b";
      default:
        return "#64748b";
    }
  };

  return (
    <MapContainer
      center={[centerLat, centerLng]}
      zoom={zoom}
      scrollWheelZoom={true}
      className="h-full w-full rounded-xl z-0"
      style={{ background: "#0b0f19" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {/* Flood / Hazard Simulation Circles */}
      {layers.hazardZones && (
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
      {layers.incidents &&
        incidents
          .filter((i) => i.latitude && i.longitude)
          .map((inc) => {
            const icon = createCustomIcon(
              INCIDENT_TYPE_ICONS[inc.type as keyof typeof INCIDENT_TYPE_ICONS] || "🚨",
              getIncidentBg(inc.severity)
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
      {layers.resources &&
        resources
          .filter((r) => r.latitude && r.longitude)
          .map((res) => {
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
                    <div className="text-[11px] text-slate-600">{res.agency.name}</div>
                    <div className="text-[10px] font-mono text-emerald-700 font-semibold">
                      Status: {res.status}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

      {/* Hospitals Markers */}
      {layers.hospitals &&
        hospitals.map((hosp) => {
          const icon = createCustomIcon("🏥", "#0284c7");
          return (
            <Marker
              key={`hosp-${hosp.id}`}
              position={[hosp.latitude, hosp.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectEntity(hosp, "HOSPITAL"),
              }}
            >
              <Popup>
                <div className="p-2 space-y-1 text-slate-900 min-w-[180px]">
                  <div className="font-bold text-xs">{hosp.name}</div>
                  <div className="text-[11px] text-slate-700">
                    Beds: {hosp.availableBeds}/{hosp.totalBeds} (ICU: {hosp.icuBedsAvailable})
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

      {/* Shelters Markers */}
      {layers.shelters &&
        shelters.map((shelter) => {
          const icon = createCustomIcon("⛺", "#d97706");
          return (
            <Marker
              key={`shelt-${shelter.id}`}
              position={[shelter.latitude, shelter.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectEntity(shelter, "SHELTER"),
              }}
            >
              <Popup>
                <div className="p-2 space-y-1 text-slate-900 min-w-[180px]">
                  <div className="font-bold text-xs">{shelter.name}</div>
                  <div className="text-[11px] text-slate-700">
                    Occupancy: {shelter.currentOccupancy}/{shelter.capacity}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
    </MapContainer>
  );
}

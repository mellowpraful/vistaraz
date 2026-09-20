"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Ensure Leaflet default icon paths are resolved safely
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

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

function LocationMarker({ position, onChange }: { position: [number, number]; onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

export interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  onChange?: (lat: number, lng: number) => void;
  readOnly?: boolean;
}

export default function LocationPickerMap({ latitude, longitude, onChange, readOnly = false }: LocationPickerMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-full w-full min-h-[300px] flex items-center justify-center bg-slate-950 text-slate-400 rounded-lg border border-slate-800">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin text-3xl">🌐</div>
          <span className="text-xs text-slate-500">Loading Map...</span>
        </div>
      </div>
    );
  }

  const validLat = typeof latitude === "number" && !isNaN(latitude) ? latitude : 23.0225;
  const validLng = typeof longitude === "number" && !isNaN(longitude) ? longitude : 72.5714;
  
  const handleLocationChange = (lat: number, lng: number) => {
    if (!readOnly && onChange) {
      onChange(parseFloat(lat.toFixed(6)), parseFloat(lng.toFixed(6)));
    }
  };

  return (
    <MapContainer
      center={[validLat, validLng]}
      zoom={14}
      scrollWheelZoom={true}
      className="h-full w-full rounded-lg z-0 min-h-[300px]"
      style={{ background: "#0b0f19", height: "100%", width: "100%", cursor: readOnly ? "default" : "crosshair" }}
    >
      <MapUpdater center={[validLat, validLng]} zoom={14} />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        className="map-tiles-dark"
      />

      <LocationMarker 
        position={[validLat, validLng]} 
        onChange={handleLocationChange} 
      />
    </MapContainer>
  );
}

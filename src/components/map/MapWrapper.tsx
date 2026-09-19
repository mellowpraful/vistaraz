"use client";

import dynamic from "next/dynamic";
import { LocationPickerMapProps } from "./LocationPickerMap";

// Dynamically import the map component with ssr disabled to prevent "window is not defined" error
const LocationPickerMap = dynamic(() => import("./LocationPickerMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full min-h-[300px] flex items-center justify-center bg-slate-950 text-slate-400 rounded-lg border border-slate-800">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin text-3xl">🌐</div>
        <span className="text-xs text-slate-500">Loading Interactive Map...</span>
      </div>
    </div>
  ),
});

export default function MapWrapper(props: LocationPickerMapProps) {
  return <LocationPickerMap {...props} />;
}

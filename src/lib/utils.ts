import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function parseJsonSafe<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

/**
 * Robust helper to extract an array payload from API responses regardless of shape
 * (supports { data: [...] }, { incidents: [...] }, { resources: [...] }, { logs: [...] }, or raw array).
 */
export function extractApiData<T>(json: any): T[] {
  if (!json) return [];
  if (Array.isArray(json)) return json as T[];
  if (Array.isArray(json.data)) return json.data as T[];
  if (Array.isArray(json.incidents)) return json.incidents as T[];
  if (Array.isArray(json.resources)) return json.resources as T[];
  if (Array.isArray(json.hospitals)) return json.hospitals as T[];
  if (Array.isArray(json.shelters)) return json.shelters as T[];
  if (Array.isArray(json.logs)) return json.logs as T[];
  if (Array.isArray(json.recommendations)) return json.recommendations as T[];
  return [];
}

/**
 * Robust helper to extract a single object payload from API responses.
 */
export function extractApiItem<T>(json: any): T | null {
  if (!json) return null;
  if (json.data && typeof json.data === "object" && !Array.isArray(json.data)) return json.data as T;
  if (json.incident && typeof json.incident === "object") return json.incident as T;
  if (json.resource && typeof json.resource === "object") return json.resource as T;
  if (json.log && typeof json.log === "object") return json.log as T;
  if (typeof json === "object" && !Array.isArray(json) && !("success" in json && !json.success)) return json as T;
  return null;
}



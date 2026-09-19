/**
 * CrisisOS — Capability-Based Dispatch Matcher
 *
 * Core business logic for matching resources to incidents.
 * CAPABILITY COMPATIBILITY IS A HARD FILTER — resources that cannot
 * perform the required task are NEVER recommended, regardless of proximity.
 */

import { parseJsonSafe } from "@/lib/utils";
import { CAPABILITY_MATRIX } from "@/lib/types";

export interface ResourceForMatching {
  id: string;
  name: string;
  type: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
  reliabilityScore: number;
  currentWorkload: number;
  estimatedEtaMinutes: number | null;
  capabilities: Array<{ capability: string; equipment: string | null }>;
}

export interface IncidentForMatching {
  id: string;
  latitude: number | null;
  longitude: number | null;
  severity: string;
  type: string;
  requiredCapabilities: string | null;
}

export interface MatchResult {
  resource: ResourceForMatching;
  rank: number;
  score: number;
  etaMinutes: number | null;
  distanceKm: number | null;
  matchedCapabilities: string[];
  missingCapabilities: string[];
  reasons: string[];
  constraints: string[];
}

// Haversine distance formula
function haversineDistanceKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Average speed assumptions by resource type (km/h)
const SPEED_BY_TYPE: Record<string, number> = {
  AMBULANCE: 60,
  FIRE_ENGINE: 50,
  POLICE_UNIT: 70,
  RESCUE_TEAM: 50,
  MEDICAL_TEAM: 60,
  BOAT: 30,
  DRONE: 80,
  HELICOPTER: 150,
  RELIEF_VEHICLE: 50,
  HAZMAT_UNIT: 50,
  SEARCH_DOG_UNIT: 40,
  SPECIALIZED: 50,
};

function estimateEta(resource: ResourceForMatching, distanceKm: number): number {
  const speed = SPEED_BY_TYPE[resource.type] ?? 50;
  const driveMinutes = (distanceKm / speed) * 60;
  const mobilizationMinutes = resource.status === "STANDBY" ? 5 : 2;
  return Math.round(driveMinutes + mobilizationMinutes);
}

/**
 * Get all capabilities a resource type can provide (from capability matrix)
 * plus explicitly assigned capabilities.
 */
function getResourceCapabilities(resource: ResourceForMatching): string[] {
  const explicit = resource.capabilities.map((c) => c.capability);
  const fromMatrix = CAPABILITY_MATRIX[resource.type] ?? [];
  return Array.from(new Set([...explicit, ...fromMatrix]));
}

/**
 * HARD FILTER: Capability compatibility check.
 * A resource passes only if it covers ALL required capabilities.
 * Returns matched and missing capability lists.
 */
function checkCapabilityCompatibility(
  resource: ResourceForMatching,
  required: string[]
): { matched: string[]; missing: string[] } {
  if (required.length === 0) {
    return { matched: [], missing: [] };
  }

  const resourceCaps = getResourceCapabilities(resource);
  const matched: string[] = [];
  const missing: string[] = [];

  for (const cap of required) {
    if (resourceCaps.includes(cap)) {
      matched.push(cap);
    } else {
      missing.push(cap);
    }
  }

  return { matched, missing };
}

/**
 * Score a resource candidate — higher is better.
 * Factors: capability match, distance, ETA, workload, reliability, status
 */
function scoreResource(
  resource: ResourceForMatching,
  distanceKm: number | null,
  etaMinutes: number | null,
  matched: string[],
  missing: string[],
  severity: string
): number {
  let score = 100;

  // Penalize missing capabilities (already filtered, but partial matches get lower scores)
  score -= missing.length * 20;

  // ETA penalty (lower ETA = better)
  if (etaMinutes !== null) {
    score -= Math.min(etaMinutes * 0.5, 40); // max 40 point penalty
  }

  // Distance penalty
  if (distanceKm !== null) {
    score -= Math.min(distanceKm * 0.3, 20); // max 20 point penalty
  }

  // Reliability bonus
  score += resource.reliabilityScore * 10;

  // Workload penalty
  score -= resource.currentWorkload * 0.1;

  // Status bonus
  if (resource.status === "AVAILABLE") score += 10;
  if (resource.status === "STANDBY") score += 5;

  // Severity urgency bonus — for CRITICAL, prefer faster resources
  if (severity === "CRITICAL" && etaMinutes !== null) {
    score += Math.max(0, 20 - etaMinutes);
  }

  return Math.max(0, score);
}

function buildReasons(
  resource: ResourceForMatching,
  distanceKm: number | null,
  etaMinutes: number | null,
  matched: string[],
  severity: string
): string[] {
  const reasons: string[] = [];

  if (matched.length > 0) {
    reasons.push(`Equipped with required capabilities: ${matched.join(", ")}`);
  }
  if (resource.status === "AVAILABLE") {
    reasons.push("Currently available and ready to dispatch");
  } else if (resource.status === "STANDBY") {
    reasons.push("On standby — can mobilize within 5 minutes");
  }
  if (distanceKm !== null) {
    reasons.push(`Located ${distanceKm.toFixed(1)} km from the incident`);
  }
  if (etaMinutes !== null) {
    reasons.push(`Estimated arrival: ${etaMinutes} minutes`);
  }
  if (resource.reliabilityScore >= 0.9) {
    reasons.push(`High reliability score: ${(resource.reliabilityScore * 100).toFixed(0)}%`);
  }
  if (resource.currentWorkload <= 30) {
    reasons.push("Low current workload — full capacity available");
  }
  if (severity === "CRITICAL") {
    reasons.push("Prioritized for CRITICAL severity incident");
  }

  return reasons;
}

function buildConstraints(
  resource: ResourceForMatching,
  missing: string[]
): string[] {
  const constraints: string[] = [];
  if (resource.currentWorkload > 70) {
    constraints.push(`High workload (${resource.currentWorkload}%) — may have reduced capacity`);
  }
  if (resource.reliabilityScore < 0.7) {
    constraints.push(`Lower reliability score: ${(resource.reliabilityScore * 100).toFixed(0)}%`);
  }
  if (missing.length > 0) {
    constraints.push(`Missing capabilities: ${missing.join(", ")} — may require supplementary resources`);
  }
  return constraints;
}

/**
 * Main matching function.
 * Returns ranked list of candidates. Resources with missing capabilities
 * are excluded if strict=true (default for CRITICAL/HIGH).
 */
export function matchResources(
  incident: IncidentForMatching,
  resources: ResourceForMatching[],
  options: { strict?: boolean; maxResults?: number } = {}
): MatchResult[] {
  const { strict = incident.severity === "CRITICAL" || incident.severity === "HIGH", maxResults = 5 } = options;
  const required = parseJsonSafe<string[]>(incident.requiredCapabilities, []);

  // Filter: only AVAILABLE or STANDBY resources
  const eligible = resources.filter(
    (r) => r.status === "AVAILABLE" || r.status === "STANDBY"
  );

  const candidates: MatchResult[] = [];

  for (const resource of eligible) {
    const { matched, missing } = checkCapabilityCompatibility(resource, required);

    // HARD FILTER: if strict mode and there are missing capabilities, skip
    if (strict && missing.length > 0) continue;

    // Calculate distance and ETA
    let distanceKm: number | null = null;
    let etaMinutes: number | null = null;

    if (
      incident.latitude !== null && incident.longitude !== null &&
      resource.latitude !== null && resource.longitude !== null
    ) {
      distanceKm = haversineDistanceKm(
        incident.latitude, incident.longitude,
        resource.latitude, resource.longitude
      );
      etaMinutes = estimateEta(resource, distanceKm);
    } else if (resource.estimatedEtaMinutes !== null) {
      etaMinutes = resource.estimatedEtaMinutes;
    }

    const score = scoreResource(resource, distanceKm, etaMinutes, matched, missing, incident.severity);
    const reasons = buildReasons(resource, distanceKm, etaMinutes, matched, incident.severity);
    const constraints = buildConstraints(resource, missing);

    candidates.push({
      resource,
      rank: 0, // assigned after sorting
      score,
      etaMinutes,
      distanceKm,
      matchedCapabilities: matched,
      missingCapabilities: missing,
      reasons,
      constraints,
    });
  }

  // Sort by score descending
  candidates.sort((a, b) => b.score - a.score);

  // Assign ranks and limit results
  return candidates.slice(0, maxResults).map((c, i) => ({ ...c, rank: i + 1 }));
}

// CrisisOS — Shared TypeScript types and Zod schemas

import { z } from "zod";

// ─── Enums ─────────────────────────────────────────────────────────

export const IncidentTypeEnum = z.enum([
  "FLOOD", "FIRE", "ROAD_ACCIDENT", "INDUSTRIAL", "MEDICAL",
  "EARTHQUAKE", "BUILDING_COLLAPSE", "HAZMAT", "SEARCH_RESCUE", "OTHER"
]);
export type IncidentType = z.infer<typeof IncidentTypeEnum>;

export const SeverityEnum = z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW", "UNKNOWN"]);
export type Severity = z.infer<typeof SeverityEnum>;

export const IncidentStatusEnum = z.enum([
  "REPORTED", "VERIFIED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"
]);
export type IncidentStatus = z.infer<typeof IncidentStatusEnum>;

export const IncidentSourceEnum = z.enum([
  "EMERGENCY_CALL", "CITIZEN_REPORT", "SENSOR", "FIELD_TEAM",
  "HOSPITAL", "GOVERNMENT", "TELEGRAM", "MANUAL"
]);
export type IncidentSource = z.infer<typeof IncidentSourceEnum>;

export const ResourceTypeEnum = z.enum([
  "AMBULANCE", "FIRE_ENGINE", "RESCUE_TEAM", "POLICE_UNIT", "MEDICAL_TEAM",
  "BOAT", "DRONE", "RELIEF_VEHICLE", "HELICOPTER", "HAZMAT_UNIT",
  "SEARCH_DOG_UNIT", "SPECIALIZED"
]);
export type ResourceType = z.infer<typeof ResourceTypeEnum>;

export const ResourceStatusEnum = z.enum([
  "AVAILABLE", "DISPATCHED", "EN_ROUTE", "ON_SCENE", "RETURNING",
  "OUT_OF_SERVICE", "STANDBY"
]);
export type ResourceStatus = z.infer<typeof ResourceStatusEnum>;

export const UserRoleEnum = z.enum([
  "ADMIN", "COMMANDER", "OPERATOR", "DISPATCHER", "FIELD", "VIEWER"
]);
export type UserRole = z.infer<typeof UserRoleEnum>;

// ─── Core Schemas ──────────────────────────────────────────────────

export const IncidentSchema = z.object({
  id: z.string(),
  title: z.string().min(3),
  description: z.string(),
  type: IncidentTypeEnum,
  severity: SeverityEnum,
  status: IncidentStatusEnum,
  source: IncidentSourceEnum,
  locationName: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  locationConfidence: z.number().nullable(),
  affectedCount: z.number().nullable(),
  injuryCount: z.number().nullable(),
  hazards: z.string().nullable(), // JSON
  requiredCapabilities: z.string().nullable(), // JSON
  language: z.string().nullable(),
  originalReport: z.string().nullable(),
  aiExtracted: z.boolean(),
  confidence: z.number().nullable(),
  simulationId: z.string().nullable(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});
export type Incident = z.infer<typeof IncidentSchema>;

export const CreateIncidentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: IncidentTypeEnum,
  severity: SeverityEnum,
  source: IncidentSourceEnum,
  locationName: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  affectedCount: z.number().int().min(0).optional(),
  injuryCount: z.number().int().min(0).optional(),
  hazards: z.array(z.string()).optional(),
  requiredCapabilities: z.array(z.string()).optional(),
  language: z.string().optional(),
  originalReport: z.string().optional(),
});
export type CreateIncidentInput = z.infer<typeof CreateIncidentSchema>;

export const UpdateIncidentStatusSchema = z.object({
  status: IncidentStatusEnum,
  notes: z.string().optional(),
});

export const ResourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: ResourceTypeEnum,
  status: ResourceStatusEnum,
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  locationName: z.string().nullable(),
  reliabilityScore: z.number(),
  currentWorkload: z.number(),
  estimatedEtaMinutes: z.number().nullable(),
  capabilities: z.array(z.object({
    id: z.string(),
    capability: z.string(),
    equipment: z.string().nullable(),
  })),
  lastUpdated: z.string().or(z.date()),
  createdAt: z.string().or(z.date()),
});
export type Resource = z.infer<typeof ResourceSchema>;

export const DispatchRecommendationSchema = z.object({
  id: z.string(),
  incidentId: z.string(),
  resourceId: z.string(),
  rank: z.number(),
  score: z.number(),
  etaMinutes: z.number().nullable(),
  distanceKm: z.number().nullable(),
  matchedCapabilities: z.array(z.string()),
  missingCapabilities: z.array(z.string()),
  reasons: z.array(z.string()),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "SUPERSEDED"]),
  resource: ResourceSchema.optional(),
  createdAt: z.string().or(z.date()),
});
export type DispatchRecommendation = z.infer<typeof DispatchRecommendationSchema>;

export const ApproveDispatchSchema = z.object({
  recommendationId: z.string().optional(),
  incidentId: z.string().optional(),
  resourceId: z.string().optional(),
  action: z
    .enum(["APPROVED", "REJECTED", "MODIFIED", "APPROVE", "REJECT", "MANUAL_OVERRIDE"])
    .transform((val) => {
      if (val === "APPROVE") return "APPROVED";
      if (val === "REJECT") return "REJECTED";
      if (val === "MANUAL_OVERRIDE") return "MODIFIED";
      return val;
    }),
  notes: z.string().optional(),
  rejectionReason: z.string().optional(),
  userId: z.string().optional(),
  approvedBy: z.string().optional(),
});


export const AuditLogSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  action: z.string(),
  entity: z.string(),
  entityId: z.string().nullable(),
  before: z.string().nullable(),
  after: z.string().nullable(),
  metadata: z.string().nullable(),
  createdAt: z.string().or(z.date()),
});
export type AuditLog = z.infer<typeof AuditLogSchema>;

// ─── AI Extraction ─────────────────────────────────────────────────

export const AIExtractionSchema = z.object({
  title: z.string(),
  type: IncidentTypeEnum,
  severity: SeverityEnum,
  locationName: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  locationConfidence: z.number().min(0).max(1),
  affectedCount: z.number().optional(),
  injuryCount: z.number().optional(),
  hazards: z.array(z.string()),
  requiredCapabilities: z.array(z.string()),
  missingInfo: z.array(z.string()),
  suggestedQuestions: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  summary: z.string(),
  language: z.string(),
});
export type AIExtraction = z.infer<typeof AIExtractionSchema>;

// ─── Constants ─────────────────────────────────────────────────────

export const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "text-red-400 bg-red-950 border-red-800",
  HIGH: "text-orange-400 bg-orange-950 border-orange-800",
  MEDIUM: "text-yellow-400 bg-yellow-950 border-yellow-800",
  LOW: "text-green-400 bg-green-950 border-green-800",
  UNKNOWN: "text-gray-400 bg-gray-950 border-gray-700",
};

export const SEVERITY_DOT: Record<string, string> = {
  CRITICAL: "bg-red-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-yellow-500",
  LOW: "bg-green-500",
  UNKNOWN: "bg-gray-500",
};

export const STATUS_COLORS: Record<string, string> = {
  REPORTED: "text-blue-400 bg-blue-950 border-blue-800",
  VERIFIED: "text-purple-400 bg-purple-950 border-purple-800",
  ASSIGNED: "text-indigo-400 bg-indigo-950 border-indigo-800",
  IN_PROGRESS: "text-orange-400 bg-orange-950 border-orange-800",
  RESOLVED: "text-green-400 bg-green-950 border-green-800",
  CLOSED: "text-gray-400 bg-gray-900 border-gray-700",
};

export const RESOURCE_STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "text-green-400 bg-green-950 border-green-800",
  DISPATCHED: "text-orange-400 bg-orange-950 border-orange-800",
  EN_ROUTE: "text-blue-400 bg-blue-950 border-blue-800",
  ON_SCENE: "text-purple-400 bg-purple-950 border-purple-800",
  RETURNING: "text-cyan-400 bg-cyan-950 border-cyan-800",
  OUT_OF_SERVICE: "text-red-400 bg-red-950 border-red-800",
  STANDBY: "text-gray-400 bg-gray-900 border-gray-700",
};

export const INCIDENT_TYPE_ICONS: Record<string, string> = {
  FLOOD: "🌊",
  FIRE: "🔥",
  ROAD_ACCIDENT: "🚗",
  INDUSTRIAL: "🏭",
  MEDICAL: "🏥",
  EARTHQUAKE: "🌍",
  BUILDING_COLLAPSE: "🏗️",
  HAZMAT: "☢️",
  SEARCH_RESCUE: "🔍",
  OTHER: "⚠️",
};

export const RESOURCE_TYPE_ICONS: Record<string, string> = {
  AMBULANCE: "🚑",
  FIRE_ENGINE: "🚒",
  RESCUE_TEAM: "🦺",
  POLICE_UNIT: "🚓",
  MEDICAL_TEAM: "👨‍⚕️",
  BOAT: "⛵",
  DRONE: "🚁",
  RELIEF_VEHICLE: "🚛",
  HELICOPTER: "🚁",
  HAZMAT_UNIT: "☢️",
  SEARCH_DOG_UNIT: "🐕",
  SPECIALIZED: "🔧",
};

// Valid status transitions
export const STATUS_TRANSITIONS: Record<string, string[]> = {
  REPORTED: ["VERIFIED", "CLOSED"],
  VERIFIED: ["ASSIGNED", "CLOSED"],
  ASSIGNED: ["IN_PROGRESS", "CLOSED"],
  IN_PROGRESS: ["RESOLVED", "CLOSED"],
  RESOLVED: ["CLOSED"],
  CLOSED: [],
};

// Capability matrix — which resource types can fulfill which capabilities
export const CAPABILITY_MATRIX: Record<string, string[]> = {
  AMBULANCE: ["TRAUMA_CARE", "PATIENT_TRANSPORT", "BASIC_LIFE_SUPPORT", "ADVANCED_LIFE_SUPPORT"],
  FIRE_ENGINE: ["FIRE_SUPPRESSION", "RESCUE", "HAZMAT_RESPONSE", "WATER_SUPPLY"],
  RESCUE_TEAM: ["WATER_RESCUE", "URBAN_RESCUE", "TECHNICAL_RESCUE", "ROPE_RESCUE"],
  POLICE_UNIT: ["CROWD_CONTROL", "EVACUATION", "SECURITY", "TRAFFIC_MANAGEMENT"],
  MEDICAL_TEAM: ["TRAUMA_CARE", "TRIAGE", "FIELD_SURGERY", "ADVANCED_LIFE_SUPPORT"],
  BOAT: ["WATER_RESCUE", "FLOOD_EVACUATION", "SUPPLY_DELIVERY"],
  DRONE: ["AERIAL_SURVEILLANCE", "SEARCH_ASSISTANCE", "SUPPLY_DELIVERY"],
  RELIEF_VEHICLE: ["SUPPLY_DELIVERY", "EVACUATION_TRANSPORT", "EQUIPMENT_TRANSPORT"],
  HELICOPTER: ["AERIAL_RESCUE", "AERIAL_SURVEILLANCE", "PATIENT_TRANSPORT", "SUPPLY_DELIVERY"],
  HAZMAT_UNIT: ["HAZMAT_RESPONSE", "DECONTAMINATION", "CHEMICAL_DETECTION"],
  SEARCH_DOG_UNIT: ["SEARCH_ASSISTANCE", "URBAN_RESCUE"],
  SPECIALIZED: ["SPECIALIZED_RESCUE"],
};

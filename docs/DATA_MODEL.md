# CrisisOS — Data Model & Schema Specification

This document provides a comprehensive breakdown of the database schema, entity relationships, indexing strategy, and multi-database compatibility (SQLite for local development to PostgreSQL for production).

---

## 1. Entity-Relationship Overview

```
+---------------+       +------------------+       +----------------------+
|    Agency     |1-----*|     Resource     |1-----*|  ResourceCapability  |
+---------------+       +------------------+       +----------------------+
        |                         |                           |
        |1                        |1                          |
        |                         |*                          |
        |*                        |                           |
+---------------+       +------------------+                  |
|     User      |       |ResourceAssignment|                  |
+---------------+       +------------------+                  |
        |                         |                           |
        |1                        |*                          |
        |*                        v                           |
+---------------+       +------------------+       +----------+-----------+
|   AuditLog    |       |     Incident     |1-----*|DispatchRecommendation|
+---------------+       +------------------+       +----------------------+
                                  |                           |
                                  |1                          |1
                                  |*                          |*
                        +---------+--------+       +----------+-----------+
                        |  IncidentReport  |       |   DispatchApproval   |
                        |  IncidentEvent   |       +----------------------+
                        +------------------+
```

---

## 2. Model Definitions

### `Agency`
Represents an emergency organization (e.g. Fire Department, Medical 108, NDRF Rescue, Police).
- `id` (String, PK, CUID)
- `name` (String)
- `type` (String: `FIRE`, `MEDICAL`, `POLICE`, `RESCUE`, `GOVERNMENT`)
- `phone`, `email` (String?)

### `Incident`
Represents an active or resolved emergency event.
- `id` (String, PK, CUID)
- `title`, `description` (String)
- `type` (Enum: `FLOOD`, `FIRE`, `ROAD_ACCIDENT`, `HAZMAT`, `MEDICAL`, `BUILDING_COLLAPSE`, `SEARCH_RESCUE`, `OTHER`)
- `severity` (Enum: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `UNKNOWN`)
- `status` (Enum: `REPORTED`, `VERIFIED`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`)
- `source` (Enum: `EMERGENCY_CALL`, `CITIZEN_REPORT`, `SENSOR`, `FIELD_TEAM`, `HOSPITAL`, `GOVERNMENT`, `MANUAL`)
- `latitude`, `longitude` (Float?)
- `locationName` (String?)
- `affectedCount`, `injuryCount` (Int?)
- `hazards` (JSON String: e.g. `["Fast Rising Water", "Submerged Power Lines"]`)
- `requiredCapabilities` (JSON String: e.g. `["WATER_RESCUE", "EVACUATION"]`)
- `aiExtracted` (Boolean)
- `confidence` (Float?)

### `Resource`
Represents physical fleet vehicles, boats, aircraft, and responder personnel.
- `id` (String, PK, CUID)
- `name` (String)
- `type` (Enum: `AMBULANCE`, `FIRE_ENGINE`, `RESCUE_TEAM`, `BOAT`, `DRONE`, `HELICOPTER`, `HAZMAT_UNIT`, etc.)
- `status` (Enum: `AVAILABLE`, `DISPATCHED`, `EN_ROUTE`, `ON_SCENE`, `RETURNING`, `OUT_OF_SERVICE`, `STANDBY`)
- `latitude`, `longitude` (Float?)
- `reliabilityScore` (Float: 0.0 to 1.0)
- `currentWorkload` (Int: 0 to 100%)
- `agencyId` (FK to Agency)

### `DispatchRecommendation` & `DispatchApproval`
Stores AI candidate rankings with explainable scores and tracks human-in-the-loop decisions.
- `score` (Float: composite rank score)
- `etaMinutes`, `distanceKm` (Float?)
- `reasons` (JSON String array of justification strings)
- `status` (Enum: `PENDING`, `APPROVED`, `REJECTED`, `SUPERSEDED`)

---

## 3. SQLite to PostgreSQL Migration

CrisisOS is designed for zero-config SQLite local development and instant PostgreSQL/Supabase production deployment:

To switch to PostgreSQL in production:
1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
2. Set `DATABASE_URL="postgresql://user:password@db-host:5432/crisisos?schema=public"` in `.env`.
3. Run `npx prisma db push`.

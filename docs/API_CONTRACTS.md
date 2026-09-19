# CrisisOS — API Contracts & Route Specifications

This document defines the REST API endpoints, request schemas, response formats, and error codes for all CrisisOS route handlers.

---

## 1. Incidents API

### `GET /api/incidents`
Fetch incident queue with optional status, severity, and type filters.
- **Query Parameters:** `status` (comma-separated), `severity`, `type`, `limit`, `offset`
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clz...",
      "title": "Flash Flood - Usmanpura",
      "severity": "CRITICAL",
      "status": "IN_PROGRESS",
      "type": "FLOOD",
      "latitude": 23.0456,
      "longitude": 72.5721,
      "affectedCount": 30,
      "assignments": [...]
    }
  ]
}
```

### `POST /api/incidents`
Log and register a new emergency incident.
- **Request Body:**
```json
{
  "title": "Industrial Boiler Rupture",
  "description": "High temperature steam leak in manufacturing unit",
  "type": "INDUSTRIAL",
  "severity": "HIGH",
  "source": "CITIZEN_REPORT",
  "locationName": "Naroda Industrial Area",
  "latitude": 23.0812,
  "longitude": 72.6514,
  "affectedCount": 12,
  "injuryCount": 3,
  "hazards": ["Scalding Steam", "Structural Weakness"],
  "requiredCapabilities": ["BURN_CARE", "THERMAL_SUPPRESSION"]
}
```
- **Response `201 Created`:** Returns created incident object.

### `PATCH /api/incidents/[id]`
Update status or notes of an incident.
- **Request Body:** `{ "status": "RESOLVED", "notes": "Scene secured by NDRF team" }`
- **Response `200 OK`**

---

## 2. Dispatch Engine API

### `POST /api/dispatch/recommend`
Execute capability matching algorithm and generate ranked recommendations.
- **Request Body:** `{ "incidentId": "clz..." }`
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "rec-1",
      "resourceId": "res-boat-1",
      "score": 0.94,
      "etaMinutes": 8,
      "distanceKm": 4.2,
      "reasons": "[\"Equipped with WATER_RESCUE\",\"Fastest ETA (8m)\"]",
      "resource": {
        "name": "NDRF Boat Alpha",
        "type": "BOAT",
        "status": "AVAILABLE"
      }
    }
  ]
}
```

### `POST /api/dispatch/approve`
Approve, reject, or manually override a resource dispatch.
- **Request Body (Approve):**
```json
{
  "incidentId": "clz...",
  "resourceId": "res-1",
  "recommendationId": "rec-1",
  "action": "APPROVE",
  "approvedBy": "demo-commander"
}
```
- **Request Body (Reject):**
```json
{
  "incidentId": "clz...",
  "recommendationId": "rec-1",
  "action": "REJECT",
  "rejectionReason": "Unit reserved for hazmat sector",
  "approvedBy": "demo-commander"
}
```

---

## 3. Hospital & Shelter APIs

- `GET /api/hospitals` — Returns hospital network with bed surge telemetry.
- `PATCH /api/hospitals` — Update live available general/ICU beds.
- `GET /api/shelters` — Returns evacuation shelters with supply metrics.
- `PATCH /api/shelters` — Update shelter occupancy, food, and water logs.

---

## 4. AI & Simulation APIs

- `POST /api/ai/analyze` — Fast AI triage (`EXTRACT_REPORT`, `GENERATE_SUMMARY`, `DETECT_DUPLICATES`).
- `GET /api/simulation` — Retrieve isolated disaster scenarios.
- `POST /api/simulation` — Advance simulation step (`action: "STEP"`).
- `GET /api/audit` — Immutable compliance audit log.

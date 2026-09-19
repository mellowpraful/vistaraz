# CrisisOS — Intelligent Emergency Response & Resource Coordination Platform

CrisisOS is an enterprise-grade Emergency Operations Center (EOC) platform designed for multi-agency disaster coordination, AI-assisted triage, explainable capability-based resource dispatch, and real-time situational awareness.

---

## 🌟 Key Capabilities & Features

### 1. 🚨 Incident Intake & Multi-Agency Queue (`/incidents`, `/incidents/[id]`)
- Real-time ingestion of 911 calls, citizen reports, IoT sensors, and field team transmissions.
- Severity triage (Critical, High, Medium, Low) with automated SLA countdown timers.
- Interactive status workflow: `REPORTED` → `VERIFIED` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`.
- Dynamic event timeline with audit logging for situational reports (SITREPs).

### 2. ⚡ AI Capability Matching & Dispatch Engine (`/dispatch`)
- **Capability-first matching:** Filters resources by capability requirements (e.g., Water Rescue, Hazmat Level A, ALS Life Support).
- **Proximity & Workload Scoring:** Computes travel ETA, geographic distance, current unit workload, and reliability history.
- **Explainable AI Justification:** Shows transparent scoring breakdowns and reasons for commander review.
- **Human-in-the-Loop Governance:** Fast 1-click approvals, structured rejection capture, and commander manual overrides.

### 3. 🗺️ Live Geospatial Situation Room (`/map`)
- Interactive Leaflet-powered GIS command map with high-contrast dark cartography.
- Multi-layer toggle system: Incidents, Fleet Units, Hospital Trauma Centers, Evacuation Shelters, and Active Hazard Danger Zones.
- Slide-over inspector panel for instant telemetry inspection and 1-click dispatch.

### 4. 🎙️ VoiceDispatch 911 Console (`/voicedispatch`)
- Real-time audio waveform frequency visualizer with streaming telecom intake simulation.
- Multilingual speech-to-text processing supporting English, Hindi, and Gujarati emergency calls.
- Real-time AI entity extraction: parses incident category, coordinates, trapped victims, and hazards automatically.

### 5. 🤖 AI Commander & Tactical Copilot (`/ai-commander`)
- Automated multi-agency executive SITREP generation from live database telemetry.
- 4-Hour cascade escalation & casualty risk forecasting.
- Incident deduplication and report clustering engine.
- Interactive tactical chat assistant for rapid queries and asset locating.

### 6. 🌐 Digital Twin & Disaster Simulation Sandbox (`/simulation`)
- Completely isolated what-if disaster sandbox (runs without touching live operations).
- Scenarios: Monsoon Flash Floods, Chemical Tanker Ruptures, Structural Collapses.
- Interactive playback controls (1x, 2x, 5x speed) with cascade infrastructure bottleneck analysis.

### 7. 🏥 Hospital Surge & Shelter Logistics (`/hospitals`)
- Real-time monitoring of ICU beds, burn units, blood reserves, and oxygen security.
- Automatic diversion alerts when hospital occupancy exceeds 85%.
- Evacuation shelter occupancy tracking with food and potable water supply metrics.

### 8. 📈 Analytics & Immutable Compliance Audit (`/analytics`, `/audit`)
- Response SLA benchmarks, peak inflow heatmaps, and agency performance indices.
- Immutable, tamper-evident compliance audit trail with JSON snapshot viewer and export capability.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack, React 19) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 + Dark EOC Design System |
| **Database** | SQLite (zero-config dev) / PostgreSQL-compatible via Prisma ORM |
| **Maps** | Leaflet + React-Leaflet with CARTO Dark Matter Tiles |
| **AI Layer** | Modally abstracted AI pipeline (local heuristic + LLM pluggable) |
| **Audit & Governance** | Immutable event-sourced audit logging with JSON diffs |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v20+ or v24+
- npm v10+

### Setup & Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Push database schema to SQLite
npx prisma db push

# 3. Seed synthetic emergency demo data
npx tsx prisma/seed.ts

# 4. Start local development server
npm run dev
```

Visit `http://localhost:3000` to launch the CrisisOS Command Center.

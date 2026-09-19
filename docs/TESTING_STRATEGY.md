# CrisisOS — Testing Strategy & Quality Assurance Plan

This document outlines the testing methodologies, automated test suites, and manual verification scripts used to validate CrisisOS.

---

## 1. Automated Testing Architecture

CrisisOS implements a multi-tier test pyramid:

1. **Algorithm & Unit Tests (`tests/run-tests.ts`):** Validates capability matching equations, Haversine proximity calculations, Zod validation schemas, and AI entity extractors. Run with:
   ```bash
   npm test
   ```
2. **Production Build Validation:** Strict TypeScript type checking and Next.js static asset compilation:
   ```bash
   npm run build
   ```
3. **API Integration Tests:** Automated HTTP route verification across all 12 API route handlers.

---

## 2. End-to-End Manual Demo Script

1. **Step 1: Access Platform** (`/`) $\to$ Select "Enter as Incident Commander".
2. **Step 2: VoiceDispatch Triage** (`/voicedispatch`) $\to$ Choose "Sabarmati Flash Flood" scenario, observe live audio wave and real-time AI entity extraction, then click "Authorize & Match Responders".
3. **Step 3: Dispatch Studio** (`/dispatch`) $\to$ Review ranked candidate units with capability score breakdowns, then click "Approve & Dispatch".
4. **Step 4: Geospatial Room** (`/map`) $\to$ Toggle layers (Fleet, Hospitals, Danger Zones) and inspect units on the map.
5. **Step 5: Digital Twin Sandbox** (`/simulation`) $\to$ Advance simulation time steps to observe secondary cascade failure forecasts.
6. **Step 6: Compliance Audit** (`/audit`) $\to$ Verify that all dispatch actions and approvals are logged in the immutable audit feed.

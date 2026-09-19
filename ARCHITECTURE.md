# CrisisOS — Technical Architecture & System Design

This document details the architectural principles, component structure, data flows, and security model of the **CrisisOS** Emergency Response & Resource Coordination Platform.

---

## 1. Architectural Philosophy

CrisisOS is designed around four core tenets:
1. **Zero-Latency Telemetry & Triage:** Emergency responders require immediate access to critical facts without navigation friction.
2. **Capability-First Resource Allocation:** Units are matched primarily on functional capability (e.g. Hazmat Level A, Water Rescue Boat) rather than arbitrary proximity alone.
3. **Explainable Human-in-the-Loop AI:** AI models recommend and summarize, but human incident commanders retain final dispatch authorization.
4. **Sandboxed Simulation Isolation:** Digital twin disaster modeling runs on dedicated schemas and never impacts active emergency operations.

---

## 2. System Architecture Diagram

```
+-------------------------------------------------------------------------+
|                              CrisisOS Client                             |
|  (Next.js 16 App Router / React 19 / Tailwind CSS v4 / Leaflet GIS Maps)  |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                         Next.js Route Handlers                          |
|  +--------------------+  +--------------------+  +--------------------+ |
|  | /api/incidents     |  | /api/dispatch/*    |  | /api/ai/analyze    | |
|  +--------------------+  +--------------------+  +--------------------+ |
|  | /api/resources     |  | /api/hospitals     |  | /api/simulation    | |
|  +--------------------+  +--------------------+  +--------------------+ |
|  | /api/audit         |  | /api/shelters      |  | /api/dashboard     | |
|  +--------------------+  +--------------------+  +--------------------+ |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                           Core Business Logic                           |
|  +---------------------------+  +-------------------------------------+ |
|  | Capability Match Engine   |  | Multi-Objective Ranking Algorithm   | |
|  +---------------------------+  +-------------------------------------+ |
|  | AI Analysis Abstraction   |  | Immutable Audit Logging Pipeline    | |
|  +---------------------------+  +-------------------------------------+ |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                               Prisma ORM                                |
|  (SQLite for Local Dev | PostgreSQL / Supabase for Multi-Zone Prod)     |
+-------------------------------------------------------------------------+
```

---

## 3. Dispatch Recommendation Algorithm

The CrisisOS Capability Matcher (`src/lib/dispatch/capability-matcher.ts`) executes a two-phase allocation pipeline:

### Phase 1: Hard Constraint Filtering
- Filter available resources by capability requirements (e.g., `WATER_RESCUE`, `HAZMAT_CONTAINMENT`, `ALS_PARAMEDIC`).
- Filter out units marked `OUT_OF_SERVICE` or exceeding maximum concurrent mission thresholds.

### Phase 2: Multi-Factor Weighted Scoring
For every compliant candidate resource $R$, the composite score $S(R)$ is computed as:

$$S(R) = w_c \cdot C(R) + w_p \cdot P(R) + w_w \cdot (1 - W(R)) + w_r \cdot R_{rel}(R)$$

Where:
- $C(R)$: Capability match coverage ratio ($0.0 \dots 1.0$)
- $P(R)$: Proximity score normalized by travel distance and ETA
- $W(R)$: Current unit workload ($0.0 \dots 1.0$)
- $R_{rel}(R)$: Unit historical reliability rating ($0.0 \dots 1.0$)
- Default weights: $w_c = 0.40, w_p = 0.30, w_w = 0.15, w_r = 0.15$

---

## 4. Security & Audit Trail Governance

- Every dispatch approval, rejection, manual override, status change, and event addition is synchronously written to the `AuditLog` table.
- Rejections require structured rationale capture for compliance and model feedback.
- Manual overrides record the commander's identity and tactical justification.

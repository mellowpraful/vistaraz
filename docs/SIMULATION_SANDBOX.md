# CrisisOS — Digital Twin & Disaster Simulation Sandbox

This document details the architecture, isolation guarantees, and cascade failure modeling within the CrisisOS Digital Twin Simulator (`/simulation`).

---

## 1. Isolation Architecture

To ensure zero risk to real-world emergency operations, the simulation sandbox is completely decoupled from live operational tables:

| Layer | Live Operations | Digital Twin Sandbox |
|---|---|---|
| **Incident Records** | `Incident` (`simulationId == null`) | `Incident` (`simulationId != null`) |
| **Simulation State** | None | `SimulationScenario`, `SimulationEvent` |
| **Fleet Tracking** | Live GPS & radio status | Isolated simulated units |
| **Audit Logs** | Real dispatch actions | Simulation execution logs |

---

## 2. Cascade Failure Modeling

The simulator advances in discrete time steps (e.g., Hour +01:00, +02:00, +03:00) and calculates multi-tier secondary effects:

1. **Weather Escalation:** Cloudburst rainfall intensity $\to$ river overflow rate.
2. **Infrastructure Failure:** Underpass flooding $\to$ arterial road closures $\to$ ambulance rerouting delay (+14 mins).
3. **Utility Cascade:** Power substation water damage $\to$ Hospital generator activation $\to$ fuel reserve countdown.
4. **Hospital Bed Saturation:** Cumulative casualty inflow vs. active discharge rate $\to$ ICU saturation alarm (>90%).

---

## 3. Scenario Authoring

New scenarios can be authored via `/api/simulation` with JSON configuration defining initial event triggers, geographical hazard polygons, and cascade probability curves.

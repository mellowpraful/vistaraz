# CrisisOS — Dispatch Algorithm & Explainability Rules

This document details the mathematical models, capability filtering constraints, and scoring matrices that govern the CrisisOS automated resource allocation engine.

---

## 1. Capability Matching Principle

Traditional CAD (Computer-Aided Dispatch) platforms often dispatch the physically nearest unit regardless of equipment compatibility. CrisisOS enforces a **strict capability-first principle**:

> **Rule 1:** No resource can be recommended for an incident unless it possesses the mandatory specialized capabilities required by the scene hazards (e.g. Inflatable Boats for flood zones, Level A Chemical suits for toxic gas leaks).

---

## 2. Multi-Objective Scoring Equation

When multiple candidate resources meet the capability criteria, they are ranked using the composite score $S(R)$:

$$S(R) = 100 - P_{\text{missing}} - P_{\text{eta}} - P_{\text{dist}} + B_{\text{rel}} - P_{\text{workload}} + B_{\text{status}} + B_{\text{urgency}}$$

### Penalty and Bonus Parameters:
1. **Missing Capability Penalty ($P_{\text{missing}}$):** $-20$ points per missing non-mandatory capability.
2. **ETA Penalty ($P_{\text{eta}}$):** $\min(\text{ETA} \times 0.5, 40)$ points.
3. **Distance Penalty ($P_{\text{dist}}$):** $\min(\text{Distance (km)} \times 0.3, 20)$ points.
4. **Reliability Bonus ($B_{\text{rel}}$):** $\text{Reliability Score} \times 10$ points.
5. **Workload Penalty ($P_{\text{workload}}$):** $\text{Current Workload (\%)} \times 0.1$ points.
6. **Readiness Status Bonus ($B_{\text{status}}$):** $+10$ points if `AVAILABLE`, $+5$ points if `STANDBY`.
7. **Severity Urgency Bonus ($B_{\text{urgency}}$):** For `CRITICAL` incidents, bonus of $\max(0, 20 - \text{ETA})$ points.

---

## 3. Explainability Justifications

For every recommendation, the engine compiles human-readable justification badges:
- `✓ Equipped with required capabilities: WATER_RESCUE, EVACUATION`
- `✓ Fast ETA: ~8 minutes`
- `✓ Located 4.2 km from incident site`
- `✓ High historical mission reliability: 95%`
- `✓ Low current workload — full crew readiness`

---

## 4. Human-in-the-Loop Governance

- **1-Click Approvals:** Transitions resource to `DISPATCHED` and assigns mission ID.
- **Rejection Auditing:** Rejections require a mandatory reason, recorded for compliance and model retraining.
- **Commander Manual Override:** Commanders can bypass AI rankings with mandatory justification logged to the tamper-evident audit trail.

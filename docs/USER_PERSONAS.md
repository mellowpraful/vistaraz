# CrisisOS — User Personas & Journey Maps

This document defines the primary operator personas, workflows, and user journey maps supported in CrisisOS.

---

## 1. Persona 1: Incident Commander (Major Rajiv Sharma, NDRF / EOC Lead)
- **Primary Goals:** High-level situational awareness, strategic resource allocation, multi-agency mutual aid coordination, and executive SITREP reporting.
- **Key Screens:** `/dashboard`, `/ai-commander`, `/simulation`, `/map`.
- **Key Actions:** Reviews AI situation summaries, authorizes multi-agency dispatches, evaluates 4-hour cascade risk forecasts, and stress-tests contingency plans.

---

## 2. Persona 2: 911 / Emergency Dispatcher (Priya Patel, City Command Center)
- **Primary Goals:** Rapid triage of incoming emergency calls, accurate entity extraction, and fastest viable responder dispatch.
- **Key Screens:** `/voicedispatch`, `/incidents`, `/dispatch`.
- **Key Actions:** Listens to incoming caller audio streams, verifies AI-extracted incident details, reviews capability-matched units, and executes 1-click dispatch approvals.

---

## 3. Persona 3: Logistics & Hospital Coordinator (Dr. Amit Verma, Health Authority)
- **Primary Goals:** Balancing casualty inflows against hospital ICU bed surge limits and ensuring shelter supply reserves.
- **Key Screens:** `/hospitals`, `/map`.
- **Key Actions:** Adjusts available bed numbers in real time, issues hospital divert warnings, and monitors shelter food/water days remaining.

---

## 4. Persona 4: Field Unit Leader (Inspector Vikram Rathod, Fire Rescue Unit 04)
- **Primary Goals:** Receiving mission details, updating unit readiness status, and reporting on-scene hazards.
- **Key Screens:** `/resources`, `/incidents/[id]`.
- **Key Actions:** Acknowledges mission dispatches, logs arrival on scene, and posts situation notes to the incident timeline.

# CrisisOS — Security, RBAC & Compliance Architecture

This document details the security model, role-based access control (RBAC), and immutable audit logging mechanisms implemented in CrisisOS.

---

## 1. Role-Based Access Control (RBAC) Matrix

CrisisOS supports granular role permissions across multi-agency personnel:

| Role | View Incidents | Create Incidents | Approve AI Dispatch | Manual Override | Manage Fleet | Run Simulation | View Audit Logs |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **COMMANDER** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **DISPATCHER** | ✅ | ✅ | ✅ | ⚠️ Reason Req | ✅ | ❌ | ❌ |
| **OPERATOR** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **FIELD** | ✅ Assigned | ❌ | ❌ | ❌ | ✅ Status Only | ❌ | ❌ |
| **VIEWER** | ✅ Read-only | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 2. Immutable Audit Trail Design

- Every state change (incident creation, status update, dispatch recommendation approval/rejection, manual override) produces an immutable record in the `AuditLog` table.
- Records capture: `actorId`, `actorRole`, `action`, `entity`, `entityId`, `timestamp`, and full `JSON` snapshot payload.
- Export functionality allows compliance officers to download complete audit logs for regulatory post-incident inquiries.

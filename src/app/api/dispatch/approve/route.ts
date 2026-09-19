import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApproveDispatchSchema } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ApproveDispatchSchema.parse(body);

    const operatorId = validated.userId || validated.approvedBy || "demo-operator";
    const operatorNotes = (validated.notes || validated.rejectionReason || "").trim();

    // ── Path 1: Approval / Rejection of an Existing Recommendation ────────
    if (validated.recommendationId) {
      const recommendation = await prisma.dispatchRecommendation.findUnique({
        where: { id: validated.recommendationId },
        include: {
          resource: true,
          incident: true,
        },
      });

      if (!recommendation) {
        return NextResponse.json(
          { success: false, error: "Recommendation not found" },
          { status: 404 }
        );
      }

      if (recommendation.status !== "PENDING") {
        return NextResponse.json(
          {
            success: false,
            error: `Recommendation is already ${recommendation.status.toLowerCase()} and cannot be modified`,
          },
          { status: 400 }
        );
      }

      // Rejection validation: Reason is mandatory
      if (validated.action === "REJECTED" && !operatorNotes) {
        return NextResponse.json(
          {
            success: false,
            error: "A mandatory rejection rationale must be provided to reject an AI recommendation",
          },
          { status: 400 }
        );
      }

      // Record approval/rejection audit record
      const approval = await prisma.dispatchApproval.create({
        data: {
          recommendationId: validated.recommendationId,
          userId: operatorId,
          action: validated.action,
          notes: operatorNotes || null,
        },
      });

      // Update recommendation status
      await prisma.dispatchRecommendation.update({
        where: { id: validated.recommendationId },
        data: {
          status: validated.action === "APPROVED" ? "APPROVED" : "REJECTED",
        },
      });

      if (validated.action === "APPROVED") {
        // Consequential Action: Update resource status to DISPATCHED
        await prisma.resource.update({
          where: { id: recommendation.resourceId },
          data: { status: "DISPATCHED" },
        });

        // Create assignment
        await prisma.resourceAssignment.create({
          data: {
            resourceId: recommendation.resourceId,
            incidentId: recommendation.incidentId,
            status: "EN_ROUTE",
            notes: operatorNotes || "Standard AI recommendation approved",
          },
        });

        // Update incident status if still REPORTED/VERIFIED
        if (["REPORTED", "VERIFIED"].includes(recommendation.incident.status)) {
          await prisma.incident.update({
            where: { id: recommendation.incidentId },
            data: { status: "ASSIGNED" },
          });
        }

        // Timeline event
        await prisma.incidentEvent.create({
          data: {
            incidentId: recommendation.incidentId,
            type: "DISPATCH",
            description: `${recommendation.resource.name} authorized and dispatched — ETA ${recommendation.etaMinutes ?? "?"} minutes`,
            userId: operatorId,
            metadata: JSON.stringify({
              resourceId: recommendation.resourceId,
              recommendationId: recommendation.id,
              etaMinutes: recommendation.etaMinutes,
              approvedBy: operatorId,
            }),
          },
        });

        // Audit log
        await prisma.auditLog.create({
          data: {
            userId: operatorId,
            action: "DISPATCH_APPROVED",
            entity: "DispatchRecommendation",
            entityId: recommendation.id,
            before: JSON.stringify({ status: "PENDING" }),
            after: JSON.stringify({
              status: "APPROVED",
              resourceId: recommendation.resourceId,
              resourceName: recommendation.resource.name,
              incidentId: recommendation.incidentId,
            }),
            metadata: operatorNotes ? JSON.stringify({ notes: operatorNotes }) : null,
          },
        });
      } else if (validated.action === "REJECTED") {
        // Timeline event
        await prisma.incidentEvent.create({
          data: {
            incidentId: recommendation.incidentId,
            type: "DISPATCH_REJECTED",
            description: `Dispatch recommendation for ${recommendation.resource.name} rejected — Rationale: ${operatorNotes}`,
            userId: operatorId,
          },
        });

        // Audit log
        await prisma.auditLog.create({
          data: {
            userId: operatorId,
            action: "DISPATCH_REJECTED",
            entity: "DispatchRecommendation",
            entityId: recommendation.id,
            before: JSON.stringify({ status: "PENDING" }),
            after: JSON.stringify({ status: "REJECTED", rejectionReason: operatorNotes }),
            metadata: JSON.stringify({ notes: operatorNotes }),
          },
        });
      }

      return NextResponse.json({
        success: true,
        approval,
        action: validated.action,
        resourceName: recommendation.resource.name,
        incidentTitle: recommendation.incident.title,
      });
    }

    // ── Path 2: Commander Manual Override / Direct Allocation ─────────────
    if (validated.incidentId && validated.resourceId) {
      if (!operatorNotes) {
        return NextResponse.json(
          {
            success: false,
            error: "A mandatory justification rationale is required for Commander manual overrides",
          },
          { status: 400 }
        );
      }

      const [incident, resource] = await Promise.all([
        prisma.incident.findUnique({ where: { id: validated.incidentId } }),
        prisma.resource.findUnique({ where: { id: validated.resourceId } }),
      ]);

      if (!incident) {
        return NextResponse.json({ success: false, error: "Target incident not found" }, { status: 404 });
      }

      if (!resource) {
        return NextResponse.json({ success: false, error: "Target resource not found" }, { status: 404 });
      }

      // Create synthetic approved recommendation record for auditability
      const rec = await prisma.dispatchRecommendation.create({
        data: {
          incidentId: incident.id,
          resourceId: resource.id,
          rank: 1,
          score: 100,
          reasons: JSON.stringify(["Commander Manual Tactical Override Authorized"]),
          constraints: JSON.stringify({ isCommanderOverride: true, justification: operatorNotes }),
          status: "APPROVED",
        },
      });

      const approval = await prisma.dispatchApproval.create({
        data: {
          recommendationId: rec.id,
          userId: operatorId,
          action: "MODIFIED",
          notes: operatorNotes,
        },
      });

      // Consequential Action: Dispatch resource
      await prisma.resource.update({
        where: { id: resource.id },
        data: { status: "DISPATCHED" },
      });

      // Create assignment
      await prisma.resourceAssignment.create({
        data: {
          resourceId: resource.id,
          incidentId: incident.id,
          status: "EN_ROUTE",
          notes: `Commander Manual Override: ${operatorNotes}`,
        },
      });

      // Update incident status
      if (["REPORTED", "VERIFIED"].includes(incident.status)) {
        await prisma.incident.update({
          where: { id: incident.id },
          data: { status: "ASSIGNED" },
        });
      }

      // Timeline event
      await prisma.incidentEvent.create({
        data: {
          incidentId: incident.id,
          type: "COMMANDER_OVERRIDE_DISPATCH",
          description: `Commander Manual Override: ${resource.name} dispatched directly — Rationale: ${operatorNotes}`,
          userId: operatorId,
          metadata: JSON.stringify({
            resourceId: resource.id,
            justification: operatorNotes,
          }),
        },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          userId: operatorId,
          action: "COMMANDER_DISPATCH_OVERRIDE",
          entity: "ResourceAssignment",
          entityId: resource.id,
          after: JSON.stringify({
            resourceId: resource.id,
            resourceName: resource.name,
            incidentId: incident.id,
            incidentTitle: incident.title,
            justification: operatorNotes,
          }),
          metadata: JSON.stringify({ overrideBy: operatorId }),
        },
      });

      return NextResponse.json({
        success: true,
        approval,
        action: "MODIFIED",
        isOverride: true,
        resourceName: resource.name,
        incidentTitle: incident.title,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Either recommendationId OR (incidentId and resourceId) must be provided",
      },
      { status: 400 }
    );
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("POST /api/dispatch/approve error:", error);
    return NextResponse.json({ success: false, error: "Failed to process dispatch action" }, { status: 500 });
  }
}


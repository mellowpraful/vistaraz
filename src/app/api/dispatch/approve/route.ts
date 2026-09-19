import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApproveDispatchSchema } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ApproveDispatchSchema.parse(body);

    const recommendation = await prisma.dispatchRecommendation.findUnique({
      where: { id: validated.recommendationId },
      include: {
        resource: true,
        incident: true,
      },
    });

    if (!recommendation) {
      return NextResponse.json({ error: "Recommendation not found" }, { status: 404 });
    }

    if (recommendation.status !== "PENDING") {
      return NextResponse.json(
        { error: `Recommendation already ${recommendation.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Record approval/rejection
    const approval = await prisma.dispatchApproval.create({
      data: {
        recommendationId: validated.recommendationId,
        userId: validated.userId,
        action: validated.action,
        notes: validated.notes,
      },
    });

    // Update recommendation status
    await prisma.dispatchRecommendation.update({
      where: { id: validated.recommendationId },
      data: {
        status: validated.action === "APPROVED" ? "APPROVED" :
                validated.action === "REJECTED" ? "REJECTED" : "PENDING",
      },
    });

    if (validated.action === "APPROVED") {
      // Update resource status to DISPATCHED
      await prisma.resource.update({
        where: { id: recommendation.resourceId },
        data: { status: "DISPATCHED" },
      });

      // Create or update assignment
      await prisma.resourceAssignment.create({
        data: {
          resourceId: recommendation.resourceId,
          incidentId: recommendation.incidentId,
          status: "EN_ROUTE",
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
          description: `${recommendation.resource.name} dispatched to incident — ETA ${recommendation.etaMinutes ?? "?"} minutes`,
          userId: validated.userId,
          metadata: JSON.stringify({
            resourceId: recommendation.resourceId,
            recommendationId: recommendation.id,
            etaMinutes: recommendation.etaMinutes,
          }),
        },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          userId: validated.userId,
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
          metadata: validated.notes ? JSON.stringify({ notes: validated.notes }) : null,
        },
      });
    } else if (validated.action === "REJECTED") {
      await prisma.incidentEvent.create({
        data: {
          incidentId: recommendation.incidentId,
          type: "DISPATCH_REJECTED",
          description: `Dispatch of ${recommendation.resource.name} rejected${validated.notes ? ` — ${validated.notes}` : ""}`,
          userId: validated.userId,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: validated.userId,
          action: "DISPATCH_REJECTED",
          entity: "DispatchRecommendation",
          entityId: recommendation.id,
          before: JSON.stringify({ status: "PENDING" }),
          after: JSON.stringify({ status: "REJECTED" }),
          metadata: validated.notes ? JSON.stringify({ notes: validated.notes }) : null,
        },
      });
    }

    return NextResponse.json({
      approval,
      action: validated.action,
      resourceName: recommendation.resource.name,
      incidentTitle: recommendation.incident.title,
    });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("POST /api/dispatch/approve error:", error);
    return NextResponse.json({ error: "Failed to process dispatch approval" }, { status: 500 });
  }
}

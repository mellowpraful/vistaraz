import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdateIncidentStatusSchema, STATUS_TRANSITIONS } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        reports: { orderBy: { createdAt: "desc" } },
        events: { orderBy: { createdAt: "asc" } },
        assignments: {
          include: { resource: { include: { capabilities: true, agency: true } } },
        },
        recommendations: {
          include: {
            resource: { include: { capabilities: true, agency: true } },
            approvals: { include: { user: true } },
          },
          orderBy: { rank: "asc" },
        },
        duplicateOf: true,
        duplicates: { take: 5 },
      },
    });

    if (!incident) {
      return NextResponse.json({ success: false, error: "Incident not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: incident, incident });
  } catch (error) {
    console.error("GET /api/incidents/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch incident" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();

    const incident = await prisma.incident.findUnique({ where: { id } });
    if (!incident) {
      return NextResponse.json({ success: false, error: "Incident not found" }, { status: 404 });
    }

    // Status update
    if (body.status) {
      const validated = UpdateIncidentStatusSchema.parse(body);
      const allowedTransitions = STATUS_TRANSITIONS[incident.status] ?? [];

      if (!allowedTransitions.includes(validated.status)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid status transition from ${incident.status} to ${validated.status}`,
            allowed: allowedTransitions,
          },
          { status: 400 }
        );
      }

      const updated = await prisma.incident.update({
        where: { id },
        data: { status: validated.status },
        include: {
          events: { orderBy: { createdAt: "asc" } },
          assignments: { include: { resource: { include: { capabilities: true, agency: true } } } },
          recommendations: { include: { resource: { include: { agency: true } } } },
        },
      });

      // Event log
      await prisma.incidentEvent.create({
        data: {
          incidentId: id,
          type: "STATUS_CHANGE",
          description: `Status changed: ${incident.status} → ${validated.status}${validated.notes ? ` — ${validated.notes}` : ""}`,
          userId: "demo-operator",
        },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          userId: "demo-operator",
          action: "STATUS_CHANGED",
          entity: "Incident",
          entityId: id,
          before: JSON.stringify({ status: incident.status }),
          after: JSON.stringify({ status: validated.status }),
          metadata: validated.notes ? JSON.stringify({ notes: validated.notes }) : null,
        },
      });

      return NextResponse.json({ success: true, data: updated, incident: updated });
    }

    // General update
    const {
      title, description, severity, locationName,
      latitude, longitude, affectedCount, injuryCount,
      hazards, requiredCapabilities,
    } = body;

    const updated = await prisma.incident.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(severity && { severity }),
        ...(locationName !== undefined && { locationName }),
        ...(latitude !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude }),
        ...(affectedCount !== undefined && { affectedCount }),
        ...(injuryCount !== undefined && { injuryCount }),
        ...(hazards !== undefined && { hazards: JSON.stringify(hazards) }),
        ...(requiredCapabilities !== undefined && {
          requiredCapabilities: JSON.stringify(requiredCapabilities),
        }),
      },
      include: {
        events: { orderBy: { createdAt: "asc" } },
        assignments: { include: { resource: { include: { agency: true } } } },
        recommendations: { include: { resource: { include: { agency: true } } } },
      },
    });

    await prisma.incidentEvent.create({
      data: {
        incidentId: id,
        type: "UPDATED",
        description: "Incident details updated by operator",
        userId: "demo-operator",
      },
    });

    return NextResponse.json({ success: true, data: updated, incident: updated });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("PATCH /api/incidents/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to update incident" }, { status: 500 });
  }
}

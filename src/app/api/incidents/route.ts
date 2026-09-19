import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateIncidentSchema } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");
    const type = searchParams.get("type");
    const simulationId = searchParams.get("simulationId");
    const limit = parseInt(searchParams.get("limit") ?? "50");

    const incidents = await prisma.incident.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(severity ? { severity: severity as any } : {}),
        ...(type ? { type: type as any } : {}),
        simulationId: simulationId ?? null, // null = live, string = simulation
      },
      include: {
        events: { orderBy: { createdAt: "desc" }, take: 5 },
        assignments: { include: { resource: true } },
        recommendations: { where: { status: "PENDING" }, take: 3 },
      },
      orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
      take: limit,
    });

    return NextResponse.json({ incidents, total: incidents.length });
  } catch (error) {
    console.error("GET /api/incidents error:", error);
    return NextResponse.json({ error: "Failed to fetch incidents" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CreateIncidentSchema.parse(body);

    const incident = await prisma.incident.create({
      data: {
        title: validated.title,
        description: validated.description,
        type: validated.type,
        severity: validated.severity,
        status: "REPORTED",
        source: validated.source,
        locationName: validated.locationName,
        latitude: validated.latitude,
        longitude: validated.longitude,
        affectedCount: validated.affectedCount,
        injuryCount: validated.injuryCount,
        hazards: validated.hazards ? JSON.stringify(validated.hazards) : null,
        requiredCapabilities: validated.requiredCapabilities
          ? JSON.stringify(validated.requiredCapabilities)
          : null,
        language: validated.language ?? "en",
        originalReport: validated.originalReport,
        simulationId: null, // live data only
      },
    });

    // Create initial event
    await prisma.incidentEvent.create({
      data: {
        incidentId: incident.id,
        type: "CREATED",
        description: `Incident created via ${validated.source.replace("_", " ").toLowerCase()}`,
        userId: "demo-operator",
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: "demo-operator",
        action: "INCIDENT_CREATED",
        entity: "Incident",
        entityId: incident.id,
        after: JSON.stringify({ title: incident.title, severity: incident.severity }),
        metadata: JSON.stringify({ source: validated.source }),
      },
    });

    return NextResponse.json({ incident }, { status: 201 });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("POST /api/incidents error:", error);
    return NextResponse.json({ error: "Failed to create incident" }, { status: 500 });
  }
}

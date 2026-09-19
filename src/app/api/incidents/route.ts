import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateIncidentSchema } from "@/lib/types";
import { FALLBACK_INCIDENTS } from "@/lib/demo-data";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");
    const severityParam = searchParams.get("severity");
    const typeParam = searchParams.get("type");
    const simulationId = searchParams.get("simulationId");
    const limit = parseInt(searchParams.get("limit") ?? "50");

    let statusCondition: any = undefined;
    if (statusParam && statusParam !== "ALL") {
      const statuses = statusParam.split(",").map((s) => s.trim()).filter(Boolean);
      if (statuses.length > 1) {
        statusCondition = { in: statuses as any[] };
      } else if (statuses.length === 1) {
        statusCondition = statuses[0] as any;
      }
    }

    let severityCondition: any = undefined;
    if (severityParam && severityParam !== "ALL") {
      const severities = severityParam.split(",").map((s) => s.trim()).filter(Boolean);
      if (severities.length > 1) {
        severityCondition = { in: severities as any[] };
      } else if (severities.length === 1) {
        severityCondition = severities[0] as any;
      }
    }

    let typeCondition: any = undefined;
    if (typeParam && typeParam !== "ALL") {
      const types = typeParam.split(",").map((s) => s.trim()).filter(Boolean);
      if (types.length > 1) {
        typeCondition = { in: types as any[] };
      } else if (types.length === 1) {
        typeCondition = types[0] as any;
      }
    }

    const incidents = await prisma.incident.findMany({
      where: {
        ...(statusCondition ? { status: statusCondition } : {}),
        ...(severityCondition ? { severity: severityCondition } : {}),
        ...(typeCondition ? { type: typeCondition } : {}),
        simulationId: simulationId ?? null, // null = live data only
      },
      include: {
        events: { orderBy: { createdAt: "desc" }, take: 5 },
        assignments: { include: { resource: true } },
        recommendations: { where: { status: "PENDING" }, take: 3 },
      },
      orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: incidents,
      incidents,
      total: incidents.length,
    });
  } catch (error) {
    console.warn("Database unavailable in /api/incidents, serving synthetic incidents fallback:", error);
    try {
      const { searchParams } = new URL(req.url);
      const statusParam = searchParams.get("status");
      const severityParam = searchParams.get("severity");
      const typeParam = searchParams.get("type");
      const limit = parseInt(searchParams.get("limit") ?? "50", 10);

      let filtered = FALLBACK_INCIDENTS;

      if (statusParam && statusParam !== "ALL") {
        const statuses = statusParam.split(",").map((s) => s.trim()).filter(Boolean);
        if (statuses.length > 0) filtered = filtered.filter((i) => statuses.includes(i.status));
      }
      if (severityParam && severityParam !== "ALL") {
        const severities = severityParam.split(",").map((s) => s.trim()).filter(Boolean);
        if (severities.length > 0) filtered = filtered.filter((i) => severities.includes(i.severity));
      }
      if (typeParam && typeParam !== "ALL") {
        const types = typeParam.split(",").map((s) => s.trim()).filter(Boolean);
        if (types.length > 0) filtered = filtered.filter((i) => types.includes(i.type));
      }

      const sliced = filtered.slice(0, limit);

      return NextResponse.json({
        success: true,
        data: sliced,
        incidents: sliced,
        total: filtered.length,
        isFallback: true,
      });
    } catch {
      return NextResponse.json({
        success: true,
        data: FALLBACK_INCIDENTS,
        incidents: FALLBACK_INCIDENTS,
        total: FALLBACK_INCIDENTS.length,
        isFallback: true,
      });
    }
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
        simulationId: null, // live data
      },
      include: {
        events: true,
        assignments: { include: { resource: true } },
        recommendations: true,
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

    return NextResponse.json(
      { success: true, data: incident, incident },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("POST /api/incidents error:", error);
    return NextResponse.json({ success: false, error: "Failed to create incident" }, { status: 500 });
  }
}

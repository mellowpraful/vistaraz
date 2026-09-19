import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { matchResources } from "@/lib/dispatch/capability-matcher";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { incidentId } = body;

    if (!incidentId) {
      return NextResponse.json({ error: "incidentId is required" }, { status: 400 });
    }

    // Fetch incident
    const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    // Fetch all resources with capabilities
    const resources = await prisma.resource.findMany({
      include: { capabilities: true },
    });

    // Run the capability matcher
    const matches = matchResources(incident, resources);

    // Store recommendations in DB (replacing any existing PENDING ones)
    await prisma.dispatchRecommendation.updateMany({
      where: { incidentId, status: "PENDING" },
      data: { status: "SUPERSEDED" },
    });

    const recommendations = await Promise.all(
      matches.map(async (match) => {
        return prisma.dispatchRecommendation.create({
          data: {
            incidentId,
            resourceId: match.resource.id,
            rank: match.rank,
            score: match.score,
            etaMinutes: match.etaMinutes,
            distanceKm: match.distanceKm,
            matchedCapabilities: JSON.stringify(match.matchedCapabilities),
            missingCapabilities: JSON.stringify(match.missingCapabilities),
            reasons: JSON.stringify(match.reasons),
            constraints: match.constraints.length > 0
              ? JSON.stringify(match.constraints)
              : null,
            status: "PENDING",
          },
          include: {
            resource: { include: { capabilities: true } },
          },
        });
      })
    );

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: "demo-operator",
        action: "DISPATCH_RECOMMENDED",
        entity: "Incident",
        entityId: incidentId,
        after: JSON.stringify({
          recommendationCount: recommendations.length,
          topResourceId: recommendations[0]?.resourceId,
        }),
        metadata: JSON.stringify({ algorithm: "capability-matcher-v1" }),
      },
    });

    return NextResponse.json({
      recommendations,
      totalCandidates: resources.length,
      eligibleCandidates: matches.length,
      incident: { id: incident.id, title: incident.title, severity: incident.severity },
    });
  } catch (error) {
    console.error("POST /api/dispatch/recommend error:", error);
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}

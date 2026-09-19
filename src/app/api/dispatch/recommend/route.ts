import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { matchResources, auditResourceEligibility } from "@/lib/dispatch/capability-matcher";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { incidentId, strict = true } = body;

    if (!incidentId) {
      return NextResponse.json({ success: false, error: "incidentId is required" }, { status: 400 });
    }

    // Fetch incident
    const incident = await prisma.incident.findUnique({
      where: { id: incidentId },
      include: {
        assignments: {
          include: { resource: { select: { id: true, name: true, type: true } } },
        },
      },
    });

    if (!incident) {
      return NextResponse.json({ success: false, error: "Incident not found" }, { status: 404 });
    }

    // Fetch all resources with capabilities and agency
    const resources = await prisma.resource.findMany({
      include: {
        capabilities: true,
        agency: true,
      },
    });

    // Run capability matcher and eligibility audit
    const audit = auditResourceEligibility(incident, resources, { strict });
    const matches = audit.eligible.slice(0, 5);

    // Store recommendations in DB (replacing existing PENDING ones)
    await prisma.dispatchRecommendation.updateMany({
      where: { incidentId, status: "PENDING" },
      data: { status: "SUPERSEDED" },
    });

    const recommendations = await Promise.all(
      matches.map(async (match) => {
        const constraintsPayload = {
          constraints: match.constraints,
          scoreBreakdown: match.scoreBreakdown,
        };

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
            constraints: JSON.stringify(constraintsPayload),
            status: "PENDING",
          },
          include: {
            resource: {
              include: {
                capabilities: true,
                agency: true,
              },
            },
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
          topScore: recommendations[0]?.score,
        }),
        metadata: JSON.stringify({ algorithm: "capability-matcher-v2-explainable" }),
      },
    });

    return NextResponse.json({
      success: true,
      data: recommendations,
      recommendations,
      ineligible: audit.ineligible,
      totalCandidates: resources.length,
      eligibleCandidates: audit.eligible.length,
      incident: {
        id: incident.id,
        title: incident.title,
        severity: incident.severity,
        type: incident.type,
        locationName: incident.locationName,
        requiredCapabilities: incident.requiredCapabilities,
      },
    });
  } catch (error) {
    console.error("POST /api/dispatch/recommend error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate recommendations" }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeReport, detectDuplicates } from "@/lib/ai/mock-analyzer";
import { generateExecutiveSitrep, executeCopilotQuery } from "@/lib/ai/commander-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, text, query, language, incidentId, recommendationId, decision, notes, userId } = body;

    switch (action) {
      case "analyze_report": {
        if (!text) {
          return NextResponse.json({ success: false, error: "text is required" }, { status: 400 });
        }
        const extraction = await analyzeReport(text, language ?? "en");
        return NextResponse.json({ success: true, data: extraction, extraction, simulated: true });
      }

      case "situation_summary":
      case "GENERATE_SUMMARY": {
        const sitrep = await generateExecutiveSitrep();
        return NextResponse.json({
          success: true,
          data: sitrep,
          summary: sitrep.summary,
          sitrep,
          simulated: true,
        });
      }

      case "detect_duplicates":
      case "DETECT_DUPLICATES": {
        if (incidentId) {
          const target = await prisma.incident.findUnique({ where: { id: incidentId } });
          if (!target) {
            return NextResponse.json({ success: false, error: "Incident not found" }, { status: 404 });
          }

          const existing = await prisma.incident.findMany({
            where: { id: { not: incidentId }, simulationId: null },
            select: { id: true, title: true, locationName: true, type: true, latitude: true, longitude: true },
          });

          const result = await detectDuplicates(target, existing);
          return NextResponse.json({ success: true, data: result, ...result, simulated: true });
        }

        // Multi-incident clustering across all active live incidents
        const activeIncidents = await prisma.incident.findMany({
          where: { simulationId: null, status: { notIn: ["RESOLVED", "CLOSED"] } },
          select: { id: true, title: true, locationName: true, type: true, latitude: true, longitude: true, affectedCount: true, reports: true },
        });

        const clusters: Array<{
          id: string;
          clusterTitle: string;
          primaryIncidentId: string;
          correlatedIncidentIds: string[];
          type: string;
          confidence: number;
          proximityKm: number;
          summary: string;
          totalReports: number;
        }> = [];

        const visited = new Set<string>();

        for (let i = 0; i < activeIncidents.length; i++) {
          const incA = activeIncidents[i];
          if (visited.has(incA.id)) continue;

          const matched: string[] = [];
          let maxConf = 0;

          for (let j = i + 1; j < activeIncidents.length; j++) {
            const incB = activeIncidents[j];
            if (visited.has(incB.id)) continue;

            let conf = 0;
            if (incA.type === incB.type) conf += 0.35;

            if (incA.locationName && incB.locationName) {
              const wordsA = incA.locationName.toLowerCase().split(/\s+/);
              const wordsB = incB.locationName.toLowerCase().split(/\s+/);
              const overlap = wordsA.filter((w) => wordsB.includes(w) && w.length > 3).length;
              if (overlap >= 1) conf += 0.35;
            }

            if (incA.latitude && incA.longitude && incB.latitude && incB.longitude) {
              const dLat = Math.abs(incA.latitude - incB.latitude);
              const dLon = Math.abs(incA.longitude - incB.longitude);
              if (dLat < 0.03 && dLon < 0.03) conf += 0.3;
            }

            if (conf >= 0.6) {
              matched.push(incB.id);
              maxConf = Math.max(maxConf, conf);
              visited.add(incB.id);
            }
          }

          if (matched.length > 0) {
            visited.add(incA.id);
            clusters.push({
              id: `cluster-${incA.id}`,
              clusterTitle: `Cluster: ${incA.locationName || incA.title}`,
              primaryIncidentId: incA.id,
              correlatedIncidentIds: matched,
              type: incA.type,
              confidence: Math.round(maxConf * 100),
              proximityKm: 0.8,
              summary: `Correlated ${matched.length + 1} incidents with matching ${incA.type} profiles and geospatial proximity in ${incA.locationName || "sector"}. Merged casualty/affected assessment available.`,
              totalReports: matched.length + 1,
            });
          }
        }

        // If no automatic duplicate found in active set, provide demonstration clusters
        if (clusters.length === 0) {
          clusters.push({
            id: "cluster-demo-1",
            clusterTitle: "Cluster #1: Usmanpura Riverfront Flooding",
            primaryIncidentId: activeIncidents[0]?.id || "inc-01",
            correlatedIncidentIds: ["inc-report-02", "inc-report-03"],
            type: "FLOOD",
            confidence: 94,
            proximityKm: 0.4,
            summary: "Merged 3 citizen telecom calls from Usmanpura with 94% geospatial and temporal proximity. Combined affected estimate: 30 persons.",
            totalReports: 3,
          });
          clusters.push({
            id: "cluster-demo-2",
            clusterTitle: "Cluster #2: Vatva GIDC Chemical Flare",
            primaryIncidentId: activeIncidents[1]?.id || "inc-02",
            correlatedIncidentIds: ["inc-report-05"],
            type: "HAZMAT",
            confidence: 88,
            proximityKm: 0.6,
            summary: "Correlated 2 reports of toxic chlorine vapor within 400m radius of GIDC Phase IV gate. Confirmed single source event.",
            totalReports: 2,
          });
        }

        return NextResponse.json({
          success: true,
          data: { duplicates: clusters },
          duplicates: clusters,
          simulated: true,
        });
      }

      case "copilot_chat": {
        const queryText = query || text;
        if (!queryText) {
          return NextResponse.json({ success: false, error: "query text is required" }, { status: 400 });
        }
        const answer = await executeCopilotQuery(queryText);
        return NextResponse.json({ success: true, data: answer, ...answer, simulated: true });
      }

      case "DECIDE_RECOMMENDATION":
      case "APPROVE_RECOMMENDATION": {
        if (!recommendationId) {
          return NextResponse.json({ success: false, error: "recommendationId is required" }, { status: 400 });
        }

        const actionDecision = decision || "APPROVED";
        const operatorId = userId || "demo-commander";

        // Check if recommendation exists in DB
        const dbRec = await prisma.dispatchRecommendation.findUnique({
          where: { id: recommendationId },
          include: { resource: true, incident: true },
        });

        if (dbRec) {
          await prisma.dispatchRecommendation.update({
            where: { id: recommendationId },
            data: { status: actionDecision === "APPROVED" ? "APPROVED" : "REJECTED" },
          });

          if (actionDecision === "APPROVED") {
            await prisma.resource.update({
              where: { id: dbRec.resourceId },
              data: { status: "DISPATCHED" },
            });
            await prisma.resourceAssignment.create({
              data: {
                resourceId: dbRec.resourceId,
                incidentId: dbRec.incidentId,
                status: "EN_ROUTE",
                notes: notes || "Approved via AI Commander interface",
              },
            });
          }
        }

        // Register Audit Log
        await prisma.auditLog.create({
          data: {
            userId: operatorId,
            action: `AI_COMMANDER_${actionDecision}`,
            entity: "AIRecommendation",
            entityId: recommendationId,
            before: JSON.stringify({ status: "PENDING" }),
            after: JSON.stringify({ status: actionDecision, notes }),
            metadata: JSON.stringify({
              actionDecision,
              operatorRole: "COMMANDER",
              systemSource: "AI_COMMANDER_CONSOLE",
            }),
          },
        });

        return NextResponse.json({
          success: true,
          data: {
            recommendationId,
            status: actionDecision,
            operatorId,
            timestamp: new Date().toISOString(),
          },
          message: `Recommendation ${actionDecision.toLowerCase()} recorded in audit trail`,
        });
      }

      default:
        return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error("POST /api/ai/analyze error:", error);
    return NextResponse.json(
      { success: false, error: "AI analysis failed — using fallback", simulated: true },
      { status: 500 }
    );
  }
}

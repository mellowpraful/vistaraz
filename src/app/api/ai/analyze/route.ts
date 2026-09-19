import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeReport, generateSituationSummary, detectDuplicates } from "@/lib/ai/mock-analyzer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, text, language, incidentId } = body;

    switch (action) {
      case "analyze_report": {
        if (!text) {
          return NextResponse.json({ error: "text is required" }, { status: 400 });
        }
        const extraction = await analyzeReport(text, language ?? "en");
        return NextResponse.json({ extraction, simulated: true });
      }

      case "situation_summary": {
        const incidents = await prisma.incident.findMany({
          where: { simulationId: null },
          select: { title: true, severity: true, status: true, type: true },
          orderBy: { createdAt: "desc" },
          take: 20,
        });
        const summary = await generateSituationSummary(incidents);
        return NextResponse.json({ summary, simulated: true });
      }

      case "detect_duplicates": {
        if (!incidentId) {
          return NextResponse.json({ error: "incidentId is required" }, { status: 400 });
        }
        const target = await prisma.incident.findUnique({ where: { id: incidentId } });
        if (!target) return NextResponse.json({ error: "Incident not found" }, { status: 404 });

        const existing = await prisma.incident.findMany({
          where: { id: { not: incidentId }, simulationId: null },
          select: { id: true, title: true, locationName: true, type: true, latitude: true, longitude: true },
        });

        const result = await detectDuplicates(target, existing);
        return NextResponse.json({ ...result, simulated: true });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error("POST /api/ai/analyze error:", error);
    return NextResponse.json({ error: "AI analysis failed — using mock fallback", simulated: true }, { status: 500 });
  }
}

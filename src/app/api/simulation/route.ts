import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const scenario = await prisma.simulationScenario.findUnique({
        where: { id },
        include: {
          events: { orderBy: { timeOffset: "asc" } },
          incidents: true,
        },
      });
      return NextResponse.json({ success: true, data: scenario });
    }

    const scenarios = await prisma.simulationScenario.findMany({
      include: {
        events: { orderBy: { timeOffset: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: scenarios });
  } catch (error) {
    console.error("GET /api/simulation error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch simulations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, scenarioId, step, params } = body;

    if (action === "STEP") {
      const currentScenario = await prisma.simulationScenario.findUnique({
        where: { id: scenarioId },
        include: { events: { orderBy: { timeOffset: "asc" } } },
      });

      if (!currentScenario) {
        return NextResponse.json({ success: false, error: "Scenario not found" }, { status: 404 });
      }

      const nextStep = Number(step) || 1;
      const stepOffsetSeconds = nextStep * 3600;
      const events = currentScenario.events.filter((e: any) => e.timeOffset <= stepOffsetSeconds);

      const casualtyCount = events.reduce((acc: number, e: any) => {
        try {
          const p = JSON.parse(e.data || "{}");
          return acc + (Number(p.casualties) || 0);
        } catch {
          return acc;
        }
      }, 0);

      const affectedCount = events.reduce((acc: number, e: any) => {
        try {
          const p = JSON.parse(e.data || "{}");
          return acc + (Number(p.affected) || 0);
        } catch {
          return acc;
        }
      }, 0);

      const hospitalStrain = Math.min(100, Math.round((casualtyCount / 50) * 100));

      return NextResponse.json({
        success: true,
        data: {
          scenario: currentScenario,
          currentStep: nextStep,
          activeEvents: events,
          metrics: {
            step: nextStep,
            affectedCount: affectedCount || 150 + nextStep * 120,
            casualtyCount: casualtyCount || 12 + nextStep * 8,
            hospitalStrain: hospitalStrain || Math.min(100, 35 + nextStep * 15),
            roadsBlocked: events.filter((e: any) => e.type?.includes("ROAD") || e.type?.includes("INFRA")).length + 2,
            powerOutageZones: events.filter((e: any) => e.type?.includes("POWER") || e.type?.includes("GRID")).length + 1,
          },
        },
      });
    }

    if (action === "CREATE") {
      const { name, description, scenarioType } = body;
      const created = await prisma.simulationScenario.create({
        data: {
          name: name || "Custom Disaster Simulation",
          description: description || "Interactive multi-agency response simulation",
          type: scenarioType || "FLOOD",
          status: "DRAFT",
          config: JSON.stringify(params || {}),
        },
      });
      return NextResponse.json({ success: true, data: created });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/simulation error:", error);
    return NextResponse.json({ success: false, error: "Simulation action failed" }, { status: 500 });
  }
}

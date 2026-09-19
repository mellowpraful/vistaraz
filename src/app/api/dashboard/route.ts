import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FALLBACK_DASHBOARD_DATA } from "@/lib/demo-data";

export async function GET(_req: NextRequest) {
  try {
    const [incidents, resources, hospitals, shelters, recommendations, recentLogs] = await Promise.all([
      prisma.incident.groupBy({
        by: ["status"],
        where: { simulationId: null },
        _count: true,
      }),
      prisma.resource.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.hospital.findMany({
        select: { name: true, totalBeds: true, availableBeds: true, icuBeds: true, availableIcu: true, status: true },
      }),
      prisma.shelter.findMany({
        select: { name: true, capacity: true, occupied: true, status: true },
      }),
      prisma.dispatchRecommendation.count({ where: { status: "PENDING" } }),
      prisma.auditLog.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      }),
    ]);

    // Calculate metrics
    const incidentCounts: Record<string, number> = {};
    (incidents as any[]).forEach((g) => {
      if (g && g.status) {
        incidentCounts[g.status] = typeof g._count === "number" ? g._count : (g._count?._all ?? 1);
      }
    });

    const resourceCounts: Record<string, number> = {};
    (resources as any[]).forEach((g) => {
      if (g && g.status) {
        resourceCounts[g.status] = typeof g._count === "number" ? g._count : (g._count?._all ?? 1);
      }
    });

    const totalBeds = hospitals.reduce((s: number, h: any) => s + (h.totalBeds ?? 0), 0);
    const availableBeds = hospitals.reduce((s: number, h: any) => s + (h.availableBeds ?? 0), 0);
    const totalShelterCapacity = shelters.reduce((s: number, sh: any) => s + (sh.capacity ?? 0), 0);
    const shelterOccupied = shelters.reduce((s: number, sh: any) => s + (sh.occupied ?? 0), 0);

    const data = {
      incidents: {
        total: Object.values(incidentCounts).reduce((s: number, n: number) => s + n, 0),
        byStatus: incidentCounts,
        active: (incidentCounts.REPORTED ?? 0) + (incidentCounts.VERIFIED ?? 0) +
                (incidentCounts.ASSIGNED ?? 0) + (incidentCounts.IN_PROGRESS ?? 0),
      },
      resources: {
        total: Object.values(resourceCounts).reduce((s: number, n: number) => s + n, 0),
        byStatus: resourceCounts,
        available: resourceCounts.AVAILABLE ?? 0,
      },
      hospitals: {
        totalBeds,
        availableBeds,
        occupancyRate: totalBeds > 0 ? ((totalBeds - availableBeds) / totalBeds * 100).toFixed(1) : "0",
        details: hospitals,
      },
      shelters: {
        totalCapacity: totalShelterCapacity,
        occupied: shelterOccupied,
        occupancyRate: totalShelterCapacity > 0
          ? (shelterOccupied / totalShelterCapacity * 100).toFixed(1)
          : "0",
        details: shelters,
      },
      pendingDispatches: recommendations,
      recentActivity: recentLogs,
    };

    return NextResponse.json({
      success: true,
      data,
      ...data,
    });
<<<<<<< HEAD
  } catch (error: any) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch dashboard data" },
      { status: 500 }
    );
=======
  } catch (error) {
    console.warn("Database unavailable in /api/dashboard, serving synthetic operations fallback:", error);
    return NextResponse.json(FALLBACK_DASHBOARD_DATA);
>>>>>>> 82df473 (fix: add production database fallback handling)
  }
}

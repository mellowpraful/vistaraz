import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const incidentCounts = incidents.reduce<Record<string, number>>((acc, g) => {
      acc[g.status] = g._count;
      return acc;
    }, {});

    const resourceCounts = resources.reduce<Record<string, number>>((acc, g) => {
      acc[g.status] = g._count;
      return acc;
    }, {});

    const totalBeds = hospitals.reduce((s, h) => s + h.totalBeds, 0);
    const availableBeds = hospitals.reduce((s, h) => s + h.availableBeds, 0);
    const totalShelterCapacity = shelters.reduce((s, sh) => s + sh.capacity, 0);
    const shelterOccupied = shelters.reduce((s, sh) => s + sh.occupied, 0);

    return NextResponse.json({
      incidents: {
        total: Object.values(incidentCounts).reduce((s, n) => s + n, 0),
        byStatus: incidentCounts,
        active: (incidentCounts.REPORTED ?? 0) + (incidentCounts.VERIFIED ?? 0) +
                (incidentCounts.ASSIGNED ?? 0) + (incidentCounts.IN_PROGRESS ?? 0),
      },
      resources: {
        total: Object.values(resourceCounts).reduce((s, n) => s + n, 0),
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
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}

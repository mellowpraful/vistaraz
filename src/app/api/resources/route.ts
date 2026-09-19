import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const resources = await prisma.resource.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(type ? { type: type as any } : {}),
      },
      include: {
        capabilities: true,
        agency: true,
        assignments: {
          where: { status: { in: ["PENDING", "EN_ROUTE", "ON_SCENE"] } },
          include: { incident: { select: { id: true, title: true, severity: true } } },
        },
      },
      orderBy: [{ status: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({
      success: true,
      data: resources,
      resources,
      total: resources.length,
    });
  } catch (error) {
    console.error("GET /api/resources error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch resources" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, latitude, longitude, currentWorkload } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Resource ID required" }, { status: 400 });
    }

    const updated = await prisma.resource.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(latitude !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude }),
        ...(currentWorkload !== undefined && { currentWorkload }),
      },
      include: {
        capabilities: true,
        agency: true,
        assignments: { include: { incident: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated, resource: updated });
  } catch (error) {
    console.error("PATCH /api/resources error:", error);
    return NextResponse.json({ success: false, error: "Failed to update resource" }, { status: 500 });
  }
}

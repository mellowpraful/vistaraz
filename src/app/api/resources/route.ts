import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const agencyId = searchParams.get("agencyId") || searchParams.get("agency");
    const search = searchParams.get("search")?.trim();

    const resources = await prisma.resource.findMany({
      where: {
        ...(status && status !== "ALL" ? { status: status as any } : {}),
        ...(type && type !== "ALL" ? { type: type as any } : {}),
        ...(agencyId && agencyId !== "ALL" ? { agencyId } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { locationName: { contains: search } },
                { agency: { name: { contains: search } } },
              ],
            }
          : {}),
      },
      include: {
        capabilities: true,
        agency: true,
        assignments: {
          where: { status: { in: ["PENDING", "EN_ROUTE", "ON_SCENE"] } },
          include: {
            incident: {
              select: {
                id: true,
                title: true,
                severity: true,
                locationName: true,
                status: true,
              },
            },
          },
          orderBy: { assignedAt: "desc" },
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
    const {
      id,
      status,
      latitude,
      longitude,
      currentWorkload,
      locationName,
      reliabilityScore,
      notes,
      userId,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Resource ID required" }, { status: 400 });
    }

    const currentResource = await prisma.resource.findUnique({
      where: { id },
      include: { capabilities: true, agency: true, assignments: true },
    });

    if (!currentResource) {
      return NextResponse.json({ success: false, error: "Resource not found" }, { status: 404 });
    }

    const updated = await prisma.resource.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(latitude !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude }),
        ...(currentWorkload !== undefined && { currentWorkload }),
        ...(locationName !== undefined && { locationName }),
        ...(reliabilityScore !== undefined && { reliabilityScore }),
      },
      include: {
        capabilities: true,
        agency: true,
        assignments: {
          where: { status: { in: ["PENDING", "EN_ROUTE", "ON_SCENE"] } },
          include: {
            incident: {
              select: {
                id: true,
                title: true,
                severity: true,
                locationName: true,
                status: true,
              },
            },
          },
          orderBy: { assignedAt: "desc" },
        },
      },
    });

    // Record audit log if status changed
    if (status && status !== currentResource.status) {
      try {
        await prisma.auditLog.create({
          data: {
            userId: userId ?? "demo-operator",
            action: "RESOURCE_STATUS_CHANGED",
            entity: "Resource",
            entityId: id,
            before: JSON.stringify({
              status: currentResource.status,
              currentWorkload: currentResource.currentWorkload,
            }),
            after: JSON.stringify({
              status: updated.status,
              currentWorkload: updated.currentWorkload,
            }),
            metadata: notes ? JSON.stringify({ notes, resourceName: updated.name }) : JSON.stringify({ resourceName: updated.name }),
          },
        });
      } catch (logErr) {
        console.warn("Could not create audit log for resource update:", logErr);
      }
    }

    return NextResponse.json({ success: true, data: updated, resource: updated });
  } catch (error) {
    console.error("PATCH /api/resources error:", error);
    return NextResponse.json({ success: false, error: "Failed to update resource" }, { status: 500 });
  }
}


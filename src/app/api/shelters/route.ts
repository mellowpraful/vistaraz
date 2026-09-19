import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FALLBACK_SHELTERS } from "@/lib/demo-data";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const shelters = await prisma.shelter.findMany({
      where,
      include: {
        agency: {
          select: { name: true, type: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: shelters });
  } catch (error) {
    console.warn("Database unavailable in /api/shelters, serving synthetic shelters fallback:", error);
    return NextResponse.json({ success: true, data: FALLBACK_SHELTERS, isFallback: true });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, occupied, currentOccupancy, capacity, status, amenities } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Shelter ID required" }, { status: 400 });
    }

    const updated = await prisma.shelter.update({
      where: { id },
      data: {
        ...(occupied !== undefined && { occupied: Number(occupied) }),
        ...(currentOccupancy !== undefined && { occupied: Number(currentOccupancy) }),
        ...(capacity !== undefined && { capacity: Number(capacity) }),
        ...(status !== undefined && { status }),
        ...(amenities !== undefined && { amenities: typeof amenities === "string" ? amenities : JSON.stringify(amenities) }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/shelters error:", error);
    return NextResponse.json({ success: false, error: "Failed to update shelter" }, { status: 500 });
  }
}

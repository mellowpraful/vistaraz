import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agencyId = searchParams.get("agencyId");

    const where: Record<string, unknown> = {};
    if (agencyId) where.agencyId = agencyId;

    const hospitals = await prisma.hospital.findMany({
      where,
      include: {
        agency: {
          select: { name: true, type: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: hospitals });
  } catch (error) {
    console.error("GET /api/hospitals error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch hospitals" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, availableBeds, icuBedsAvailable, availableIcu, status } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Hospital ID required" }, { status: 400 });
    }

    const updated = await prisma.hospital.update({
      where: { id },
      data: {
        ...(availableBeds !== undefined && { availableBeds: Number(availableBeds) }),
        ...(icuBedsAvailable !== undefined && { availableIcu: Number(icuBedsAvailable) }),
        ...(availableIcu !== undefined && { availableIcu: Number(availableIcu) }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/hospitals error:", error);
    return NextResponse.json({ success: false, error: "Failed to update hospital" }, { status: 500 });
  }
}

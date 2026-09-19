import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const events = await prisma.incidentEvent.findMany({
      where: { incidentId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    console.error("GET /api/incidents/[id]/events error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, description, type, authorName, authorRole, userId } = body;

    if (!title || !type) {
      return NextResponse.json(
        { success: false, error: "Title and type are required" },
        { status: 400 }
      );
    }

    const event = await prisma.incidentEvent.create({
      data: {
        incidentId: id,
        type,
        description: description ? `${title}: ${description}` : title,
        metadata: JSON.stringify({ title, authorName, authorRole }),
        userId: userId || null,
      },
    });

    // Also log to audit
    await prisma.auditLog.create({
      data: {
        action: "ADD_INCIDENT_EVENT",
        entity: "Incident",
        entityId: id,
        userId: userId || null,
        metadata: JSON.stringify({ eventTitle: title, eventType: type, actor: authorName, authorRole }),
      },
    });

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    console.error("POST /api/incidents/[id]/events error:", error);
    return NextResponse.json({ success: false, error: "Failed to create event" }, { status: 500 });
  }
}

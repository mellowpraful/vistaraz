import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const entity = searchParams.get("entity");
    const entityId = searchParams.get("entityId");
    const limit = parseInt(searchParams.get("limit") ?? "50");

    const logs = await prisma.auditLog.findMany({
      where: {
        ...(entity ? { entity } : {}),
        ...(entityId ? { entityId } : {}),
      },
      include: { user: { select: { name: true, role: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ logs, total: logs.length });
  } catch (error) {
    console.error("GET /api/audit error:", error);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const log = await prisma.auditLog.create({
      data: {
        userId: body.userId ?? null,
        action: body.action,
        entity: body.entity,
        entityId: body.entityId ?? null,
        before: body.before ? JSON.stringify(body.before) : null,
        after: body.after ? JSON.stringify(body.after) : null,
        metadata: body.metadata ? JSON.stringify(body.metadata) : null,
      },
    });
    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    console.error("POST /api/audit error:", error);
    return NextResponse.json({ error: "Failed to create audit log" }, { status: 500 });
  }
}

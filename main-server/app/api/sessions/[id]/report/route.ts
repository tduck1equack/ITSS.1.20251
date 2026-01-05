import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionId = (await params).id;

    const session = await prisma.presentationSession.findUnique({
      where: { id: sessionId },
      include: {
        presentation: {
          include: {
            checkpoints: true,
          },
        },
        responses: {
          include: {
            user: {
              select: { id: true, name: true, email: true, studentCode: true },
            },
            checkpoint: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Lấy danh sách các phiên học của bài giảng này
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const presentationId = (await params).id;

    const sessions = await prisma.presentationSession.findMany({
      where: { presentationId },
      orderBy: { startedAt: "desc" },
      include: {
        _count: {
          select: { responses: true },
        },
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const presentationId = (await params).id;
    const body = await request.json();
    const { userId, sessionName } = body;

    // 1. Tạo session mới
    const newSession = await prisma.presentationSession.create({
      data: {
        presentationId,
        hostId: userId,
        sessionName:
          sessionName || `Phiên học ${new Date().toLocaleDateString("vi-VN")}`,
        isActive: true,
        startedAt: new Date(),
        joinCode: Math.floor(100000 + Math.random() * 900000).toString(),
      },
    });

    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

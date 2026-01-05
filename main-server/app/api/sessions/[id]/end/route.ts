import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH: Kết thúc phiên học
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionId = (await params).id;

    const updatedSession = await prisma.presentationSession.update({
      where: { id: sessionId },
      data: {
        isActive: false, // Đánh dấu đã đóng
        endedAt: new Date(), // Lưu thời gian kết thúc
      },
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("End session error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Sinh viên nộp bài
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionId = (await params).id;
    const body = await request.json();
    const { userId, checkpointId, answerData } = body;

    // 1. Lấy thông tin Checkpoint để so sánh đáp án đúng
    const checkpoint = await prisma.presentationCheckpoint.findUnique({
      where: { id: checkpointId },
    });

    if (!checkpoint) {
      return NextResponse.json(
        { error: "Checkpoint not found" },
        { status: 404 }
      );
    }

    // 2. Tính điểm (Đúng/Sai)
    // So sánh 2 mảng: answerData (SV chọn) và checkpoint.correctAnswer (Đáp án đúng)
    // Logic: Phải chọn đúng hết và đủ các đáp án
    const userAns = (answerData as string[]).sort().join(",");
    // Ép kiểu correctAnswer về string[] vì trong DB nó là Json
    const correctAns = ((checkpoint.correctAnswer as string[]) || [])
      .sort()
      .join(",");

    const isCorrect = userAns === correctAns;

    // 3. Lưu vào Database
    // Dùng upsert để nếu nộp lại thì cập nhật, chưa nộp thì tạo mới
    const response = await prisma.sessionResponse.upsert({
      where: {
        sessionId_checkpointId_userId: {
          sessionId,
          checkpointId,
          userId,
        },
      },
      update: {
        answerData,
        isCorrect,
        submittedAt: new Date(),
      },
      create: {
        sessionId,
        checkpointId,
        userId,
        answerData,
        isCorrect,
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

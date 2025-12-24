import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { joinCode, userId, userRole } = await req.json();

    if (!userId || !userRole) {
      return NextResponse.json(
        { error: "User ID and role are required" },
        { status: 401 }
      );
    }

    if (!joinCode || typeof joinCode !== "string") {
      return NextResponse.json(
        { error: "Mã lớp học không hợp lệ" },
        { status: 400 }
      );
    }

    // Sanitize and validate the join code (preserve case for lowercase letters)
    const sanitizedCode = joinCode.trim();

    if (sanitizedCode.length !== 8) {
      return NextResponse.json(
        { error: "Mã lớp học phải có đúng 8 ký tự" },
        { status: 400 }
      );
    }

    // Basic SQL injection prevention - allow uppercase, lowercase, numbers, and special chars: #@$&*!
    if (!/^[A-Za-z0-9#@$&*!]+$/.test(sanitizedCode)) {
      return NextResponse.json(
        { error: "Mã lớp học chứa ký tự không hợp lệ" },
        { status: 400 }
      );
    }

    // Find the class with this join code
    const targetClass = await prisma.class.findFirst({
      where: {
        joinCode: sanitizedCode,
        isPrivate: true,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        code: true,
      },
    });

    if (!targetClass) {
      return NextResponse.json(
        { error: "Mã lớp học không hợp lệ hoặc lớp học không tồn tại" },
        { status: 404 }
      );
    }

    // Check if user is already enrolled/teaching
    if (userRole === "STUDENT") {
      const existingEnrollment = await prisma.classEnrollment.findUnique({
        where: {
          classId_studentId: {
            classId: targetClass.id,
            studentId: userId,
          },
        },
      });

      if (existingEnrollment) {
        return NextResponse.json(
          { error: "Bạn đã tham gia lớp học này rồi" },
          { status: 409 }
        );
      }

      // Enroll student
      await prisma.classEnrollment.create({
        data: {
          classId: targetClass.id,
          studentId: userId,
          status: "ACTIVE",
        },
      });
    } else if (userRole === "TEACHER") {
      const existingTeacher = await prisma.classTeacher.findUnique({
        where: {
          classId_teacherId: {
            classId: targetClass.id,
            teacherId: userId,
          },
        },
      });

      if (existingTeacher) {
        return NextResponse.json(
          { error: "Bạn đã tham gia giảng dạy lớp học này rồi" },
          { status: 409 }
        );
      }

      // Add teacher
      await prisma.classTeacher.create({
        data: {
          classId: targetClass.id,
          teacherId: userId,
          role: "TEACHER",
        },
      });
    } else {
      return NextResponse.json(
        { error: "Chỉ giảng viên và sinh viên mới có thể tham gia lớp học" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      className: targetClass.name,
      classCode: targetClass.code,
      classId: targetClass.id,
    });
  } catch (error) {
    console.error("Error joining private class:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi tham gia lớp học" },
      { status: 500 }
    );
  }
}

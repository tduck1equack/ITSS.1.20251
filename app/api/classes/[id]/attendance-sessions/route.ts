import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/classes/[id]/attendance-sessions - Get attendance sessions for a class
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {
      classId,
    };

    if (status) {
      where.status = status;
    }

    const sessions = await prisma.attendanceSession.findMany({
      where,
      include: {
        class: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        checkIns: {
          select: {
            id: true,
            studentId: true,
            checkedAt: true,
            student: {
              select: {
                id: true,
                name: true,
                studentCode: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            checkedAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching attendance sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance sessions" },
      { status: 500 }
    );
  }
}

// POST /api/classes/[id]/attendance-sessions - Create a new attendance session
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;
    const body = await req.json();
    const { title = "Điểm danh", createdById, durationMinutes = 10 } = body;

    // Generate a 6-digit session code
    const sessionCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Calculate auto-close time based on duration
    const endTime = new Date();
    endTime.setMinutes(endTime.getMinutes() + durationMinutes);

    const session = await prisma.attendanceSession.create({
      data: {
        classId,
        title,
        sessionCode,
        createdById: createdById || classId, // Fallback if createdById not provided
        status: "ACTIVE",
        endTime,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        checkIns: {
          select: {
            id: true,
            studentId: true,
            checkedAt: true,
            student: {
              select: {
                id: true,
                name: true,
                studentCode: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Send notifications to all enrolled students
    try {
      const enrollments = await prisma.classEnrollment.findMany({
        where: { classId },
        select: { studentId: true },
      });

      // Find or create notification category
      let category = await prisma.notificationCategory.findUnique({
        where: { code: "ATTENDANCE_STARTED" },
      });

      if (!category) {
        category = await prisma.notificationCategory.create({
          data: {
            code: "ATTENDANCE_STARTED",
            name: "Điểm danh bắt đầu",
            description: "Thông báo khi giáo viên bắt đầu điểm danh",
            icon: "FiUserCheck",
            color: "mint",
            priority: "HIGH",
          },
        });
      }

      // Create notifications for all students
      const notificationPromises = enrollments.map((enrollment) =>
        prisma.notification.create({
          data: {
            userId: enrollment.studentId,
            categoryId: category.id,
            title: `Điểm danh: ${session.class.name}`,
            message: `Giáo viên đã bắt đầu điểm danh. Mã: ${sessionCode}. Hạn chót: ${endTime.toLocaleTimeString(
              "vi-VN",
              { hour: "2-digit", minute: "2-digit" }
            )}`,
            link: `/dashboard/student/classes/${classId}?tab=attendance`,
            priority: "HIGH",
            metadata: {
              sessionId: session.id,
              classId,
              sessionCode,
              endTime: endTime.toISOString(),
            },
          },
        })
      );

      await Promise.all(notificationPromises);
    } catch (notifError) {
      console.error("Failed to send notifications:", notifError);
      // Don't fail the whole request if notifications fail
    }

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("Error creating attendance session:", error);
    return NextResponse.json(
      { error: "Failed to create attendance session" },
      { status: 500 }
    );
  }
}

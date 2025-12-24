import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/attendance-sessions/[id] - Get a specific attendance session
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;

    const session = await prisma.attendanceSession.findUnique({
      where: {
        id: sessionId,
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
          orderBy: {
            checkedAt: "asc",
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Attendance session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error fetching attendance session:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance session" },
      { status: 500 }
    );
  }
}

// PATCH /api/attendance-sessions/[id] - Update attendance session (e.g., close it)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const body = await req.json();
    const { status, endTime } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (endTime) updateData.endTime = new Date(endTime);
    if (status === "CLOSED" && !endTime) updateData.endTime = new Date();

    const session = await prisma.attendanceSession.update({
      where: {
        id: sessionId,
      },
      data: updateData,
      include: {
        class: {
          select: {
            id: true,
            name: true,
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

    // If closing the session, send notifications to students who missed attendance
    if (status === "CLOSED") {
      try {
        // Get all enrolled students
        const enrollments = await prisma.classEnrollment.findMany({
          where: { classId: session.classId },
          select: { studentId: true },
        });

        // Get students who checked in
        const checkedInStudentIds = new Set(
          session.checkIns.map((checkIn) => checkIn.studentId)
        );

        // Find students who didn't check in
        const missedStudents = enrollments.filter(
          (enrollment) => !checkedInStudentIds.has(enrollment.studentId)
        );

        if (missedStudents.length > 0) {
          // Find or create notification category
          let category = await prisma.notificationCategory.findUnique({
            where: { code: "ATTENDANCE_MISSED" },
          });

          if (!category) {
            category = await prisma.notificationCategory.create({
              data: {
                code: "ATTENDANCE_MISSED",
                name: "Vắng mặt điểm danh",
                description: "Thông báo khi sinh viên vắng mặt buổi điểm danh",
                icon: "FiAlertCircle",
                color: "red",
                priority: "NORMAL",
              },
            });
          }

          // Create notifications for students who missed attendance
          const notificationPromises = missedStudents.map((enrollment) =>
            prisma.notification.create({
              data: {
                userId: enrollment.studentId,
                categoryId: category.id,
                title: `Vắng mặt: ${session.class.name}`,
                message: `Bạn đã vắng mặt buổi điểm danh "${
                  session.title
                }" vào ${new Date(session.startTime).toLocaleDateString(
                  "vi-VN"
                )}`,
                link: `/dashboard/student/classes/${session.classId}?tab=attendance`,
                priority: "NORMAL",
                metadata: {
                  sessionId: session.id,
                  classId: session.classId,
                  startTime: session.startTime.toISOString(),
                },
              },
            })
          );

          await Promise.all(notificationPromises);
        }
      } catch (notifError) {
        console.error(
          "Failed to send missed attendance notifications:",
          notifError
        );
        // Don't fail the whole request if notifications fail
      }
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error updating attendance session:", error);
    return NextResponse.json(
      { error: "Failed to update attendance session" },
      { status: 500 }
    );
  }
}

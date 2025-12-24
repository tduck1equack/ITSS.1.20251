import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/attendance-sessions/[id]/checkin - Student checks in to attendance session
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const body = await req.json();
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Check if session exists and is active
    const session = await prisma.attendanceSession.findUnique({
      where: {
        id: sessionId,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Attendance session not found" },
        { status: 404 }
      );
    }

    if (session.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "This attendance session is no longer active" },
        { status: 400 }
      );
    }

    // Check if session has expired based on endTime
    if (session.endTime && new Date() > new Date(session.endTime)) {
      // Auto-close expired session
      await prisma.attendanceSession.update({
        where: { id: sessionId },
        data: { status: "CLOSED" },
      });
      return NextResponse.json(
        { error: "This attendance session has expired" },
        { status: 400 }
      );
    }

    // Check if student is enrolled in the class
    const enrollment = await prisma.classEnrollment.findUnique({
      where: {
        classId_studentId: {
          classId: session.classId,
          studentId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "You are not enrolled in this class" },
        { status: 403 }
      );
    }

    // Check if already checked in
    const existingCheckIn = await prisma.attendanceCheckIn.findUnique({
      where: {
        sessionId_studentId: {
          sessionId,
          studentId,
        },
      },
    });

    if (existingCheckIn) {
      return NextResponse.json(
        { error: "You have already checked in to this session" },
        { status: 400 }
      );
    }

    // Create check-in record
    const checkIn = await prisma.attendanceCheckIn.create({
      data: {
        sessionId,
        studentId,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            studentCode: true,
            avatar: true,
          },
        },
        session: {
          select: {
            id: true,
            title: true,
            sessionCode: true,
          },
        },
      },
    });

    return NextResponse.json(checkIn, { status: 201 });
  } catch (error) {
    console.error("Error checking in:", error);
    return NextResponse.json({ error: "Failed to check in" }, { status: 500 });
  }
}

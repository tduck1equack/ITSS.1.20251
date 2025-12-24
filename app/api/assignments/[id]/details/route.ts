import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assignmentId } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get assignment with all details
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        attachments: {
          orderBy: {
            uploadedAt: "desc",
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this assignment
    const enrollment = await prisma.classEnrollment.findFirst({
      where: {
        classId: assignment.classId,
        studentId: userId,
      },
    });

    const isTeacher = await prisma.classTeacher.findFirst({
      where: {
        classId: assignment.classId,
        teacherId: userId,
      },
    });

    if (!enrollment && !isTeacher) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // For students, include their submission
    let submission = null;
    if (enrollment) {
      submission = await prisma.assignmentSubmission.findUnique({
        where: {
          assignmentId_studentId: {
            assignmentId: assignmentId,
            studentId: userId,
          },
        },
        include: {
          attachments: {
            orderBy: {
              uploadedAt: "desc",
            },
          },
        },
      });
    }

    return NextResponse.json({
      assignment,
      submission,
      isTeacher: !!isTeacher,
    });
  } catch (error) {
    console.error("Error fetching assignment details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

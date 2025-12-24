import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/students/[id]/assignments - Get all assignments for a student across all classes
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get student's enrolled classes
    const enrollments = await prisma.classEnrollment.findMany({
      where: {
        studentId: id,
        status: "ACTIVE",
      },
      select: {
        classId: true,
      },
    });

    const classIds = enrollments.map((e) => e.classId);

    // Get student's groups
    const groups = await prisma.groupMember.findMany({
      where: {
        studentId: id,
      },
      select: {
        groupId: true,
      },
    });

    const groupIds = groups.map((g) => g.groupId);

    // Get all assignments
    const assignments = await prisma.assignment.findMany({
      where: {
        classId: { in: classIds },
        status: "PUBLISHED",
        OR: [
          { groupId: null }, // All students
          { groupId: { in: groupIds } }, // Student's groups
        ],
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        attachments: {
          select: {
            id: true,
            fileName: true,
          },
        },
        submissions: {
          where: {
            studentId: id,
          },
          select: {
            id: true,
            status: true,
            submittedAt: true,
            grade: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching student assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

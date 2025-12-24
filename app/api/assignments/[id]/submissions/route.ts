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

    // Check if user is a teacher of the class
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: { classId: true },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    const isTeacher = await prisma.classTeacher.findFirst({
      where: {
        classId: assignment.classId,
        teacherId: userId,
      },
    });

    if (!isTeacher) {
      return NextResponse.json(
        { error: "Access denied. Only teachers can view submissions." },
        { status: 403 }
      );
    }

    // Get all submissions for this assignment
    const submissions = await prisma.assignmentSubmission.findMany({
      where: {
        assignmentId: assignmentId,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            studentCode: true,
          },
        },
        attachments: {
          orderBy: {
            uploadedAt: "desc",
          },
        },
      },
      orderBy: [
        { status: "desc" }, // GRADED, SUBMITTED, LATE, DRAFT
        { submittedAt: "desc" },
      ],
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

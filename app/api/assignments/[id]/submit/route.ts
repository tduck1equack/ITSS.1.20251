import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: assignmentId } = await context.params;
    const body = await request.json();
    const { studentId, action, groupId } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Verify assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        group: true,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Check if assignment is past due
    const isPastDue = new Date(assignment.dueDate) < new Date();

    if (action === "submit") {
      // Find or create submission
      let submission = await prisma.assignmentSubmission.findUnique({
        where: {
          assignmentId_studentId: {
            assignmentId,
            studentId,
          },
        },
        include: {
          attachments: true,
        },
      });

      if (!submission) {
        // Create new submission
        submission = await prisma.assignmentSubmission.create({
          data: {
            assignmentId,
            studentId,
            groupId: groupId || null,
            status: isPastDue ? "LATE" : "SUBMITTED",
            submittedAt: new Date(),
          },
          include: {
            attachments: true,
          },
        });
      } else {
        // Update existing submission
        submission = await prisma.assignmentSubmission.update({
          where: { id: submission.id },
          data: {
            status: isPastDue ? "LATE" : "SUBMITTED",
            submittedAt: new Date(),
            groupId: groupId || null,
          },
          include: {
            attachments: true,
          },
        });
      }

      return NextResponse.json({
        success: true,
        submission,
      });
    } else if (action === "unsubmit") {
      // Change status back to DRAFT if not past due
      if (isPastDue) {
        return NextResponse.json(
          { error: "Cannot unsubmit past due assignments" },
          { status: 400 }
        );
      }

      const submission = await prisma.assignmentSubmission.update({
        where: {
          assignmentId_studentId: {
            assignmentId,
            studentId,
          },
        },
        data: {
          status: "DRAFT",
          submittedAt: null,
        },
        include: {
          attachments: true,
        },
      });

      return NextResponse.json({
        success: true,
        submission,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error submitting assignment:", error);
    return NextResponse.json(
      { error: "Failed to process submission" },
      { status: 500 }
    );
  }
}

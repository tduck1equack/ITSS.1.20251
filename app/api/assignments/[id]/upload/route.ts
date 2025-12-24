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
    const { studentId, fileName, fileUrl, fileSize, mimeType } = body;

    if (!studentId || !fileName || !fileUrl) {
      return NextResponse.json(
        { error: "Student ID, file name, and file URL are required" },
        { status: 400 }
      );
    }

    // Verify assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Find or create submission
    let submission = await prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId,
        },
      },
    });

    if (!submission) {
      submission = await prisma.assignmentSubmission.create({
        data: {
          assignmentId,
          studentId,
          status: "DRAFT",
        },
      });
    }

    // Create attachment for submission
    const attachment = await prisma.assignmentSubmissionAttachment.create({
      data: {
        submissionId: submission.id,
        fileName,
        fileUrl,
        fileSize: fileSize || null,
        mimeType: mimeType || null,
      },
    });

    return NextResponse.json({
      success: true,
      attachment,
      submissionId: submission.id,
    });
  } catch (error) {
    console.error("Error uploading file to assignment:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

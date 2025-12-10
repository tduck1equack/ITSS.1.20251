import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/prisma/generated/client";

const prisma = new PrismaClient();

// POST /api/assignments/[id]/submissions - Create or update submission
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: assignmentId } = await params;
        const { studentId, content, attachments, status } = await req.json();

        if (!studentId) {
            return NextResponse.json(
                { error: "Student ID is required" },
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

        // Check if submission already exists
        const existingSubmission = await prisma.assignmentSubmission.findUnique({
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

        const now = new Date();
        const dueDate = new Date(assignment.dueDate);
        const isLate = now > dueDate && status === "SUBMITTED";

        let submission: any;

        if (existingSubmission) {
            // Update existing submission
            submission = await prisma.assignmentSubmission.update({
                where: { id: existingSubmission.id },
                data: {
                    content,
                    status: isLate ? "LATE" : status || existingSubmission.status,
                    submittedAt: status === "SUBMITTED" ? now : existingSubmission.submittedAt,
                },
                include: {
                    attachments: true,
                },
            });

            // Handle attachments if provided
            if (attachments && Array.isArray(attachments)) {
                // Delete old attachments that are not in the new list
                const newFileUrls = attachments.map((a: any) => a.fileUrl);
                const attachmentsToDelete = existingSubmission.attachments.filter(
                    (a) => !newFileUrls.includes(a.fileUrl)
                );

                if (attachmentsToDelete.length > 0) {
                    await prisma.assignmentSubmissionAttachment.deleteMany({
                        where: {
                            id: {
                                in: attachmentsToDelete.map((a) => a.id),
                            },
                        },
                    });
                }

                // Add new attachments
                const existingFileUrls = existingSubmission.attachments.map(
                    (a) => a.fileUrl
                );
                const newAttachments = attachments.filter(
                    (a: any) => !existingFileUrls.includes(a.fileUrl)
                ) as any[];

                if (newAttachments.length > 0) {
                    await prisma.assignmentSubmissionAttachment.createMany({
                        data: newAttachments.map((attachment: any) => ({
                            submissionId: submission.id,
                            fileName: attachment.fileName,
                            fileUrl: attachment.fileUrl,
                            fileSize: attachment.fileSize,
                            mimeType: attachment.mimeType,
                        })),
                    });
                }
            }
        } else {
            // Create new submission
            submission = await prisma.assignmentSubmission.create({
                data: {
                    assignmentId,
                    studentId,
                    content,
                    status: isLate ? "LATE" : status || "DRAFT",
                    submittedAt: status === "SUBMITTED" ? now : null,
                    attachments: attachments
                        ? {
                            createMany: {
                                data: attachments.map((attachment: any) => ({
                                    fileName: attachment.fileName,
                                    fileUrl: attachment.fileUrl,
                                    fileSize: attachment.fileSize,
                                    mimeType: attachment.mimeType,
                                })),
                            },
                        }
                        : undefined,
                },
                include: {
                    attachments: true,
                },
            });
        }

        // Fetch the updated submission with attachments
        const updatedSubmission = await prisma.assignmentSubmission.findUnique({
            where: { id: submission.id },
            include: {
                attachments: true,
            },
        });

        return NextResponse.json(updatedSubmission);
    } catch (error) {
        console.error("Error creating/updating submission:", error);
        return NextResponse.json(
            { error: "Failed to create/update submission" },
            { status: 500 }
        );
    }
}

// GET /api/assignments/[id]/submissions?studentId=xxx - Get student's submission
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: assignmentId } = await params;
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");

        if (!studentId) {
            return NextResponse.json(
                { error: "Student ID is required" },
                { status: 400 }
            );
        }

        const submission = await prisma.assignmentSubmission.findUnique({
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
            return NextResponse.json(
                { error: "Submission not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(submission);
    } catch (error) {
        console.error("Error fetching submission:", error);
        return NextResponse.json(
            { error: "Failed to fetch submission" },
            { status: 500 }
        );
    }
}

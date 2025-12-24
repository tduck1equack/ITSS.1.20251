import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/assignments/[id] - Get assignment details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    const assignment = await prisma.assignment.findUnique({
      where: { id },
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
            members: {
              include: {
                student: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
        attachments: true,
        submissions: studentId
          ? {
              where: { studentId },
              include: {
                attachments: true,
              },
            }
          : {
              include: {
                student: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                    studentCode: true,
                  },
                },
                attachments: true,
              },
              orderBy: {
                submittedAt: "desc",
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

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Error fetching assignment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignment" },
      { status: 500 }
    );
  }
}

// PATCH /api/assignments/[id] - Update assignment
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { title, description, dueDate, maxPoints, status } = await req.json();

    const assignment = await prisma.assignment.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(maxPoints !== undefined && { maxPoints }),
        ...(status && { status }),
      },
      include: {
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
        attachments: true,
      },
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    );
  }
}

// DELETE /api/assignments/[id] - Delete assignment
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.assignment.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json(
      { error: "Failed to delete assignment" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/classes/[id]/groups - Get all groups in a class
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;

    const groups = await prisma.group.findMany({
      where: { classId },
      include: {
        members: {
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
          },
        },
        assignments: {
          select: {
            id: true,
            title: true,
            dueDate: true,
            status: true,
            maxPoints: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 }
    );
  }
}

// POST /api/classes/[id]/groups - Create or update groups
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;
    const body = await request.json();
    const { groups, createdById } = body;

    // Delete existing groups in the class
    await prisma.group.deleteMany({
      where: { classId },
    });

    // Create new groups
    const createdGroups = await Promise.all(
      groups.map(async (group: { name: string; memberIds: string[] }) => {
        const newGroup = await prisma.group.create({
          data: {
            classId,
            name: group.name,
            createdById,
            members: {
              create: group.memberIds.map((studentId) => ({
                studentId,
              })),
            },
          },
          include: {
            members: {
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
              },
            },
          },
        });
        return newGroup;
      })
    );

    return NextResponse.json({ groups: createdGroups });
  } catch (error) {
    console.error("Error creating groups:", error);
    return NextResponse.json(
      { error: "Failed to create groups" },
      { status: 500 }
    );
  }
}

// DELETE /api/classes/[id]/groups - Delete all groups in a class
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;

    await prisma.group.deleteMany({
      where: { classId },
    });

    return NextResponse.json({ message: "Groups deleted successfully" });
  } catch (error) {
    console.error("Error deleting groups:", error);
    return NextResponse.json(
      { error: "Failed to delete groups" },
      { status: 500 }
    );
  }
}

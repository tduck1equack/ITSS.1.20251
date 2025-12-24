import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/teachers/[id]/assignments - Get all assignments created by a teacher
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const assignments = await prisma.assignment.findMany({
      where: {
        createdById: id,
      },
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
        attachments: {
          select: {
            id: true,
            fileName: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching teacher assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

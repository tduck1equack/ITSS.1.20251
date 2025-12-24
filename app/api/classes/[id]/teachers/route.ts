import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/classes/[id]/teachers - Add teacher to class
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { teacherId, role = "TEACHER" } = body;

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    // Verify that the teacher exists and is a TEACHER
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    if (teacher.role !== "TEACHER") {
      return NextResponse.json(
        { error: "User is not a teacher" },
        { status: 403 }
      );
    }

    // Check if teacher already added
    const existing = await prisma.classTeacher.findUnique({
      where: {
        classId_teacherId: {
          classId: id,
          teacherId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Teacher already added to this class" },
        { status: 409 }
      );
    }

    // Add teacher to class
    const classTeacher = await prisma.classTeacher.create({
      data: {
        classId: id,
        teacherId,
        role,
      },
    });

    return NextResponse.json({ classTeacher }, { status: 201 });
  } catch (error) {
    console.error("POST /api/classes/[id]/teachers error:", error);
    return NextResponse.json(
      { error: "Failed to add teacher to class" },
      { status: 500 }
    );
  }
}

// DELETE /api/classes/[id]/teachers/[teacherId] - Remove teacher from class
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId");

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    await prisma.classTeacher.delete({
      where: {
        classId_teacherId: {
          classId: id,
          teacherId,
        },
      },
    });

    return NextResponse.json({ message: "Teacher removed successfully" });
  } catch (error) {
    console.error("DELETE /api/classes/[id]/teachers error:", error);
    return NextResponse.json(
      { error: "Failed to remove teacher" },
      { status: 500 }
    );
  }
}

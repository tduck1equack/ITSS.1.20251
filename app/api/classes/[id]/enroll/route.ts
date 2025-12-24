import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/classes/[id]/enroll - Enroll student in class
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const existing = await prisma.classEnrollment.findUnique({
      where: {
        classId_studentId: {
          classId: id,
          studentId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Already enrolled in this class" },
        { status: 409 }
      );
    }

    // Create enrollment
    const enrollment = await prisma.classEnrollment.create({
      data: {
        classId: id,
        studentId,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (error) {
    console.error("POST /api/classes/[id]/enroll error:", error);
    return NextResponse.json(
      { error: "Failed to enroll in class" },
      { status: 500 }
    );
  }
}

// DELETE /api/classes/[id]/enroll - Unenroll student from class
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Delete enrollment
    await prisma.classEnrollment.delete({
      where: {
        classId_studentId: {
          classId: id,
          studentId,
        },
      },
    });

    return NextResponse.json({ message: "Unenrolled successfully" });
  } catch (error) {
    console.error("DELETE /api/classes/[id]/enroll error:", error);
    return NextResponse.json(
      { error: "Failed to unenroll from class" },
      { status: 500 }
    );
  }
}

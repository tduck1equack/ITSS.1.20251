import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/prisma/generated/client";

const prisma = new PrismaClient();

// GET /api/classes - Get classes based on user role
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const userId = searchParams.get("userId");

    if (role === "teacher" && userId) {
      // Get classes where user is a teacher
      const classTeachers = await prisma.classTeacher.findMany({
        where: { teacherId: userId },
        include: {
          class: {
            include: {
              teachers: {
                include: {
                  teacher: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
              enrollments: true,
            },
          },
        },
      });

      const classes = classTeachers.map((ct) => ({
        id: ct.class.id,
        code: ct.class.code,
        name: ct.class.name,
        description: ct.class.description,
        coverImage: ct.class.coverImage,
        status: ct.class.status,
        semester: ct.class.semester,
        year: ct.class.year,
        studentCount: ct.class.enrollments.length,
        teacherNames: ct.class.teachers.map((t) => t.teacher.name),
      }));

      return NextResponse.json({ classes });
    } else if (userId) {
      // Student view - get enrolled and available classes
      const enrolledClasses = await prisma.classEnrollment.findMany({
        where: { studentId: userId, status: "ACTIVE" },
        include: {
          class: {
            include: {
              teachers: {
                include: {
                  teacher: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
              enrollments: true,
            },
          },
        },
      });

      const enrolled = enrolledClasses.map((enrollment) => ({
        id: enrollment.class.id,
        code: enrollment.class.code,
        name: enrollment.class.name,
        description: enrollment.class.description,
        coverImage: enrollment.class.coverImage,
        status: enrollment.class.status,
        semester: enrollment.class.semester,
        year: enrollment.class.year,
        studentCount: enrollment.class.enrollments.length,
        teacherNames: enrollment.class.teachers.map((t) => t.teacher.name),
        isEnrolled: true,
      }));

      // Get available classes (not enrolled)
      const enrolledClassIds = enrolled.map((c) => c.id);
      const availableClasses = await prisma.class.findMany({
        where: {
          status: "ACTIVE",
          id: { notIn: enrolledClassIds },
        },
        include: {
          teachers: {
            include: {
              teacher: {
                select: {
                  name: true,
                },
              },
            },
          },
          enrollments: true,
        },
      });

      const available = availableClasses.map((classItem) => ({
        id: classItem.id,
        code: classItem.code,
        name: classItem.name,
        description: classItem.description,
        coverImage: classItem.coverImage,
        status: classItem.status,
        semester: classItem.semester,
        year: classItem.year,
        studentCount: classItem.enrollments.length,
        teacherNames: classItem.teachers.map((t) => t.teacher.name),
        isEnrolled: false,
      }));

      return NextResponse.json({ enrolled, available });
    }

    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  } catch (error) {
    console.error("GET /api/classes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}

// POST /api/classes - Create a new class
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, description, semester, year, teacherId } = body;

    if (!code || !name || !teacherId) {
      return NextResponse.json(
        { error: "Code, name, and teacherId are required" },
        { status: 400 }
      );
    }

    // Check if class code already exists
    const existing = await prisma.class.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Class code already exists" },
        { status: 409 }
      );
    }

    // Create class and add teacher
    const newClass = await prisma.class.create({
      data: {
        code,
        name,
        description,
        semester,
        year,
        status: "ACTIVE",
      },
    });

    // Add the creating teacher to the class
    await prisma.classTeacher.create({
      data: {
        classId: newClass.id,
        teacherId,
        role: "TEACHER",
      },
    });

    return NextResponse.json({ class: newClass }, { status: 201 });
  } catch (error) {
    console.error("POST /api/classes error:", error);
    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 }
    );
  }
}

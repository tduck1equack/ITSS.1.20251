import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/classes/[id]/assignments - Get all assignments for a class
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const groupId = searchParams.get("groupId");

    let assignments;

    if (studentId) {
      // Get assignments for a specific student (including their submissions)
      // Find student's group in this class
      const studentGroup = await prisma.groupMember.findFirst({
        where: {
          studentId,
          group: {
            classId: id,
          },
        },
        include: {
          group: true,
        },
      });

      assignments = await prisma.assignment.findMany({
        where: {
          classId: id,
          status: "PUBLISHED",
          OR: [
            { groupId: null }, // Assignments for all students
            { groupId: studentGroup?.groupId }, // Assignments for student's group
          ],
        },
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
            },
          },
          attachments: true,
          submissions: {
            where: {
              studentId,
            },
            select: {
              id: true,
              status: true,
              submittedAt: true,
              grade: true,
              feedback: true,
              attachments: {
                select: {
                  id: true,
                  fileName: true,
                  fileUrl: true,
                  fileSize: true,
                  mimeType: true,
                },
              },
            },
          },
          _count: {
            select: {
              submissions: true,
            },
          },
        },
        orderBy: {
          dueDate: "asc",
        },
      });
    } else {
      // Get all assignments for teachers
      assignments = await prisma.assignment.findMany({
        where: {
          classId: id,
          ...(groupId && groupId !== "all" ? { groupId } : {}),
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
    }

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

// POST /api/classes/[id]/assignments - Create a new assignment
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const {
      title,
      description,
      dueDate,
      maxPoints,
      groupId,
      isSeparateSubmission,
      createdById,
      attachments,
    } = await req.json();

    if (!title || !dueDate || !createdById) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create assignment
    const assignment = await prisma.assignment.create({
      data: {
        classId: id,
        groupId: groupId || null,
        title,
        description,
        dueDate: new Date(dueDate),
        maxPoints: maxPoints || 100,
        status: "PUBLISHED",
        isSeparateSubmission:
          isSeparateSubmission !== undefined ? isSeparateSubmission : true,
        createdById,
        attachments: attachments
          ? {
              create: attachments.map((att: any) => ({
                fileName: att.fileName,
                fileUrl: att.fileUrl,
                fileSize: att.fileSize,
                mimeType: att.mimeType,
              })),
            }
          : undefined,
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
            members: {
              select: {
                studentId: true,
              },
            },
          },
        },
        attachments: true,
      },
    });

    // Create notifications for affected students
    const classData = await prisma.class.findUnique({
      where: { id },
      select: {
        name: true,
        enrollments: {
          where: { status: "ACTIVE" },
          select: { studentId: true },
        },
      },
    });

    if (!classData) {
      return NextResponse.json(assignment, { status: 201 });
    }

    // Get notification category
    let category = await prisma.notificationCategory.findUnique({
      where: { code: "ASSIGNMENT_CREATED" },
    });

    if (!category) {
      category = await prisma.notificationCategory.create({
        data: {
          code: "ASSIGNMENT_CREATED",
          name: "Bài tập mới",
          description: "Thông báo khi có bài tập mới được giao",
          icon: "FiFileText",
          color: "blue",
          priority: "NORMAL",
        },
      });
    }

    // Determine which students to notify
    let studentIds: string[];
    if (groupId && assignment.group) {
      studentIds = assignment.group.members.map((m) => m.studentId);
    } else {
      studentIds = classData.enrollments.map((e) => e.studentId);
    }

    // Create notifications
    await prisma.notification.createMany({
      data: studentIds.map((studentId) => ({
        userId: studentId,
        categoryId: category.id,
        title: groupId ? `Bài tập nhóm mới: ${title}` : `Bài tập mới: ${title}`,
        message: `Giáo viên đã giao bài tập mới trong lớp ${
          classData.name
        }. Hạn nộp: ${new Date(dueDate).toLocaleDateString("vi-VN")}`,
        link: `/dashboard/student/assignments/${assignment.id}`,
        priority: "NORMAL",
        metadata: {
          assignmentId: assignment.id,
          classId: id,
          groupId: groupId || null,
        },
      })),
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    );
  }
}

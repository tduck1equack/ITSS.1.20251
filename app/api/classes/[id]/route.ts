import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/classes/[id] - Get class details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const classItem = await prisma.class.findUnique({
      where: { id },
      include: {
        teachers: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        enrollments: {
          where: { status: "ACTIVE" },
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
        groups: {
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
        },
        assignments: {
          orderBy: { dueDate: "asc" },
          take: 5,
        },
        posts: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
                groupMemberships: {
                  where: {
                    group: {
                      classId: id,
                    },
                  },
                  include: {
                    group: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
            attachments: true,
            comments: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                    groupMemberships: {
                      where: {
                        group: {
                          classId: id,
                        },
                      },
                      include: {
                        group: {
                          select: {
                            name: true,
                          },
                        },
                      },
                    },
                  },
                },
                attachments: true,
              },
            },
            votes: true,
          },
        },
        learningMaterials: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!classItem) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Transform posts to include groupName in author
    const transformedClass = {
      ...classItem,
      posts: classItem.posts.map((post: any) => ({
        ...post,
        author: post.author
          ? {
              ...post.author,
              groupName: post.author.groupMemberships?.[0]?.group?.name,
              groupMemberships: undefined,
            }
          : null,
        comments: post.comments?.map((comment: any) => ({
          ...comment,
          author: comment.author
            ? {
                ...comment.author,
                groupName: comment.author.groupMemberships?.[0]?.group?.name,
                groupMemberships: undefined,
              }
            : null,
        })),
      })),
    };

    return NextResponse.json({ class: transformedClass });
  } catch (error) {
    console.error("GET /api/classes/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch class" },
      { status: 500 }
    );
  }
}

// PUT /api/classes/[id] - Update class
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, semester, year, status } = body;

    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        name,
        description,
        semester,
        year,
        status,
      },
    });

    return NextResponse.json({ class: updatedClass });
  } catch (error) {
    console.error("PUT /api/classes/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update class" },
      { status: 500 }
    );
  }
}

// PATCH /api/classes/[id] - Partially update class
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      code,
      name,
      description,
      semester,
      year,
      status,
      isPrivate,
      joinCode,
    } = body;

    // Validate joinCode if class is being set to private
    if (isPrivate && joinCode) {
      if (joinCode.length !== 8) {
        return NextResponse.json(
          { error: "Join code must be exactly 8 characters" },
          { status: 400 }
        );
      }

      // Check if joinCode is already used by another class
      const existingCode = await prisma.class.findFirst({
        where: {
          joinCode,
          NOT: { id },
        },
      });

      if (existingCode) {
        return NextResponse.json(
          { error: "Join code already exists" },
          { status: 409 }
        );
      }
    }

    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        ...(code !== undefined && { code }),
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(semester !== undefined && { semester }),
        ...(year !== undefined && { year }),
        ...(status !== undefined && { status }),
        ...(isPrivate !== undefined && { isPrivate }),
        ...(isPrivate && joinCode !== undefined && { joinCode }),
        ...(!isPrivate && { joinCode: null }),
      },
    });

    return NextResponse.json({ class: updatedClass });
  } catch (error) {
    console.error("PATCH /api/classes/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update class" },
      { status: 500 }
    );
  }
}

// DELETE /api/classes/[id] - Delete class
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.class.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Class deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/classes/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete class" },
      { status: 500 }
    );
  }
}

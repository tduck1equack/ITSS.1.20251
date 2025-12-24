import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Pin or unpin a post
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { pinned, userId } = await req.json();

    if (typeof pinned !== "boolean") {
      return NextResponse.json(
        { error: "pinned must be a boolean" },
        { status: 400 }
      );
    }

    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        class: {
          include: {
            teachers: {
              select: {
                teacherId: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Verify that the user is a teacher of the class
    if (userId) {
      const isTeacher = post.class.teachers.some(
        (teacher) => teacher.teacherId === userId
      );

      if (!isTeacher) {
        return NextResponse.json(
          { error: "Only teachers can pin posts" },
          { status: 403 }
        );
      }
    }

    // Update the post pinned status
    const updatedPost = await prisma.post.update({
      where: { id },
      data: { pinned },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        attachments: true,
        votes: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            votes: true,
            attachments: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error pinning/unpinning post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

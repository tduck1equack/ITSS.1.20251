import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Mark or unmark a post as resolved with optional correct answer
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { resolved, resolvedCommentId, userId } = await req.json();

    if (typeof resolved !== "boolean") {
      return NextResponse.json(
        { error: "resolved must be a boolean" },
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
        comments: {
          select: {
            id: true,
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
          { error: "Only teachers can resolve posts" },
          { status: 403 }
        );
      }
    }

    // If marking as resolved with a comment, verify the comment exists and belongs to this post
    if (resolved && resolvedCommentId) {
      const commentExists = post.comments.some(
        (comment) => comment.id === resolvedCommentId
      );

      if (!commentExists) {
        return NextResponse.json(
          { error: "Comment not found or does not belong to this post" },
          { status: 400 }
        );
      }
    }

    // Update the post resolved status
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        resolved,
        resolvedCommentId: resolved ? resolvedCommentId : null,
      },
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
    console.error("Error resolving/unresolving post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

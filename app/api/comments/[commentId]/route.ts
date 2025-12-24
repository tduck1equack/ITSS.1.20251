import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Update a comment
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params;
    const { authorId, content } = await req.json();

    // Verify ownership
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (existingComment.authorId !== authorId) {
      return NextResponse.json(
        { error: "Unauthorized to edit this comment" },
        { status: 403 }
      );
    }

    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
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
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 }
    );
  }
}

// Delete a comment
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params;
    const { authorId } = await req.json();

    // Verify ownership
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (existingComment.authorId !== authorId) {
      return NextResponse.json(
        { error: "Unauthorized to delete this comment" },
        { status: 403 }
      );
    }
    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}

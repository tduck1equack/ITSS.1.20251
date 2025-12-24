import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Create a comment
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { authorId, content, attachments } = await req.json();

    if (!authorId || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        postId: id,
        authorId,
        content,
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

    // Update parent post's updatedAt timestamp
    await prisma.post.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

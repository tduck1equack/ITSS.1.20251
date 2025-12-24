import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Create a new post
export async function POST(req: NextRequest) {
  try {
    const { classId, authorId, title, content, type, attachments } =
      await req.json();

    if (!classId || !authorId || !title || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        classId,
        authorId,
        title,
        content,
        type: type || "DISCUSSION",
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

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}

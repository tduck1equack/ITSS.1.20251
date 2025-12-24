import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/classes/[id]/posts - Create a post in class
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, type, authorId } = body;

    if (!title || !content || !authorId) {
      return NextResponse.json(
        { error: "Title, content, and authorId are required" },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        classId: id,
        authorId,
        title,
        content,
        type: type || "DISCUSSION",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("POST /api/classes/[id]/posts error:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}

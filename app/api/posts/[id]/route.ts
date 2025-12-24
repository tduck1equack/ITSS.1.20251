import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Get a single post
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await prisma.post.findUnique({
      where: { id },
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

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// Update a post
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { authorId, title, content, type } = await req.json();

    // Verify ownership
    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (existingPost.authorId !== authorId) {
      return NextResponse.json(
        { error: "Unauthorized to edit this post" },
        { status: 403 }
      );
    }
    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        type,
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
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

// Delete a post
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { authorId } = await req.json();

    // Verify ownership
    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (existingPost.authorId !== authorId) {
      return NextResponse.json(
        { error: "Unauthorized to delete this post" },
        { status: 403 }
      );
    }
    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}

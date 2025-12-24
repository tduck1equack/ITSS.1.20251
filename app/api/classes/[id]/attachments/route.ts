import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Get all attachments for a class (from posts, comments, and direct uploads)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Get attachments directly uploaded to class
    const classAttachments = await prisma.classAttachment.findMany({
      where: { classId: id },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        uploadedAt: "desc",
      },
    });

    // Get attachments from posts
    const postAttachments = await prisma.postAttachment.findMany({
      where: {
        post: {
          classId: id,
        },
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        uploadedAt: "desc",
      },
    });

    // Get attachments from comments
    const commentAttachments = await prisma.commentAttachment.findMany({
      where: {
        comment: {
          post: {
            classId: id,
          },
        },
      },
      include: {
        comment: {
          select: {
            id: true,
            content: true,
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        uploadedAt: "desc",
      },
    });

    // Combine all attachments with consistent structure
    const allAttachments = [
      ...classAttachments.map((att) => ({
        ...att,
        source: "class",
        uploader: att.uploader,
      })),
      ...postAttachments.map((att) => ({
        ...att,
        source: "post",
        uploader: att.post.author,
      })),
      ...commentAttachments.map((att) => ({
        ...att,
        source: "comment",
        uploader: att.comment.author,
      })),
    ].sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

    return NextResponse.json(allAttachments);
  } catch (error) {
    console.error("Error fetching attachments:", error);
    return NextResponse.json(
      { error: "Failed to fetch attachments" },
      { status: 500 }
    );
  }
}

// Upload attachment directly to class
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { uploaderId, fileName, fileUrl, fileSize, mimeType } =
      await req.json();

    if (!uploaderId || !fileName || !fileUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const attachment = await prisma.classAttachment.create({
      data: {
        classId: id,
        uploaderId,
        fileName,
        fileUrl,
        fileSize,
        mimeType,
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error("Error uploading attachment:", error);
    return NextResponse.json(
      { error: "Failed to upload attachment" },
      { status: 500 }
    );
  }
}

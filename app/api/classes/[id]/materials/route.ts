import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Get all learning materials for a class
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const materials = await prisma.learningMaterial.findMany({
      where: { classId: id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(materials);
  } catch (error) {
    console.error("Error fetching learning materials:", error);
    return NextResponse.json(
      { error: "Failed to fetch learning materials" },
      { status: 500 }
    );
  }
}

// Create a new learning material
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const {
      title,
      description,
      fileName,
      fileUrl,
      fileSize,
      mimeType,
      materialType,
      uploadedById,
    } = await req.json();

    if (!title || !fileName || !fileUrl || !materialType || !uploadedById) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const material = await prisma.learningMaterial.create({
      data: {
        classId: id,
        title,
        description,
        fileName,
        fileUrl,
        fileSize,
        mimeType,
        materialType,
        uploadedById,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error("Error creating learning material:", error);
    return NextResponse.json(
      { error: "Failed to create learning material" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/users - Get users by role
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    if (!role) {
      return NextResponse.json(
        { error: "Role parameter is required" },
        { status: 400 }
      );
    }

    const users = await prisma.user.findMany({
      where: {
        role: role as "ADMINISTRATOR" | "TEACHER" | "STUDENT",
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

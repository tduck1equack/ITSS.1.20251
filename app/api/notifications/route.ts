import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/notifications - Get user's notifications
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { read: false } : {}),
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit to 50 most recent
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create a new notification
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, categoryCode, title, message, link, priority, metadata } =
      body;

    if (!userId || !categoryCode || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find or create category
    let category = await prisma.notificationCategory.findUnique({
      where: { code: categoryCode },
    });

    if (!category) {
      // Create default category if it doesn't exist
      category = await prisma.notificationCategory.create({
        data: {
          code: categoryCode,
          name: categoryCode.replace(/_/g, " "),
          priority: priority || "NORMAL",
        },
      });
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        categoryId: category.id,
        title,
        message,
        link,
        priority: priority || "NORMAL",
        metadata,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("Failed to create notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

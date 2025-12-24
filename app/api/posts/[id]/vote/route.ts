import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Vote on a post
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, voteType } = await req.json();

    if (!userId || !voteType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (voteType !== "UPVOTE" && voteType !== "DOWNVOTE") {
      return NextResponse.json({ error: "Invalid vote type" }, { status: 400 });
    }

    // Check if user already voted
    const existingVote = await prisma.postVote.findUnique({
      where: {
        postId_userId: {
          postId: id,
          userId: userId,
        },
      },
    });

    if (existingVote) {
      // If same vote, remove it (toggle)
      if (existingVote.voteType === voteType) {
        await prisma.postVote.delete({
          where: {
            id: existingVote.id,
          },
        });
        return NextResponse.json({ success: true, action: "removed" });
      } else {
        // Change vote type
        await prisma.postVote.update({
          where: {
            id: existingVote.id,
          },
          data: {
            voteType: voteType as VoteType,
          },
        });
        return NextResponse.json({ success: true, action: "updated" });
      }
    } else {
      // Create new vote
      await prisma.postVote.create({
        data: {
          postId: id,
          userId: userId,
          voteType: voteType as VoteType,
        },
      });
      return NextResponse.json({ success: true, action: "created" });
    }
  } catch (error) {
    console.error("Error voting on post:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}

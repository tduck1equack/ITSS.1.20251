import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Vote on a comment
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params;
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
    const existingVote = await prisma.commentVote.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId: userId,
        },
      },
    });

    if (existingVote) {
      // If same vote, remove it (toggle)
      if (existingVote.voteType === voteType) {
        await prisma.commentVote.delete({
          where: {
            id: existingVote.id,
          },
        });
        return NextResponse.json({ success: true, action: "removed" });
      } else {
        // Change vote type
        await prisma.commentVote.update({
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
      await prisma.commentVote.create({
        data: {
          commentId,
          userId: userId,
          voteType: voteType as VoteType,
        },
      });
      return NextResponse.json({ success: true, action: "created" });
    }
  } catch (error) {
    console.error("Error voting on comment:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}

/**
 * Reddit-style Vote Buttons Component
 * 
 * Vertical layout with upvote button, vote count, and downvote button
 * Features optimistic updates for smooth UX
 */

import { Flex, Text } from "@radix-ui/themes";
import { FiArrowUp, FiArrowDown } from "react-icons/fi";

interface VoteButtonsProps {
  votes?: Array<{ voteType: string; userId?: string }>;
  userVote?: { voteType: string } | null;
  onVote: (voteType: "UPVOTE" | "DOWNVOTE") => void;
  size?: "small" | "medium" | "large";
}

export function VoteButtons({
  votes = [],
  userVote,
  onVote,
  size = "medium",
}: VoteButtonsProps) {
  // Calculate net votes (upvotes - downvotes)
  const upvoteCount = votes.filter((v) => v.voteType === "UPVOTE").length;
  const downvoteCount = votes.filter((v) => v.voteType === "DOWNVOTE").length;
  const netVotes = upvoteCount - downvoteCount;

  const isUpvoted = userVote?.voteType === "UPVOTE";
  const isDownvoted = userVote?.voteType === "DOWNVOTE";

  // Size configurations
  const sizeConfig = {
    small: { icon: 14, text: "1", gap: "1", padding: "4px" },
    medium: { icon: 16, text: "2", gap: "1", padding: "6px" },
    large: { icon: 18, text: "3", gap: "2", padding: "8px" },
  };

  const config = sizeConfig[size];

  return (
    <Flex
      direction="column"
      align="center"
      gap={config.gap}
      className="select-none"
    >
      {/* Upvote Button */}
      <button
        onClick={() => onVote("UPVOTE")}
        className={`
          flex items-center justify-center rounded
          transition-all duration-150 hover:scale-110
          ${isUpvoted ? "text-mint-600" : "text-gray-500 hover:text-mint-500"}
        `}
        style={{ padding: config.padding }}
        aria-label="Upvote"
      >
        <FiArrowUp
          size={config.icon}
          className={isUpvoted ? "fill-mint-600" : ""}
          strokeWidth={isUpvoted ? 3 : 2}
        />
      </button>

      {/* Vote Count */}
      <Text
        size={config.text as any}
        weight="bold"
        className={`
          ${
            netVotes > 0
              ? "text-mint-600"
              : netVotes < 0
              ? "text-red-600"
              : "text-gray-700"
          }
        `}
      >
        {netVotes > 0 ? `+${netVotes}` : netVotes}
      </Text>

      {/* Downvote Button */}
      <button
        onClick={() => onVote("DOWNVOTE")}
        className={`
          flex items-center justify-center rounded
          transition-all duration-150 hover:scale-110
          ${isDownvoted ? "text-red-600" : "text-gray-500 hover:text-red-500"}
        `}
        style={{ padding: config.padding }}
        aria-label="Downvote"
      >
        <FiArrowDown
          size={config.icon}
          className={isDownvoted ? "fill-red-600" : ""}
          strokeWidth={isDownvoted ? 3 : 2}
        />
      </button>
    </Flex>
  );
}

import {
  Avatar,
  Badge,
  Button,
  Card,
  Flex,
  Heading,
  Text,
  TextField,
} from "@radix-ui/themes";
import {
  FiMessageSquare,
  FiSend,
  FiThumbsDown,
  FiThumbsUp,
} from "react-icons/fi";
import { CommentCard } from "./CommentCard";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    type: string;
    createdAt: Date | string;
    author?: {
      name: string;
      avatar?: string;
      groupName?: string;
    };
    comments?: Array<{
      id: string;
      content: string;
      author?: {
        name: string;
        avatar?: string;
        groupName?: string;
      };
    }>;
    votes?: Array<{
      voteType: string;
    }>;
  };
  role: "student" | "teacher";
  userVote?: { voteType: string } | null;
  onVote?: (postId: string, voteType: "UPVOTE" | "DOWNVOTE") => void;
  onComment?: (postId: string) => void;
  commentText?: string;
  onCommentChange?: (postId: string, text: string) => void;
}

export function PostCard({
  post,
  role,
  userVote,
  onVote,
  onComment,
  commentText = "",
  onCommentChange,
}: PostCardProps) {
  const upvotes =
    post.votes?.filter((v) => v.voteType === "UPVOTE").length || 0;
  const downvotes =
    post.votes?.filter((v) => v.voteType === "DOWNVOTE").length || 0;

  return (
    <Card key={post.id} className="bg-white p-4">
      <Flex gap="3">
        <Avatar
          size="3"
          src={post.author?.avatar}
          fallback={post.author?.name?.charAt(0) || "U"}
          className="bg-mint-500"
        />
        <Flex direction="column" gap="2" className="flex-1">
          <div>
            <Flex align="center" gap="2">
              <Text weight="bold">{post.author?.name}</Text>
              {post.author?.groupName && (
                <Badge size="1" color="blue">
                  {post.author.groupName}
                </Badge>
              )}
              <Badge
                size="1"
                color={post.type === "ANNOUNCEMENT" ? "red" : "gray"}
              >
                {post.type === "ANNOUNCEMENT"
                  ? "Thông báo"
                  : post.type === "MATERIAL"
                  ? "Tài liệu"
                  : "Thảo luận"}
              </Badge>
            </Flex>
            <Text size="1" className="text-gray-500">
              {new Date(post.createdAt).toLocaleString("vi-VN")}
            </Text>
          </div>
          <Heading size="4">{post.title}</Heading>
          <Text size="2" className="text-gray-700">
            {post.content}
          </Text>

          {/* Vote buttons or counts */}
          {role === "student" && onVote ? (
            <Flex gap="3" align="center">
              <Flex gap="2">
                <Button
                  size="1"
                  variant={userVote?.voteType === "UPVOTE" ? "solid" : "soft"}
                  color={userVote?.voteType === "UPVOTE" ? "mint" : "gray"}
                  onClick={() => onVote(post.id, "UPVOTE")}
                >
                  <FiThumbsUp size={14} /> {upvotes}
                </Button>
                <Button
                  size="1"
                  variant={userVote?.voteType === "DOWNVOTE" ? "solid" : "soft"}
                  color={userVote?.voteType === "DOWNVOTE" ? "red" : "gray"}
                  onClick={() => onVote(post.id, "DOWNVOTE")}
                >
                  <FiThumbsDown size={14} /> {downvotes}
                </Button>
              </Flex>
              <Flex align="center" gap="1" className="text-gray-600">
                <FiMessageSquare size={16} />
                <Text size="2">{post.comments?.length || 0} bình luận</Text>
              </Flex>
            </Flex>
          ) : (
            <Flex gap="4" className="text-sm text-gray-600">
              <Flex align="center" gap="1">
                <FiThumbsUp size={16} />
                <Text size="2">{upvotes}</Text>
              </Flex>
              <Flex align="center" gap="1">
                <FiMessageSquare size={16} />
                <Text size="2">{post.comments?.length || 0} bình luận</Text>
              </Flex>
            </Flex>
          )}

          {/* Comments */}
          {post.comments && post.comments.length > 0 && (
            <Flex
              direction="column"
              gap="2"
              className="mt-3 pl-4 border-l-2 border-mint-200"
            >
              {post.comments.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))}
            </Flex>
          )}

          {/* Comment input - only for students */}
          {role === "student" && onComment && onCommentChange && (
            <Flex gap="2" className="mt-2">
              <TextField.Root
                placeholder="Viết bình luận..."
                value={commentText}
                onChange={(e) => onCommentChange(post.id, e.target.value)}
                className="flex-1"
              />
              <Button
                size="2"
                onClick={() => onComment(post.id)}
                className="bg-mint-500"
              >
                <FiSend size={14} />
              </Button>
            </Flex>
          )}
        </Flex>
      </Flex>
    </Card>
  );
}

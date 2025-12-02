"use client";

import {
  Avatar,
  Badge,
  Button,
  Card,
  Flex,
  Heading,
  Text,
  TextField,
  IconButton,
  Dialog,
  TextArea,
  Select,
} from "@radix-ui/themes";
import {
  FiMessageSquare,
  FiSend,
  FiThumbsDown,
  FiThumbsUp,
  FiEdit2,
  FiTrash2,
  FiPaperclip,
} from "react-icons/fi";
import { CommentCard } from "./CommentCard";
import { AttachmentCard } from "./AttachmentCard";
import { useState } from "react";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    type: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    authorId: string;
    author?: {
      id: string;
      name: string;
      avatar?: string;
      groupName?: string;
    };
    comments?: Array<{
      id: string;
      content: string;
      createdAt: Date | string;
      updatedAt: Date | string;
      authorId: string;
      author?: {
        id: string;
        name: string;
        avatar?: string;
        groupName?: string;
      };
      votes?: Array<{
        voteType: string;
        userId: string;
      }>;
      attachments?: Array<{
        id: string;
        fileName: string;
        fileUrl: string;
        fileSize?: number | null;
        mimeType?: string | null;
      }>;
    }>;
    votes?: Array<{
      voteType: string;
      userId: string;
    }>;
    attachments?: Array<{
      id: string;
      fileName: string;
      fileUrl: string;
      fileSize?: number | null;
      mimeType?: string | null;
    }>;
  };
  currentUserId: string;
  userVote?: { voteType: string } | null;
  onVote?: (postId: string, voteType: "UPVOTE" | "DOWNVOTE") => void;
  onComment?: (postId: string, content: string) => void;
  onEdit?: (
    postId: string,
    title: string,
    content: string,
    type: string
  ) => void;
  onDelete?: (postId: string) => void;
  onCommentVote?: (commentId: string, voteType: "UPVOTE" | "DOWNVOTE") => void;
  onCommentEdit?: (commentId: string, content: string) => void;
  onCommentDelete?: (commentId: string) => void;
  commentSortOrder?: "time" | "votes";
  onCommentSortChange?: (order: "time" | "votes") => void;
}

export function PostCard({
  post,
  currentUserId,
  userVote,
  onVote,
  onComment,
  onEdit,
  onDelete,
  onCommentVote,
  onCommentEdit,
  onCommentDelete,
  commentSortOrder = "time",
  onCommentSortChange,
}: PostCardProps) {
  const [commentText, setCommentText] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);
  const [editType, setEditType] = useState(post.type);

  const upvotes =
    post.votes?.filter((v) => v.voteType === "UPVOTE").length || 0;
  const downvotes =
    post.votes?.filter((v) => v.voteType === "DOWNVOTE").length || 0;
  const isAuthor = post.authorId === currentUserId;

  // Sort comments
  const sortedComments = post.comments ? [...post.comments] : [];
  if (commentSortOrder === "votes") {
    sortedComments.sort((a, b) => {
      const aUpvotes =
        a.votes?.filter((v) => v.voteType === "UPVOTE").length || 0;
      const bUpvotes =
        b.votes?.filter((v) => v.voteType === "UPVOTE").length || 0;
      return bUpvotes - aUpvotes;
    });
  } else {
    sortedComments.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  const handleEditPost = () => {
    if (onEdit) {
      onEdit(post.id, editTitle, editContent, editType);
      setIsEditDialogOpen(false);
    }
  };

  const handleCommentSubmit = () => {
    if (commentText.trim() && onComment) {
      onComment(post.id, commentText);
      setCommentText("");
    }
  };

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
            <Flex align="center" gap="2" justify="between">
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
              {isAuthor && (
                <Flex gap="1">
                  <IconButton
                    size="1"
                    variant="soft"
                    color="gray"
                    onClick={() => setIsEditDialogOpen(true)}
                  >
                    <FiEdit2 size={14} />
                  </IconButton>
                  <IconButton
                    size="1"
                    variant="soft"
                    color="red"
                    onClick={() => onDelete && onDelete(post.id)}
                  >
                    <FiTrash2 size={14} />
                  </IconButton>
                </Flex>
              )}
            </Flex>
            <Text size="1" className="text-gray-500">
              {new Date(post.createdAt).toLocaleString("vi-VN")}
              {post.updatedAt !== post.createdAt && " (đã chỉnh sửa)"}
            </Text>
          </div>
          <Heading size="4">{post.title}</Heading>
          <Text size="2" className="text-gray-700 whitespace-pre-wrap">
            {post.content}
          </Text>

          {/* Attachments */}
          {post.attachments && post.attachments.length > 0 && (
            <Flex direction="column" gap="2" className="mt-2">
              {post.attachments.map((att) => (
                <AttachmentCard key={att.id} attachment={att} />
              ))}
            </Flex>
          )}

          {/* Vote buttons */}
          {onVote && (
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
          )}

          {/* Comments section */}
          {post.comments && post.comments.length > 0 && (
            <Flex direction="column" gap="3" className="mt-3">
              <Flex justify="between" align="center">
                <Text size="2" weight="bold" className="text-gray-700">
                  Bình luận ({post.comments.length})
                </Text>
                {onCommentSortChange && (
                  <Select.Root
                    value={commentSortOrder}
                    onValueChange={(value) =>
                      onCommentSortChange(value as "time" | "votes")
                    }
                    size="1"
                  >
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="time">Thời gian</Select.Item>
                      <Select.Item value="votes">Lượt thích</Select.Item>
                    </Select.Content>
                  </Select.Root>
                )}
              </Flex>
              <Flex
                direction="column"
                gap="2"
                className="pl-4 border-l-2 border-mint-200"
              >
                {sortedComments.map((comment) => {
                  const userCommentVote = comment.votes?.find(
                    (v) => v.userId === currentUserId
                  );
                  return (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      currentUserId={currentUserId}
                      userVote={userCommentVote}
                      onVote={onCommentVote}
                      onEdit={onCommentEdit}
                      onDelete={onCommentDelete}
                    />
                  );
                })}
              </Flex>
            </Flex>
          )}

          {/* Comment input */}
          {onComment && (
            <Flex gap="2" className="mt-2">
              <TextField.Root
                placeholder="Viết bình luận..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleCommentSubmit();
                  }
                }}
                className="flex-1"
              />
              <Button
                size="2"
                onClick={handleCommentSubmit}
                className="bg-mint-500"
                disabled={!commentText.trim()}
              >
                <FiSend size={14} />
              </Button>
            </Flex>
          )}
        </Flex>
      </Flex>

      {/* Edit Dialog */}
      <Dialog.Root open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <Dialog.Content style={{ maxWidth: 600 }}>
          <Dialog.Title>Chỉnh sửa bài viết</Dialog.Title>
          <Flex direction="column" gap="3" className="mt-4">
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Tiêu đề
              </Text>
              <TextField.Root
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Nhập tiêu đề"
              />
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Loại bài viết
              </Text>
              <Select.Root value={editType} onValueChange={setEditType}>
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="DISCUSSION">Thảo luận</Select.Item>
                  <Select.Item value="ANNOUNCEMENT">Thông báo</Select.Item>
                  <Select.Item value="MATERIAL">Tài liệu</Select.Item>
                </Select.Content>
              </Select.Root>
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Nội dung
              </Text>
              <TextArea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Nhập nội dung"
                rows={6}
              />
            </label>
            <Flex gap="3" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Hủy
                </Button>
              </Dialog.Close>
              <Button
                onClick={handleEditPost}
                className="bg-mint-500"
                disabled={!editTitle.trim() || !editContent.trim()}
              >
                Lưu thay đổi
              </Button>
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Card>
  );
}

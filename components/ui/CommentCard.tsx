"use client";

import {
  Avatar,
  Badge,
  Flex,
  Text,
  Button,
  IconButton,
  Dialog,
  TextArea,
} from "@radix-ui/themes";
import { FiThumbsUp, FiThumbsDown, FiEdit2, FiTrash2 } from "react-icons/fi";
import { AttachmentCard } from "./AttachmentCard";
import { useState } from "react";

interface CommentCardProps {
  comment: {
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
  };
  currentUserId: string;
  userVote?: { voteType: string } | null;
  onVote?: (commentId: string, voteType: "UPVOTE" | "DOWNVOTE") => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
}

export function CommentCard({
  comment,
  currentUserId,
  userVote,
  onVote,
  onEdit,
  onDelete,
}: CommentCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const upvotes =
    comment.votes?.filter((v) => v.voteType === "UPVOTE").length || 0;
  const downvotes =
    comment.votes?.filter((v) => v.voteType === "DOWNVOTE").length || 0;
  const isAuthor = comment.authorId === currentUserId;

  const handleEditComment = () => {
    if (onEdit && editContent.trim()) {
      onEdit(comment.id, editContent);
      setIsEditDialogOpen(false);
    }
  };

  return (
    <Flex gap="2" direction="column" className="bg-gray-50 p-3 rounded-md">
      <Flex gap="2">
        <Avatar
          size="1"
          src={comment.author?.avatar}
          fallback={comment.author?.name?.charAt(0) || "U"}
          className="bg-gray-400"
        />
        <div className="flex-1">
          <Flex align="center" gap="1" justify="between">
            <Flex align="center" gap="1" wrap="wrap">
              <Text size="1" weight="bold">
                {comment.author?.name}
              </Text>
              {comment.author?.groupName && (
                <Badge size="1" color="blue">
                  {comment.author.groupName}
                </Badge>
              )}
              <Text size="1" className="text-gray-500">
                • {new Date(comment.createdAt).toLocaleDateString("vi-VN")}
                {comment.updatedAt !== comment.createdAt && " (đã sửa)"}
              </Text>
            </Flex>
            {isAuthor && (
              <Flex gap="1">
                <IconButton
                  size="1"
                  variant="soft"
                  color="gray"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <FiEdit2 size={12} />
                </IconButton>
                <IconButton
                  size="1"
                  variant="soft"
                  color="red"
                  onClick={() => onDelete && onDelete(comment.id)}
                >
                  <FiTrash2 size={12} />
                </IconButton>
              </Flex>
            )}
          </Flex>
          <Text size="2" className="text-gray-700 mt-1 whitespace-pre-wrap">
            {comment.content}
          </Text>

          {/* Attachments */}
          {comment.attachments && comment.attachments.length > 0 && (
            <Flex direction="column" gap="2" className="mt-2">
              {comment.attachments.map((att) => (
                <AttachmentCard key={att.id} attachment={att} />
              ))}
            </Flex>
          )}

          {/* Vote buttons */}
          {onVote && (
            <Flex gap="1" className="mt-2">
              <Button
                size="1"
                variant={userVote?.voteType === "UPVOTE" ? "solid" : "soft"}
                color={userVote?.voteType === "UPVOTE" ? "mint" : "gray"}
                onClick={() => onVote(comment.id, "UPVOTE")}
              >
                <FiThumbsUp size={12} /> {upvotes}
              </Button>
              <Button
                size="1"
                variant={userVote?.voteType === "DOWNVOTE" ? "solid" : "soft"}
                color={userVote?.voteType === "DOWNVOTE" ? "red" : "gray"}
                onClick={() => onVote(comment.id, "DOWNVOTE")}
              >
                <FiThumbsDown size={12} /> {downvotes}
              </Button>
            </Flex>
          )}
        </div>
      </Flex>

      {/* Edit Dialog */}
      <Dialog.Root open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <Dialog.Content style={{ maxWidth: 500 }}>
          <Dialog.Title>Chỉnh sửa bình luận</Dialog.Title>
          <Flex direction="column" gap="3" className="mt-4">
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Nội dung
              </Text>
              <TextArea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Nhập nội dung"
                rows={4}
              />
            </label>
            <Flex gap="3" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Hủy
                </Button>
              </Dialog.Close>
              <Button
                onClick={handleEditComment}
                className="bg-mint-500"
                disabled={!editContent.trim()}
              >
                Lưu thay đổi
              </Button>
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Flex>
  );
}

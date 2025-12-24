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
  Tooltip,
} from "@radix-ui/themes";
import {
  FiMessageSquare,
  FiSend,
  FiThumbsDown,
  FiThumbsUp,
  FiEdit2,
  FiTrash2,
  FiPaperclip,
  FiMapPin,
  FiCheckCircle,
  FiCheck,
} from "react-icons/fi";
import { CommentCard } from "./CommentCard";
import { AttachmentCard } from "./AttachmentCard";
import { FilePickerInput, FileAttachment } from "./FilePickerInput";
import { VoteButtons } from "./VoteButtons";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    type: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    authorId: string;
    pinned?: boolean;
    resolved?: boolean;
    resolvedCommentId?: string | null;
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
  onComment?: (
    postId: string,
    content: string,
    attachments?: FileAttachment[]
  ) => void;
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
  isTeacher?: boolean;
  onPin?: (postId: string, pinned: boolean) => void;
  onResolve?: (postId: string, resolved: boolean, commentId?: string) => void;
  onMarkAnswer?: (postId: string, commentId: string, isCurrentAnswer: boolean) => void;
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
  isTeacher = false,
  onPin,
  onResolve,
  onMarkAnswer,
}: PostCardProps) {
  const tPostActions = useTranslations('posts.actions');
  const tPostTypes = useTranslations('posts.types');
  const tPostDialogs = useTranslations('posts.dialogs');
  const [commentText, setCommentText] = useState("");
  const [commentAttachments, setCommentAttachments] = useState<
    FileAttachment[]
  >([]);
  const [showCommentAttachments, setShowCommentAttachments] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);
  const [editType, setEditType] = useState(post.type);

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
      onComment(
        post.id,
        commentText,
        commentAttachments.length > 0 ? commentAttachments : undefined
      );
      setCommentText("");
      setCommentAttachments([]);
      setShowCommentAttachments(false);
    }
  };

  return (
    <Card key={post.id} className="bg-white p-4">
      <Flex gap="3">
        {/* Vote Buttons - Reddit Style */}
        {onVote && (
          <VoteButtons
            votes={post.votes}
            userVote={userVote}
            onVote={(voteType) => onVote(post.id, voteType)}
            size="medium"
          />
        )}

        {/* Post Avatar and Content */}
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
                    ? tPostTypes('announcement')
                    : post.type === "MATERIAL"
                    ? tPostTypes('material')
                    : tPostTypes('discussion')}
                </Badge>
                {post.pinned && (
                  <Badge size="1" color="orange">
                    <FiMapPin size={12} /> {tPostActions('pinned')}
                  </Badge>
                )}
                {post.resolved && (
                  <Badge size="1" color="green">
                    <FiCheckCircle size={12} /> {tPostActions('resolved')}
                  </Badge>
                )}
              </Flex>
              <Flex gap="1">
                {isTeacher && onPin && (
                  <Tooltip content={post.pinned ? tPostActions('unpin_post') : tPostActions('pin_post')}>
                    <IconButton
                      size="1"
                      variant="ghost"
                      color={post.pinned ? "orange" : "gray"}
                      onClick={() => onPin(post.id, post.pinned || false)}
                    >
                      <FiMapPin size={14} />
                    </IconButton>
                  </Tooltip>
                )}
                {isTeacher && onResolve && (
                  <Tooltip content={post.resolved ? tPostActions('unresolve_post') : tPostActions('resolve_post')}>
                    <IconButton
                      size="1"
                      variant="ghost"
                      color={post.resolved ? "green" : "gray"}
                      onClick={() => onResolve(post.id, post.resolved || false, post.resolvedCommentId || undefined)}
                    >
                      <FiCheckCircle size={14} />
                    </IconButton>
                  </Tooltip>
                )}
                {isAuthor && (
                  <>
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
                  </>
                )}
              </Flex>
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
              {post.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 bg-mint-50 hover:bg-mint-100 rounded-md transition-colors"
                >
                  <FiPaperclip size={16} className="text-mint-600" />
                  <Text size="2" className="text-mint-600 font-medium">
                    {attachment.fileName}
                  </Text>
                  {attachment.fileSize && (
                    <Text size="1" className="text-gray-500">
                      ({Math.round(attachment.fileSize / 1024)} KB)
                    </Text>
                  )}
                </a>
              ))}
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
                  const isCorrectAnswer = post.resolvedCommentId === comment.id;
                  return (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      currentUserId={currentUserId}
                      userVote={userCommentVote}
                      onVote={onCommentVote}
                      onEdit={onCommentEdit}
                      onDelete={onCommentDelete}
                      isCorrectAnswer={isCorrectAnswer}
                      isTeacher={isTeacher}
                      onMarkAnswer={
                        onMarkAnswer
                          ? (commentId, isCurrentAnswer) =>
                              onMarkAnswer(post.id, commentId, isCurrentAnswer)
                          : undefined
                      }
                    />
                  );
                })}
              </Flex>
            </Flex>
          )}

          {/* Comment input */}
          {onComment && (
            <Flex direction="column" gap="2" className="mt-2">
              <Flex gap="2">
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
                <IconButton
                  size="2"
                  variant="soft"
                  onClick={() =>
                    setShowCommentAttachments(!showCommentAttachments)
                  }
                >
                  <FiPaperclip size={14} />
                </IconButton>
                <Button
                  size="2"
                  onClick={handleCommentSubmit}
                  className="bg-mint-500"
                  disabled={!commentText.trim()}
                >
                  <FiSend size={14} />
                </Button>
              </Flex>
              {showCommentAttachments && (
                <FilePickerInput
                  attachments={commentAttachments}
                  onAttachmentsChange={setCommentAttachments}
                  maxFiles={3}
                />
              )}
            </Flex>
          )}
        </Flex>
      </Flex>

      {/* Edit Dialog */}
      <Dialog.Root open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <Dialog.Content style={{ maxWidth: 600 }}>
          <Dialog.Title>{tPostDialogs('edit_post')}</Dialog.Title>
          <Flex direction="column" gap="3" className="mt-4">
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                {tPostDialogs('title_label')}
              </Text>
              <TextField.Root
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder={tPostDialogs('title_placeholder')}
              />
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                {tPostDialogs('type_label')}
              </Text>
              <Select.Root value={editType} onValueChange={setEditType}>
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="DISCUSSION">{tPostTypes('discussion')}</Select.Item>
                  <Select.Item value="ANNOUNCEMENT">{tPostTypes('announcement')}</Select.Item>
                  <Select.Item value="MATERIAL">{tPostTypes('material')}</Select.Item>
                </Select.Content>
              </Select.Root>
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                {tPostDialogs('content_label')}
              </Text>
              <TextArea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder={tPostDialogs('content_placeholder')}
                rows={6}
              />
            </label>
            <Flex gap="3" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  {tPostDialogs('cancel')}
                </Button>
              </Dialog.Close>
              <Button
                onClick={handleEditPost}
                className="bg-mint-500"
                disabled={!editTitle.trim() || !editContent.trim()}
              >
                {tPostDialogs('save_changes')}
              </Button>
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Card>
  );
}

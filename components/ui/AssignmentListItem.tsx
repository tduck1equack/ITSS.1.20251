"use client";

import React, { useState } from "react";
import {
  Card,
  Flex,
  Text,
  Badge,
  Button,
  Avatar,
  Separator,
} from "@radix-ui/themes";
import {
  FiCalendar,
  FiUsers,
  FiFile,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiEdit,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
  FiUpload,
  FiDownload,
  FiLock,
  FiRefreshCw,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AssignmentUploadDialog } from "./AssignmentUploadDialog";

interface AssignmentListItemProps {
  assignment: {
    id: string;
    title: string;
    description?: string | null;
    dueDate: Date | string;
    maxPoints: number;
    status: string;
    isSeparateSubmission?: boolean;
    group?: {
      id: string;
      name: string;
    } | null;
    createdBy?: {
      name: string;
      avatar?: string | null;
    };
    attachments?: Array<{
      id: string;
      fileName: string;
      fileUrl: string;
      fileSize?: number | null;
      mimeType?: string | null;
    }>;
    _count?: {
      submissions: number;
    };
    class?: {
      id: string;
      name: string;
      code: string;
    };
  };
  submission?: {
    id: string;
    status: string;
    submittedAt?: Date | string | null;
    grade?: number | null;
    feedback?: string | null;
    attachments?: Array<{
      id: string;
      fileName: string;
      fileUrl: string;
      fileSize?: number | null;
    }>;
  } | null;
  showClass?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  isStudent?: boolean;
  currentUserId?: string;
  userGroupId?: string | null;
  onEdit?: () => void;
  onDelete?: () => void;
  onSubmit?: () => void;
  onUploadComplete?: () => void;
}

export function AssignmentListItem({
  assignment,
  submission,
  showClass = false,
  canEdit = false,
  canDelete = false,
  isStudent = false,
  currentUserId,
  userGroupId,
  onEdit,
  onDelete,
  onSubmit,
  onUploadComplete,
}: AssignmentListItemProps) {
  const router = useRouter();
  const t = useTranslations('assignments.general');
  const tStatus = useTranslations('assignments.status');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dueDate = new Date(assignment.dueDate);
  const now = new Date();
  const isOverdue =
    dueDate < now && (!submission || submission.status !== "SUBMITTED");
  const isPastDue = dueDate < now;
  const daysUntilDue = Math.ceil(
    (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  const hasSubmittedFiles =
    submission?.attachments && submission.attachments.length > 0;

  const getStatusBadge = () => {
    if (submission) {
      switch (submission.status) {
        case "SUBMITTED":
          return (
            <Badge color="blue" variant="soft">
              <FiCheckCircle size={12} /> {tStatus('submitted')}
            </Badge>
          );
        case "GRADED":
          return (
            <Badge color="green" variant="soft">
              <FiCheckCircle size={12} /> {tStatus('graded')}
            </Badge>
          );
        case "LATE":
          return (
            <Badge color="orange" variant="soft">
              <FiAlertCircle size={12} /> {tStatus('late')}
            </Badge>
          );
        default:
          return (
            <Badge color="gray" variant="soft">
              <FiClock size={12} /> {tStatus('draft')}
            </Badge>
          );
      }
    }

    if (isOverdue) {
      return (
        <Badge color="red" variant="soft">
          <FiAlertCircle size={12} /> {tStatus('overdue')}
        </Badge>
      );
    }

    if (daysUntilDue <= 1) {
      return (
        <Badge color="orange" variant="soft">
          <FiClock size={12} /> {tStatus('due_soon')}
        </Badge>
      );
    }

    return (
      <Badge color="mint" variant="soft">
        {tStatus('open')}
      </Badge>
    );
  };

  const handleTurnIn = async () => {
    if (!hasSubmittedFiles || !currentUserId) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/assignments/${assignment.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: currentUserId,
          action: "submit",
          groupId:
            assignment.group && !assignment.isSeparateSubmission
              ? userGroupId
              : null,
        }),
      });

      if (response.ok) {
        onSubmit?.();
        onUploadComplete?.();
      }
    } catch (error) {
      console.error("Failed to submit assignment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnsubmit = async () => {
    if (!currentUserId) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/assignments/${assignment.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: currentUserId,
          action: "unsubmit",
        }),
      });

      if (response.ok) {
        onUploadComplete?.();
      }
    } catch (error) {
      console.error("Failed to unsubmit assignment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadComplete = (fileData: any) => {
    setIsUploadDialogOpen(false);
    onUploadComplete?.();
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getSubmitButtonContent = () => {
    if (submission?.status === "SUBMITTED" || submission?.status === "GRADED") {
      if (isPastDue) {
        return {
          icon: <FiLock size={16} />,
          text: "Đã khóa",
          disabled: true,
          color: "gray" as const,
        };
      }
      return {
        icon: <FiRefreshCw size={16} />,
        text: "Nộp lại",
        disabled: false,
        color: "orange" as const,
        action: handleUnsubmit,
      };
    }

    if (isPastDue) {
      return {
        icon: <FiLock size={16} />,
        text: "Quá hạn",
        disabled: true,
        color: "red" as const,
      };
    }

    return {
      icon: <FiCheckCircle size={16} />,
      text: "Nộp bài",
      disabled: !hasSubmittedFiles,
      color: "mint" as const,
      action: handleTurnIn,
    };
  };

  const submitButton = getSubmitButtonContent();

  return (
    <>
      <Card className="bg-white hover:shadow-md transition-shadow">
        <Flex direction="column" gap="3">
          {/* Header - Always Visible */}
          <Flex
            justify="between"
            align="start"
            gap="3"
            className="cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Flex direction="column" gap="2" className="flex-1 min-w-0">
              <Flex gap="2" align="center" wrap="wrap">
                <Text size="4" weight="bold" className="truncate">
                  {assignment.title}
                </Text>
                {getStatusBadge()}
                {assignment.group && (
                  <Badge color="purple" variant="soft">
                    <FiUsers size={12} /> {assignment.group.name}
                  </Badge>
                )}
                {assignment.group && !assignment.isSeparateSubmission && (
                  <Badge color="blue" variant="soft">
                    Nộp theo nhóm
                  </Badge>
                )}
              </Flex>

              {showClass && assignment.class && (
                <Flex gap="2" align="center">
                  <Badge color="gray" variant="outline">
                    {assignment.class.code}
                  </Badge>
                  <Text size="2" className="text-gray-600 truncate">
                    {assignment.class.name}
                  </Text>
                </Flex>
              )}
            </Flex>

            <Flex gap="2" align="center">
              {(canEdit || canDelete) && (
                <>
                  {canEdit && onEdit && (
                    <Button
                      size="2"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                      }}
                    >
                      <FiEdit size={16} />
                    </Button>
                  )}
                  {canDelete && onDelete && (
                    <Button
                      size="2"
                      color="red"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                    >
                      <FiTrash2 size={16} />
                    </Button>
                  )}
                </>
              )}
              <Button size="2" variant="ghost">
                {isExpanded ? (
                  <FiChevronUp size={20} />
                ) : (
                  <FiChevronDown size={20} />
                )}
              </Button>
            </Flex>
          </Flex>

          {/* Summary Footer */}
          <Flex justify="between" align="center" wrap="wrap" gap="3">
            <Flex gap="4" align="center" wrap="wrap">
              {/* Due Date */}
              <Flex gap="1" align="center">
                <FiCalendar size={14} className="text-gray-500" />
                <Text
                  size="2"
                  className={
                    isOverdue ? "text-red-600 font-medium" : "text-gray-600"
                  }
                >
                  {dueDate.toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </Flex>

              {/* Max Points */}
              <Flex gap="1" align="center">
                <Text size="2" weight="bold" className="text-mint-600">
                  {assignment.maxPoints} điểm
                </Text>
              </Flex>

              {/* Attachments */}
              {assignment.attachments && assignment.attachments.length > 0 && (
                <Flex gap="1" align="center">
                  <FiFile size={14} className="text-gray-500" />
                  <Text size="2" className="text-gray-600">
                    {assignment.attachments.length} tệp
                  </Text>
                </Flex>
              )}

              {/* Submission Count (Teacher View) */}
              {assignment._count?.submissions !== undefined && (
                <Flex gap="1" align="center">
                  <FiCheckCircle size={14} className="text-gray-500" />
                  <Text size="2" className="text-gray-600">
                    {assignment._count.submissions} bài nộp
                  </Text>
                </Flex>
              )}
            </Flex>

            {/* Graded Score */}
            {submission?.grade !== undefined && submission.grade !== null && (
              <Badge color="green" size="2">
                Điểm: {submission.grade}/{assignment.maxPoints}
              </Badge>
            )}

            {/* View Details Button */}
            <Button
              size="2"
              variant="soft"
              onClick={(e) => {
                e.stopPropagation();
                if (isStudent) {
                  router.push(`/dashboard/student/assignments/${assignment.id}`);
                } else if (canEdit || canDelete) {
                  router.push(`/dashboard/teacher/assignments/${assignment.id}`);
                }
              }}
            >
              {t('view_details')}
            </Button>
          </Flex>

          {/* Expanded Content */}
          {isExpanded && (
            <>
              <Separator size="4" />

              <Flex direction="column" gap="4">
                {/* Description */}
                {assignment.description && (
                  <div>
                    <Text size="2" weight="bold" className="block mb-2">
                      Mô tả:
                    </Text>
                    <Text size="2" className="text-gray-700">
                      {assignment.description}
                    </Text>
                  </div>
                )}

                {/* Assignment Attachments */}
                {assignment.attachments &&
                  assignment.attachments.length > 0 && (
                    <div>
                      <Text size="2" weight="bold" className="block mb-2">
                        Tệp đính kèm từ giáo viên:
                      </Text>
                      <Flex direction="column" gap="2">
                        {assignment.attachments.map((file) => (
                          <Card key={file.id} className="p-3 bg-gray-50">
                            <Flex justify="between" align="center">
                              <Flex
                                gap="2"
                                align="center"
                                className="flex-1 min-w-0"
                              >
                                <FiFile
                                  size={16}
                                  className="text-mint-600 shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <Text
                                    size="2"
                                    weight="medium"
                                    className="truncate block"
                                  >
                                    {file.fileName}
                                  </Text>
                                  <Text size="1" className="text-gray-500">
                                    {formatFileSize(file.fileSize)}
                                  </Text>
                                </div>
                              </Flex>
                              <Button size="1" variant="soft" asChild>
                                <a
                                  href={file.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download
                                >
                                  <FiDownload size={14} /> Tải về
                                </a>
                              </Button>
                            </Flex>
                          </Card>
                        ))}
                      </Flex>
                    </div>
                  )}

                {/* Student Submission Section */}
                {isStudent && currentUserId && (
                  <>
                    <Separator size="4" />

                    {/* Submitted Files */}
                    {submission?.attachments &&
                      submission.attachments.length > 0 && (
                        <div>
                          <Text size="2" weight="bold" className="block mb-2">
                            Bài nộp của bạn:
                          </Text>
                          <Flex direction="column" gap="2">
                            {submission.attachments.map((file) => (
                              <Card key={file.id} className="p-3 bg-mint-50">
                                <Flex justify="between" align="center">
                                  <Flex
                                    gap="2"
                                    align="center"
                                    className="flex-1 min-w-0"
                                  >
                                    <FiFile
                                      size={16}
                                      className="text-mint-600 shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <Text
                                        size="2"
                                        weight="medium"
                                        className="truncate block"
                                      >
                                        {file.fileName}
                                      </Text>
                                      <Text size="1" className="text-gray-500">
                                        {formatFileSize(file.fileSize)}
                                      </Text>
                                    </div>
                                  </Flex>
                                  <Button size="1" variant="soft" asChild>
                                    <a
                                      href={file.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download
                                    >
                                      <FiDownload size={14} /> Tải về
                                    </a>
                                  </Button>
                                </Flex>
                              </Card>
                            ))}
                          </Flex>
                        </div>
                      )}

                    {/* Upload and Submit Buttons */}
                    <Flex gap="3" align="center" wrap="wrap">
                      <Button
                        size="3"
                        variant="soft"
                        onClick={() => setIsUploadDialogOpen(true)}
                        disabled={
                          isPastDue &&
                          submission?.status !== "SUBMITTED" &&
                          submission?.status !== "GRADED"
                        }
                      >
                        <FiUpload size={16} />
                        {hasSubmittedFiles ? "Thêm/Sửa tệp" : "Tải tệp lên"}
                      </Button>

                      <Button
                        size="3"
                        color={submitButton.color}
                        disabled={submitButton.disabled || isSubmitting}
                        onClick={submitButton.action}
                      >
                        {submitButton.icon}
                        {isSubmitting ? "Đang xử lý..." : submitButton.text}
                      </Button>

                      {submission?.submittedAt && (
                        <Text size="2" className="text-gray-600">
                          Nộp lúc:{" "}
                          {new Date(submission.submittedAt).toLocaleString(
                            "vi-VN"
                          )}
                        </Text>
                      )}
                    </Flex>

                    {/* Group Submission Notice */}
                    {assignment.group && !assignment.isSeparateSubmission && (
                      <Card className="p-3 bg-blue-50 border-blue-200">
                        <Flex gap="2" align="start">
                          <FiUsers
                            size={16}
                            className="text-blue-600 mt-1 shrink-0"
                          />
                          <Text size="2" className="text-blue-900">
                            Đây là bài tập nhóm. Chỉ cần một thành viên nộp bài
                            cho cả nhóm.
                            {userGroupId === assignment.group.id
                              ? " Bạn có thể nộp bài thay cho nhóm."
                              : " Bạn không thuộc nhóm này."}
                          </Text>
                        </Flex>
                      </Card>
                    )}

                    {/* Feedback */}
                    {submission?.feedback && (
                      <div>
                        <Text size="2" weight="bold" className="block mb-2">
                          Nhận xét của giáo viên:
                        </Text>
                        <Card className="p-3 bg-yellow-50">
                          <Text size="2" className="text-gray-700">
                            {submission.feedback}
                          </Text>
                        </Card>
                      </div>
                    )}
                  </>
                )}

                {/* Teacher Info */}
                {assignment.createdBy && (
                  <Flex gap="2" align="center">
                    <Avatar
                      size="2"
                      fallback={assignment.createdBy.name.charAt(0)}
                      src={assignment.createdBy.avatar || undefined}
                    />
                    <div>
                      <Text size="1" className="text-gray-500">
                        Giáo viên
                      </Text>
                      <Text size="2" weight="medium">
                        {assignment.createdBy.name}
                      </Text>
                    </div>
                  </Flex>
                )}
              </Flex>
            </>
          )}
        </Flex>
      </Card>

      {/* Upload Dialog */}
      {isStudent && currentUserId && (
        <AssignmentUploadDialog
          open={isUploadDialogOpen}
          onOpenChange={setIsUploadDialogOpen}
          assignmentId={assignment.id}
          studentId={currentUserId}
          onUpload={handleUploadComplete}
        />
      )}
    </>
  );
}

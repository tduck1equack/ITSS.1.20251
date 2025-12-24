"use client";

import React from "react";
import { Card, Flex, Text, Badge, Button, Avatar } from "@radix-ui/themes";
import {
  FiCalendar,
  FiUsers,
  FiFile,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface AssignmentCardProps {
  assignment: {
    id: string;
    title: string;
    description?: string | null;
    dueDate: Date | string;
    maxPoints: number;
    status: string;
    group?: {
      id: string;
      name: string;
    } | null;
    createdBy?: {
      name: string;
      avatar?: string | null;
    };
    attachments?: Array<{ id: string; fileName: string }>;
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
  } | null;
  showClass?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function AssignmentCard({
  assignment,
  submission,
  showClass = false,
  canEdit = false,
  canDelete = false,
  onEdit,
  onDelete,
}: AssignmentCardProps) {
  const router = useRouter();
  const t = useTranslations('assignments.general');
  const tStatus = useTranslations('assignments.status');
  const dueDate = new Date(assignment.dueDate);
  const now = new Date();
  const isOverdue =
    dueDate < now && (!submission || submission.status !== "SUBMITTED");
  const daysUntilDue = Math.ceil(
    (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

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

  const handleClick = () => {
    if (assignment.class) {
      if (showClass) {
        // Student view - navigate to student assignment detail
        router.push(`/dashboard/student/assignments/${assignment.id}`);
      } else if (canEdit || canDelete) {
        // Teacher view - navigate to teacher assignment detail
        router.push(`/dashboard/teacher/assignments/${assignment.id}`);
      }
    }
  };

  return (
    <Card
      className="bg-white hover:shadow-md transition-shadow"
    >
      <Flex direction="column" gap="3">
        {/* Header */}
        <Flex justify="between" align="start" gap="3">
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

            {assignment.description && (
              <Text size="2" className="text-gray-600 line-clamp-2">
                {assignment.description}
              </Text>
            )}
          </Flex>

          {(canEdit || canDelete) && (
            <Flex gap="2">
              {canEdit && onEdit && (
                <Button size="2" variant="ghost" onClick={onEdit}>
                  <FiEdit size={16} />
                </Button>
              )}
              {canDelete && onDelete && (
                <Button size="2" color="red" variant="ghost" onClick={onDelete}>
                  <FiTrash2 size={16} />
                </Button>
              )}
            </Flex>
          )}
        </Flex>

        {/* Footer */}
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
                {t('points', { points: assignment.maxPoints })}
              </Text>
            </Flex>

            {/* Attachments */}
            {assignment.attachments && assignment.attachments.length > 0 && (
              <Flex gap="1" align="center">
                <FiFile size={14} className="text-gray-500" />
                <Text size="2" className="text-gray-600">
                  {t('files', { count: assignment.attachments.length })}
                </Text>
              </Flex>
            )}

            {/* Submission Count (Teacher View) */}
            {assignment._count?.submissions !== undefined && (
              <Flex gap="1" align="center">
                <FiCheckCircle size={14} className="text-gray-500" />
                <Text size="2" className="text-gray-600">
                  {t('submissions', { count: assignment._count.submissions })}
                </Text>
              </Flex>
            )}
          </Flex>

          {/* Graded Score */}
          {submission?.grade !== undefined && submission.grade !== null && (
            <Badge color="green" size="2">
              {t('grade', { grade: submission.grade, maxPoints: assignment.maxPoints })}
            </Badge>
          )}

          {/* View Details Button */}
          <Button
            size="2"
            variant="soft"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            {t('view_details')}
          </Button>

          {/* Teacher Info */}
          {assignment.createdBy && (
            <Flex gap="2" align="center">
              <Avatar
                size="1"
                fallback={assignment.createdBy.name.charAt(0)}
                src={assignment.createdBy.avatar || undefined}
              />
              <Text size="1" className="text-gray-600">
                {assignment.createdBy.name}
              </Text>
            </Flex>
          )}
        </Flex>
      </Flex>
    </Card>
  );
}

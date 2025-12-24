"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Container,
  Heading,
  Text,
  Card,
  Flex,
  Button,
  Badge,
  Avatar,
  Separator,
} from "@radix-ui/themes";
import {
  FiArrowLeft,
  FiCalendar,
  FiUsers,
  FiFile,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiDownload,
  FiUpload,
  FiUser,
} from "react-icons/fi";
import DashboardNavBar from "@/components/ui/DashboardNavBar";
import { useStudentTabs } from "@/components/ui/StudentDashboardNav";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale, useTranslations } from "next-intl";
import axios from "@/lib/axios";
import Link from "next/link";

interface AssignmentDetails {
  assignment: {
    id: string;
    title: string;
    description: string | null;
    dueDate: string;
    maxPoints: number;
    status: string;
    class: {
      id: string;
      name: string;
      code: string;
    };
    group: {
      id: string;
      name: string;
    } | null;
    createdBy: {
      id: string;
      name: string;
      email: string;
      avatar: string | null;
    };
    attachments: Array<{
      id: string;
      fileName: string;
      fileUrl: string;
      fileSize: number | null;
      mimeType: string | null;
      uploadedAt: string;
    }>;
    _count: {
      submissions: number;
    };
  };
  submission: {
    id: string;
    status: string;
    content: string | null;
    submittedAt: string | null;
    grade: number | null;
    feedback: string | null;
    gradedAt: string | null;
    attachments: Array<{
      id: string;
      fileName: string;
      fileUrl: string;
      fileSize: number | null;
      mimeType: string | null;
      uploadedAt: string;
    }>;
  } | null;
}

export default function StudentAssignmentDetailPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const studentTabs = useStudentTabs();
  const t = useTranslations("assignments.details");
  const tCommon = useTranslations("common");

  const assignmentId = params.id as string;

  const [data, setData] = useState<AssignmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "STUDENT")) {
      router.push(`/${locale}/login`);
    }
  }, [user, authLoading, router, locale]);

  useEffect(() => {
    if (user && assignmentId) {
      fetchAssignmentDetails();
    }
  }, [user, assignmentId]);

  const fetchAssignmentDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/assignments/${assignmentId}/details?userId=${user?.id}`
      );
      setData(response.data);
    } catch (err: any) {
      console.error("Error fetching assignment details:", err);
      setError(err.response?.data?.error || "Failed to load assignment");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-mint-50">
        <DashboardNavBar tabs={studentTabs} />
        <Container size="4" className="py-8">
          <Text size="5" className="text-gray-600">
            {t("loading")}
          </Text>
        </Container>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-mint-50">
        <DashboardNavBar tabs={studentTabs} />
        <Container size="4" className="py-8">
          <Card>
            <Flex direction="column" gap="4" align="center" className="py-8">
              <FiAlertCircle size={48} className="text-red-500" />
              <Text size="5" weight="bold">
                {error || t("error_loading")}
              </Text>
              <Button onClick={() => router.back()}>
                <FiArrowLeft /> {tCommon("go_back")}
              </Button>
            </Flex>
          </Card>
        </Container>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const { assignment, submission } = data;
  const dueDate = new Date(assignment.dueDate);
  const now = new Date();
  const isOverdue =
    dueDate < now && (!submission || submission.status !== "SUBMITTED");

  const getStatusBadge = () => {
    if (submission) {
      switch (submission.status) {
        case "SUBMITTED":
          return (
            <Badge color="blue" size="2">
              <FiCheckCircle size={14} /> {t("status_submitted")}
            </Badge>
          );
        case "GRADED":
          return (
            <Badge color="green" size="2">
              <FiCheckCircle size={14} /> {t("status_graded")}
            </Badge>
          );
        case "LATE":
          return (
            <Badge color="orange" size="2">
              <FiAlertCircle size={14} /> {t("status_late")}
            </Badge>
          );
        default:
          return (
            <Badge color="gray" size="2">
              <FiClock size={14} /> {t("status_draft")}
            </Badge>
          );
      }
    }

    if (isOverdue) {
      return (
        <Badge color="red" size="2">
          <FiAlertCircle size={14} /> {t("status_overdue")}
        </Badge>
      );
    }

    return (
      <Badge color="mint" size="2">
        {t("status_open")}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-mint-50">
      <DashboardNavBar tabs={studentTabs} />

      <Container size="4" className="py-8">
        <Flex direction="column" gap="6">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.push(`/${locale}/dashboard/student/classes/${assignment.class.id}`)}
          >
            <FiArrowLeft /> {tCommon("back")}
          </Button>

          {/* Assignment Header */}
          <Card>
            <Flex direction="column" gap="4">
              <Flex justify="between" align="start" gap="4">
                <Flex direction="column" gap="3" className="flex-1">
                  <Heading size="6">{assignment.title}</Heading>
                  <Flex gap="2" wrap="wrap" align="center">
                    {getStatusBadge()}
                    {assignment.group && (
                      <Badge color="purple">
                        <FiUsers size={12} /> {assignment.group.name}
                      </Badge>
                    )}
                    <Badge color="gray" variant="outline">
                      {assignment.class.code}
                    </Badge>
                  </Flex>
                </Flex>
              </Flex>

              <Separator size="4" />

              {/* Assignment Info */}
              <Flex direction="column" gap="3">
                <Flex gap="6" wrap="wrap">
                  <Flex gap="2" align="center">
                    <FiCalendar size={18} className="text-gray-500" />
                    <Flex direction="column">
                      <Text size="1" className="text-gray-500">
                        {t("due_date")}
                      </Text>
                      <Text
                        size="2"
                        weight="medium"
                        className={isOverdue ? "text-red-600" : ""}
                      >
                        {dueDate.toLocaleDateString(locale, {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </Flex>
                  </Flex>

                  <Flex gap="2" align="center">
                    <Text size="1" className="text-gray-500">
                      {t("max_points")}:
                    </Text>
                    <Text size="3" weight="bold" className="text-mint-600">
                      {assignment.maxPoints}
                    </Text>
                  </Flex>

                  <Flex gap="2" align="center">
                    <Avatar
                      size="2"
                      fallback={assignment.createdBy.name.charAt(0)}
                      src={assignment.createdBy.avatar || undefined}
                    />
                    <Flex direction="column">
                      <Text size="1" className="text-gray-500">
                        {t("teacher")}
                      </Text>
                      <Text size="2" weight="medium">
                        {assignment.createdBy.name}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>

                {assignment.description && (
                  <>
                    <Separator size="4" />
                    <Flex direction="column" gap="2">
                      <Text size="2" weight="bold">
                        {t("description")}
                      </Text>
                      <Text size="2" className="text-gray-700 whitespace-pre-wrap">
                        {assignment.description}
                      </Text>
                    </Flex>
                  </>
                )}
              </Flex>
            </Flex>
          </Card>

          {/* Assignment Attachments */}
          {assignment.attachments.length > 0 && (
            <Card>
              <Flex direction="column" gap="3">
                <Text size="3" weight="bold">
                  <FiFile size={18} className="inline mr-2" />
                  {t("assignment_files")} ({assignment.attachments.length})
                </Text>
                <Separator size="4" />
                <Flex direction="column" gap="2">
                  {assignment.attachments.map((file) => (
                    <Card key={file.id} variant="surface">
                      <Flex justify="between" align="center">
                        <Flex gap="3" align="center" className="flex-1 min-w-0">
                          <FiFile size={20} className="text-mint-600 shrink-0" />
                          <Flex direction="column" className="flex-1 min-w-0">
                            <Text size="2" weight="medium" className="truncate">
                              {file.fileName}
                            </Text>
                            <Text size="1" className="text-gray-500">
                              {formatFileSize(file.fileSize)}
                            </Text>
                          </Flex>
                        </Flex>
                        <Button
                          size="2"
                          variant="soft"
                          onClick={() =>
                            handleDownload(file.fileUrl, file.fileName)
                          }
                        >
                          <FiDownload size={16} />
                        </Button>
                      </Flex>
                    </Card>
                  ))}
                </Flex>
              </Flex>
            </Card>
          )}

          {/* Submission Section */}
          <Card>
            <Flex direction="column" gap="4">
              <Flex justify="between" align="center">
                <Text size="4" weight="bold">
                  {t("your_submission")}
                </Text>
                {!submission || submission.status === "DRAFT" ? (
                  <Button className="bg-mint-500">
                    <FiUpload size={16} /> {t("submit_assignment")}
                  </Button>
                ) : null}
              </Flex>

              <Separator size="4" />

              {submission ? (
                <Flex direction="column" gap="4">
                  {/* Submission Status */}
                  <Flex gap="4" wrap="wrap">
                    {submission.submittedAt && (
                      <Flex direction="column">
                        <Text size="1" className="text-gray-500">
                          {t("submitted_at")}
                        </Text>
                        <Text size="2" weight="medium">
                          {new Date(submission.submittedAt).toLocaleDateString(
                            locale,
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </Text>
                      </Flex>
                    )}

                    {submission.grade !== null && submission.grade !== undefined && (
                      <Flex direction="column">
                        <Text size="1" className="text-gray-500">
                          {t("grade")}
                        </Text>
                        <Text size="3" weight="bold" className="text-green-600">
                          {submission.grade}/{assignment.maxPoints}
                        </Text>
                      </Flex>
                    )}
                  </Flex>

                  {/* Submission Content */}
                  {submission.content && (
                    <Flex direction="column" gap="2">
                      <Text size="2" weight="bold">
                        {t("submission_content")}
                      </Text>
                      <Text size="2" className="text-gray-700 whitespace-pre-wrap">
                        {submission.content}
                      </Text>
                    </Flex>
                  )}

                  {/* Submission Files */}
                  {submission.attachments.length > 0 && (
                    <Flex direction="column" gap="2">
                      <Text size="2" weight="bold">
                        {t("submitted_files")} ({submission.attachments.length})
                      </Text>
                      <Flex direction="column" gap="2">
                        {submission.attachments.map((file) => (
                          <Card key={file.id} variant="surface">
                            <Flex justify="between" align="center">
                              <Flex gap="3" align="center" className="flex-1 min-w-0">
                                <FiFile size={20} className="text-blue-600 shrink-0" />
                                <Flex direction="column" className="flex-1 min-w-0">
                                  <Text size="2" weight="medium" className="truncate">
                                    {file.fileName}
                                  </Text>
                                  <Text size="1" className="text-gray-500">
                                    {formatFileSize(file.fileSize)}
                                  </Text>
                                </Flex>
                              </Flex>
                              <Button
                                size="2"
                                variant="soft"
                                onClick={() =>
                                  handleDownload(file.fileUrl, file.fileName)
                                }
                              >
                                <FiDownload size={16} />
                              </Button>
                            </Flex>
                          </Card>
                        ))}
                      </Flex>
                    </Flex>
                  )}

                  {/* Feedback */}
                  {submission.feedback && (
                    <Flex direction="column" gap="2">
                      <Text size="2" weight="bold">
                        {t("teacher_feedback")}
                      </Text>
                      <Card variant="surface" className="bg-blue-50">
                        <Text size="2" className="text-gray-700 whitespace-pre-wrap">
                          {submission.feedback}
                        </Text>
                      </Card>
                    </Flex>
                  )}
                </Flex>
              ) : (
                <Flex
                  direction="column"
                  align="center"
                  gap="3"
                  className="py-8 text-center"
                >
                  <FiUpload size={48} className="text-gray-400" />
                  <Text size="3" className="text-gray-600">
                    {t("no_submission")}
                  </Text>
                  <Button className="bg-mint-500">
                    <FiUpload size={16} /> {t("start_submission")}
                  </Button>
                </Flex>
              )}
            </Flex>
          </Card>
        </Flex>
      </Container>
    </div>
  );
}

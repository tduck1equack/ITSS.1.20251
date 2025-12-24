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
  Table,
  Tabs,
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
  FiUser,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";
import DashboardNavBar from "@/components/ui/DashboardNavBar";
import { useTeacherTabs } from "@/components/ui/TeacherDashboardNav";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale, useTranslations } from "next-intl";
import axios from "@/lib/axios";

interface AssignmentDetails {
  assignment: {
    id: string;
    title: string;
    description: string | null;
    dueDate: string;
    maxPoints: number;
    status: string;
    isSeparateSubmission: boolean;
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
}

interface Submission {
  id: string;
  status: string;
  content: string | null;
  submittedAt: string | null;
  grade: number | null;
  feedback: string | null;
  gradedAt: string | null;
  student: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    studentCode: string | null;
  };
  attachments: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number | null;
    mimeType: string | null;
    uploadedAt: string;
  }>;
}

export default function TeacherAssignmentDetailPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const teacherTabs = useTeacherTabs();
  const t = useTranslations("assignments.details");
  const tCommon = useTranslations("common");

  const assignmentId = params.id as string;

  const [data, setData] = useState<AssignmentDetails | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "TEACHER")) {
      router.push(`/${locale}/login`);
    }
  }, [user, authLoading, router, locale]);

  useEffect(() => {
    if (user && assignmentId) {
      fetchAssignmentDetails();
      fetchSubmissions();
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

  const fetchSubmissions = async () => {
    try {
      setSubmissionsLoading(true);
      const response = await axios.get(
        `/api/assignments/${assignmentId}/submissions?userId=${user?.id}`
      );
      setSubmissions(response.data.submissions);
    } catch (err: any) {
      console.error("Error fetching submissions:", err);
    } finally {
      setSubmissionsLoading(false);
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

  const getSubmissionStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return (
          <Badge color="blue" size="1">
            <FiCheckCircle size={12} /> {t("status_submitted")}
          </Badge>
        );
      case "GRADED":
        return (
          <Badge color="green" size="1">
            <FiCheckCircle size={12} /> {t("status_graded")}
          </Badge>
        );
      case "LATE":
        return (
          <Badge color="orange" size="1">
            <FiAlertCircle size={12} /> {t("status_late")}
          </Badge>
        );
      default:
        return (
          <Badge color="gray" size="1">
            <FiClock size={12} /> {t("status_draft")}
          </Badge>
        );
    }
  };

  const submittedCount = submissions.filter(
    (s) => s.status === "SUBMITTED" || s.status === "GRADED" || s.status === "LATE"
  ).length;
  const gradedCount = submissions.filter((s) => s.status === "GRADED").length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-mint-50">
        <DashboardNavBar tabs={teacherTabs} />
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
        <DashboardNavBar tabs={teacherTabs} />
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

  const { assignment } = data;
  const dueDate = new Date(assignment.dueDate);

  return (
    <div className="min-h-screen bg-mint-50">
      <DashboardNavBar tabs={teacherTabs} />

      <Container size="4" className="py-8">
        <Flex direction="column" gap="6">
          {/* Back Button */}
          <Flex justify="between" align="center">
            <Button
              variant="ghost"
              onClick={() =>
                router.push(
                  `/${locale}/dashboard/teacher/classes/${assignment.class.id}`
                )
              }
            >
              <FiArrowLeft /> {tCommon("back")}
            </Button>
            <Flex gap="2">
              <Button variant="soft">
                <FiEdit size={16} /> {tCommon("edit")}
              </Button>
              <Button variant="soft" color="red">
                <FiTrash2 size={16} /> {tCommon("delete")}
              </Button>
            </Flex>
          </Flex>

          {/* Assignment Header */}
          <Card>
            <Flex direction="column" gap="4">
              <Flex justify="between" align="start" gap="4">
                <Flex direction="column" gap="3" className="flex-1">
                  <Heading size="6">{assignment.title}</Heading>
                  <Flex gap="2" wrap="wrap" align="center">
                    <Badge color="mint" size="2">
                      {t("status_open")}
                    </Badge>
                    {assignment.group && (
                      <Badge color="purple" size="2">
                        <FiUsers size={12} /> {assignment.group.name}
                      </Badge>
                    )}
                    <Badge color="gray" variant="outline" size="2">
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
                      <Text size="2" weight="medium">
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
                    <FiCheckCircle size={18} className="text-gray-500" />
                    <Flex direction="column">
                      <Text size="1" className="text-gray-500">
                        {t("submissions")}
                      </Text>
                      <Text size="2" weight="medium">
                        {submittedCount} / {submissions.length}
                      </Text>
                    </Flex>
                  </Flex>

                  <Flex gap="2" align="center">
                    <Text size="1" className="text-gray-500">
                      {t("graded")}:
                    </Text>
                    <Text size="2" weight="medium" className="text-green-600">
                      {gradedCount}
                    </Text>
                  </Flex>
                </Flex>

                {assignment.description && (
                  <>
                    <Separator size="4" />
                    <Flex direction="column" gap="2">
                      <Text size="2" weight="bold">
                        {t("description")}
                      </Text>
                      <Text
                        size="2"
                        className="text-gray-700 whitespace-pre-wrap"
                      >
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
                          <FiFile
                            size={20}
                            className="text-mint-600 shrink-0"
                          />
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

          {/* Submissions List */}
          <Card>
            <Flex direction="column" gap="4">
              <Text size="4" weight="bold">
                {t("student_submissions")} ({submissions.length})
              </Text>
              <Separator size="4" />

              {submissionsLoading ? (
                <Text size="2" className="text-gray-600">
                  {t("loading")}
                </Text>
              ) : submissions.length === 0 ? (
                <Flex
                  direction="column"
                  align="center"
                  gap="3"
                  className="py-8"
                >
                  <FiUsers size={48} className="text-gray-400" />
                  <Text size="3" className="text-gray-600">
                    {t("no_submissions_yet")}
                  </Text>
                </Flex>
              ) : (
                <div className="overflow-x-auto">
                  <Table.Root variant="surface">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeaderCell>
                          {t("student")}
                        </Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>
                          {t("status")}
                        </Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>
                          {t("submitted_at")}
                        </Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>
                          {t("grade")}
                        </Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>
                          {t("files")}
                        </Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>
                          {tCommon("actions")}
                        </Table.ColumnHeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {submissions.map((submission) => (
                        <Table.Row key={submission.id}>
                          <Table.Cell>
                            <Flex gap="2" align="center">
                              <Avatar
                                size="2"
                                fallback={submission.student.name.charAt(0)}
                                src={submission.student.avatar || undefined}
                              />
                              <Flex direction="column">
                                <Text size="2" weight="medium">
                                  {submission.student.name}
                                </Text>
                                {submission.student.studentCode && (
                                  <Text size="1" className="text-gray-500">
                                    {submission.student.studentCode}
                                  </Text>
                                )}
                              </Flex>
                            </Flex>
                          </Table.Cell>
                          <Table.Cell>
                            {getSubmissionStatusBadge(submission.status)}
                          </Table.Cell>
                          <Table.Cell>
                            {submission.submittedAt ? (
                              <Text size="2">
                                {new Date(
                                  submission.submittedAt
                                ).toLocaleDateString(locale, {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </Text>
                            ) : (
                              <Text size="2" className="text-gray-500">
                                -
                              </Text>
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            {submission.grade !== null &&
                            submission.grade !== undefined ? (
                              <Text size="2" weight="bold" className="text-green-600">
                                {submission.grade}/{assignment.maxPoints}
                              </Text>
                            ) : (
                              <Text size="2" className="text-gray-500">
                                -
                              </Text>
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            {submission.attachments.length > 0 ? (
                              <Flex direction="column" gap="1">
                                {submission.attachments.map((file) => (
                                  <Button
                                    key={file.id}
                                    size="1"
                                    variant="ghost"
                                    onClick={() =>
                                      handleDownload(
                                        file.fileUrl,
                                        file.fileName
                                      )
                                    }
                                  >
                                    <FiFile size={14} />
                                    <Text size="1" className="truncate max-w-[150px]">
                                      {file.fileName}
                                    </Text>
                                  </Button>
                                ))}
                              </Flex>
                            ) : (
                              <Text size="2" className="text-gray-500">
                                -
                              </Text>
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            <Button size="1" variant="soft">
                              {t("view_details")}
                            </Button>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </div>
              )}
            </Flex>
          </Card>
        </Flex>
      </Container>
    </div>
  );
}

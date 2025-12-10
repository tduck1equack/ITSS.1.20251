"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import {
    Container,
    Heading,
    Text,
    Card,
    Flex,
    Button,
    Badge,
    Avatar,
} from "@radix-ui/themes";
import {
    FiCalendar,
    FiFileText,
    FiFile,
    FiCheckCircle,
    FiAlertCircle,
    FiClock,
    FiEdit,
    FiArrowLeft,
    FiDownload,
} from "react-icons/fi";
import DashboardNavBar from "@/components/ui/DashboardNavBar";
import { studentTabs } from "@/components/ui/StudentDashboardNav";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { SubmitAssignmentDialog } from "@/components/ui/SubmitAssignmentDialog";
import { FileAttachment } from "@/components/ui/FilePickerInput";

interface Assignment {
    id: string;
    title: string;
    description: string | null;
    dueDate: Date | string;
    maxPoints: number;
    status: string;
    createdBy: {
        id: string;
        name: string;
        avatar: string | null;
    };
    class: {
        id: string;
        name: string;
        code: string;
    };
    attachments: Array<{
        id: string;
        fileName: string;
        fileUrl: string;
        fileSize?: number | null;
        mimeType?: string | null;
    }>;
    submissions: Array<{
        id: string;
        content: string | null;
        submittedAt: Date | string | null;
        status: string;
        grade: number | null;
        feedback: string | null;
        gradedAt: Date | string | null;
        attachments: Array<{
            id: string;
            fileName: string;
            fileUrl: string;
            fileSize?: number | null;
            mimeType?: string | null;
        }>;
    }>;
}

export default function StudentAssignmentDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);

    const fetchAssignment = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(
                `/api/assignments/${id}?studentId=${user?.id}`
            );
            setAssignment(data);
        } catch (error) {
            console.error("Failed to fetch assignment:", error);
            toast.error("Không thể tải thông tin bài tập");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isLoading && (!user || user.role !== "STUDENT")) {
            router.push("/login");
        } else if (!isLoading && user && !assignment) {
            fetchAssignment();
        }
    }, [user, isLoading]);

    const handleSubmit = async (data: {
        content: string;
        attachments: FileAttachment[];
        status: "DRAFT" | "SUBMITTED";
    }) => {
        try {
            await axios.post(`/api/assignments/${id}/submissions`, {
                studentId: user?.id,
                content: data.content,
                attachments: data.attachments,
                status: data.status,
            });

            toast.success(
                data.status === "SUBMITTED" ? "Đã nộp bài tập" : "Đã lưu nháp",
                data.status === "SUBMITTED"
                    ? "Bài tập của bạn đã được nộp thành công"
                    : "Bài tập đã được lưu dưới dạng nháp"
            );
            setIsSubmitDialogOpen(false);
            fetchAssignment();
        } catch (error) {
            console.error("Failed to submit assignment:", error);
            toast.error("Không thể nộp bài tập");
            throw error;
        }
    };

    if (isLoading || loading) {
        return (
            <div className="min-h-screen bg-mint-50">
                <DashboardNavBar tabs={studentTabs} />
                <Container size="4" className="py-8">
                    <Text size="5" className="text-gray-600">
                        Đang tải...
                    </Text>
                </Container>
            </div>
        );
    }

    if (!user || !assignment) {
        return null;
    }

    const submission = assignment.submissions?.[0];
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    const isOverdue = dueDate < now && (!submission || submission.status !== "SUBMITTED");
    const canSubmit = assignment.status === "PUBLISHED" && (!submission || submission.status === "DRAFT");

    const getStatusBadge = () => {
        if (submission) {
            switch (submission.status) {
                case "SUBMITTED":
                    return (
                        <Badge color="blue" size="2">
                            <FiCheckCircle size={14} /> Đã nộp
                        </Badge>
                    );
                case "GRADED":
                    return (
                        <Badge color="green" size="2">
                            <FiCheckCircle size={14} /> Đã chấm điểm
                        </Badge>
                    );
                case "LATE":
                    return (
                        <Badge color="orange" size="2">
                            <FiAlertCircle size={14} /> Nộp trễ
                        </Badge>
                    );
                case "DRAFT":
                    return (
                        <Badge color="gray" size="2">
                            <FiClock size={14} /> Nháp
                        </Badge>
                    );
            }
        }

        if (isOverdue) {
            return (
                <Badge color="red" size="2">
                    <FiAlertCircle size={14} /> Quá hạn
                </Badge>
            );
        }

        return (
            <Badge color="mint" size="2">
                Chưa nộp
            </Badge>
        );
    };

    return (
        <div className="min-h-screen bg-mint-50">
            <DashboardNavBar tabs={studentTabs} />

            <Container size="3" className="py-8">
                <Flex direction="column" gap="6">
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        className="self-start"
                        onClick={() => router.back()}
                    >
                        <FiArrowLeft size={16} />
                        Quay lại
                    </Button>

                    {/* Assignment Header */}
                    <Card className="bg-white p-6">
                        <Flex direction="column" gap="4">
                            <Flex justify="between" align="start" wrap="wrap" gap="3">
                                <div>
                                    <Flex gap="3" align="center" mb="2">
                                        <Heading size="6">{assignment.title}</Heading>
                                        {getStatusBadge()}
                                    </Flex>
                                    <Flex gap="2" align="center">
                                        <Badge color="gray" variant="outline">
                                            {assignment.class.code}
                                        </Badge>
                                        <Text size="2" className="text-gray-600">
                                            {assignment.class.name}
                                        </Text>
                                    </Flex>
                                </div>

                                {canSubmit && (
                                    <Button
                                        className="bg-mint-500 hover:bg-mint-600"
                                        onClick={() => setIsSubmitDialogOpen(true)}
                                    >
                                        <FiEdit size={16} />
                                        {submission ? "Chỉnh sửa bài nộp" : "Nộp bài"}
                                    </Button>
                                )}
                            </Flex>

                            {/* Assignment Info */}
                            <Flex gap="6" wrap="wrap">
                                <Flex gap="2" align="center">
                                    <FiCalendar className="text-gray-500" />
                                    <div>
                                        <Text size="1" className="text-gray-500">
                                            Hạn nộp
                                        </Text>
                                        <Text
                                            size="2"
                                            weight="medium"
                                            className={isOverdue ? "text-red-600" : ""}
                                        >
                                            {dueDate.toLocaleDateString("vi-VN", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </Text>
                                    </div>
                                </Flex>

                                <Flex gap="2" align="center">
                                    <FiFileText className="text-gray-500" />
                                    <div>
                                        <Text size="1" className="text-gray-500">
                                            Điểm tối đa
                                        </Text>
                                        <Text size="2" weight="medium" className="text-mint-600">
                                            {assignment.maxPoints} điểm
                                        </Text>
                                    </div>
                                </Flex>

                                {submission?.grade !== null && submission?.grade !== undefined && (
                                    <Flex gap="2" align="center">
                                        <FiCheckCircle className="text-green-600" />
                                        <div>
                                            <Text size="1" className="text-gray-500">
                                                Điểm của bạn
                                            </Text>
                                            <Text size="2" weight="bold" className="text-green-600">
                                                {submission.grade}/{assignment.maxPoints}
                                            </Text>
                                        </div>
                                    </Flex>
                                )}
                            </Flex>

                            {/* Teacher Info */}
                            <Flex gap="2" align="center">
                                <Avatar
                                    size="2"
                                    src={assignment.createdBy.avatar || undefined}
                                    fallback={assignment.createdBy.name.charAt(0)}
                                />
                                <div>
                                    <Text size="1" className="text-gray-500">
                                        Giảng viên
                                    </Text>
                                    <Text size="2" weight="medium">
                                        {assignment.createdBy.name}
                                    </Text>
                                </div>
                            </Flex>
                        </Flex>
                    </Card>

                    {/* Assignment Description */}
                    {assignment.description && (
                        <Card className="bg-white p-6">
                            <Heading size="4" mb="3">
                                Mô tả
                            </Heading>
                            <Text className="whitespace-pre-wrap">
                                {assignment.description}
                            </Text>
                        </Card>
                    )}

                    {/* Assignment Attachments */}
                    {assignment.attachments && assignment.attachments.length > 0 && (
                        <Card className="bg-white p-6">
                            <Heading size="4" mb="3">
                                Tài liệu đính kèm
                            </Heading>
                            <Flex direction="column" gap="2">
                                {assignment.attachments.map((attachment) => (
                                    <a
                                        key={attachment.id}
                                        href={attachment.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                                    >
                                        <FiFile className="text-mint-600" size={20} />
                                        <div className="flex-1">
                                            <Text size="2" weight="medium">
                                                {attachment.fileName}
                                            </Text>
                                            {attachment.fileSize && (
                                                <Text size="1" className="text-gray-500">
                                                    {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB
                                                </Text>
                                            )}
                                        </div>
                                        <FiDownload className="text-gray-400" />
                                    </a>
                                ))}
                            </Flex>
                        </Card>
                    )}

                    {/* Student Submission */}
                    {submission && (
                        <Card className="bg-white p-6">
                            <Heading size="4" mb="3">
                                Bài nộp của bạn
                            </Heading>

                            {submission.content && (
                                <div className="mb-4">
                                    <Text size="2" weight="bold" className="text-gray-700 mb-2">
                                        Nội dung:
                                    </Text>
                                    <Text className="whitespace-pre-wrap">
                                        {submission.content}
                                    </Text>
                                </div>
                            )}

                            {submission.attachments && submission.attachments.length > 0 && (
                                <div className="mb-4">
                                    <Text size="2" weight="bold" className="text-gray-700 mb-2">
                                        Tệp đính kèm:
                                    </Text>
                                    <Flex direction="column" gap="2">
                                        {submission.attachments.map((attachment) => (
                                            <a
                                                key={attachment.id}
                                                href={attachment.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                                            >
                                                <FiFile className="text-mint-600" size={20} />
                                                <div className="flex-1">
                                                    <Text size="2" weight="medium">
                                                        {attachment.fileName}
                                                    </Text>
                                                    {attachment.fileSize && (
                                                        <Text size="1" className="text-gray-500">
                                                            {(attachment.fileSize / 1024 / 1024).toFixed(2)}{" "}
                                                            MB
                                                        </Text>
                                                    )}
                                                </div>
                                                <FiDownload className="text-gray-400" />
                                            </a>
                                        ))}
                                    </Flex>
                                </div>
                            )}

                            {submission.submittedAt && (
                                <Text size="2" className="text-gray-500">
                                    Nộp lúc:{" "}
                                    {new Date(submission.submittedAt).toLocaleString("vi-VN")}
                                </Text>
                            )}

                            {/* Feedback and Grade */}
                            {submission.status === "GRADED" && submission.feedback && (
                                <Card className="mt-4 bg-green-50 border border-green-200 p-4">
                                    <Text size="2" weight="bold" className="text-green-800 mb-2">
                                        Nhận xét của giảng viên:
                                    </Text>
                                    <Text className="text-green-900 whitespace-pre-wrap">
                                        {submission.feedback}
                                    </Text>
                                    {submission.gradedAt && (
                                        <Text size="1" className="text-green-700 mt-2">
                                            Chấm điểm lúc:{" "}
                                            {new Date(submission.gradedAt).toLocaleString("vi-VN")}
                                        </Text>
                                    )}
                                </Card>
                            )}
                        </Card>
                    )}

                    {/* Warning for overdue */}
                    {isOverdue && !submission && (
                        <Card className="bg-red-50 border border-red-200 p-4">
                            <Flex gap="3" align="center">
                                <FiAlertCircle className="text-red-600" size={24} />
                                <div>
                                    <Text weight="bold" className="text-red-800">
                                        Bài tập đã quá hạn nộp
                                    </Text>
                                    <Text size="2" className="text-red-700">
                                        Bạn vẫn có thể nộp bài nhưng sẽ được đánh dấu là nộp trễ.
                                    </Text>
                                </div>
                            </Flex>
                        </Card>
                    )}
                </Flex>
            </Container>

            {/* Submit Dialog */}
            <SubmitAssignmentDialog
                open={isSubmitDialogOpen}
                onOpenChange={setIsSubmitDialogOpen}
                onSubmit={handleSubmit}
                initialContent={submission?.content || ""}
                initialAttachments={
                    submission?.attachments?.map((a) => ({
                        fileName: a.fileName,
                        fileUrl: a.fileUrl,
                        fileSize: a.fileSize || 0,
                        mimeType: a.mimeType || "application/octet-stream",
                    })) || []
                }
                assignmentTitle={assignment.title}
                isDraft={!submission || submission.status === "DRAFT"}
            />
        </div>
    );
}

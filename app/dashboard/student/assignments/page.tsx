"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Heading, Text, Card, Flex, Tabs } from "@radix-ui/themes";
import { FiFileText } from "react-icons/fi";
import DashboardNavBar from "@/components/ui/DashboardNavBar";
import { studentTabs } from "@/components/ui/StudentDashboardNav";
import { useAuth } from "@/contexts/AuthContext";
import { AssignmentCard } from "@/components/ui/AssignmentCard";
import { useToast } from "@/contexts/ToastContext";
import axios from "@/lib/axios";

interface Assignment {
  id: string;
  title: string;
  description?: string | null;
  dueDate: Date | string;
  maxPoints: number;
  status: string;
  class: {
    id: string;
    name: string;
    code: string;
  };
  group?: {
    id: string;
    name: string;
  } | null;
  createdBy: {
    name: string;
    avatar?: string | null;
  };
  attachments?: Array<{ id: string; fileName: string }>;
  submissions?: Array<{
    id: string;
    status: string;
    submittedAt?: Date | string | null;
    grade?: number | null;
  }>;
}

export default function StudentAssignmentsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "submitted" | "graded">("all");

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/students/${user?.id}/assignments`);
      setAssignments(data);
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
      toast.error("Không thể tải danh sách bài tập");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "STUDENT")) {
      router.push("/login");
    } else if (!isLoading && user && assignments.length === 0) {
      fetchAssignments();
    }
  }, [user, isLoading]);

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

  if (!user) {
    return null;
  }

  // Filter assignments based on selected tab
  const filteredAssignments = assignments.filter((assignment) => {
    const submission = assignment.submissions?.[0];

    switch (filter) {
      case "pending":
        return !submission || submission.status === "DRAFT";
      case "submitted":
        return submission && (submission.status === "SUBMITTED" || submission.status === "LATE");
      case "graded":
        return submission && submission.status === "GRADED";
      default:
        return true;
    }
  });

  // Sort by due date (closest first)
  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const getTabCount = (tabFilter: typeof filter) => {
    return assignments.filter((assignment) => {
      const submission = assignment.submissions?.[0];

      switch (tabFilter) {
        case "pending":
          return !submission || submission.status === "DRAFT";
        case "submitted":
          return submission && (submission.status === "SUBMITTED" || submission.status === "LATE");
        case "graded":
          return submission && submission.status === "GRADED";
        default:
          return true;
      }
    }).length;
  };

  return (
    <div className="min-h-screen bg-mint-50">
      <DashboardNavBar tabs={studentTabs} />

      <Container size="3" className="py-12">
        <Flex direction="column" gap="6">
          <div>
            <Heading size="8" className="text-gray-900 mb-2">
              Quản lý bài tập
            </Heading>
            <Text size="3" className="text-gray-600">
              Xem và nộp bài tập từ các lớp học của bạn
            </Text>
          </div>

          <Tabs.Root value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
            <Tabs.List>
              <Tabs.Trigger value="all">
                Tất cả ({getTabCount("all")})
              </Tabs.Trigger>
              <Tabs.Trigger value="pending">
                Chưa nộp ({getTabCount("pending")})
              </Tabs.Trigger>
              <Tabs.Trigger value="submitted">
                Đã nộp ({getTabCount("submitted")})
              </Tabs.Trigger>
              <Tabs.Trigger value="graded">
                Đã chấm ({getTabCount("graded")})
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value={filter}>
              <Flex direction="column" gap="3" className="mt-6">
                {sortedAssignments.length > 0 ? (
                  sortedAssignments.map((assignment) => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      submission={assignment.submissions?.[0]}
                      showClass={true}
                    />
                  ))
                ) : (
                  <Card className="bg-white p-8 text-center">
                    <FiFileText
                      className="mx-auto text-gray-400 mb-4"
                      size={48}
                    />
                    <Text className="text-gray-600">
                      {filter === "all" && "Chưa có bài tập nào"}
                      {filter === "pending" && "Không có bài tập nào cần nộp"}
                      {filter === "submitted" && "Chưa có bài tập nào đã nộp"}
                      {filter === "graded" && "Chưa có bài tập nào được chấm điểm"}
                    </Text>
                  </Card>
                )}
              </Flex>
            </Tabs.Content>
          </Tabs.Root>
        </Flex>
      </Container>
    </div>
  );
}

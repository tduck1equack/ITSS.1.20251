"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Heading, Text, Card, Flex } from "@radix-ui/themes";
import { FiBell } from "react-icons/fi";
import DashboardNavBar from "@/components/ui/DashboardNavBar";
import { teacherTabs } from "@/components/ui/TeacherDashboardNav";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function TeacherNotificationsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "TEACHER")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mint-50">
        <DashboardNavBar tabs={teacherTabs} />
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

  return (
    <div className="min-h-screen bg-mint-50">
      <DashboardNavBar tabs={teacherTabs} />

      <Container size="3" className="py-12">
        <Flex direction="column" align="center" gap="6" className="text-center">
          <div className="bg-mint-100 p-6 rounded-full">
            <FiBell className="text-mint-600" size={64} />
          </div>

          <div>
            <Heading size="8" className="text-gray-900 mb-2">
              Thông báo
            </Heading>
            <Text size="5" className="text-gray-600">
              Đang trong quá trình phát triển
            </Text>
          </div>

          <Card className="max-w-2xl bg-yellow-50 border border-yellow-300 p-6">
            <Flex direction="column" gap="3">
              <Heading size="5" className="text-yellow-800">
                🚧 Đang bảo trì
              </Heading>
              <Text className="text-yellow-800">
                Tính năng thông báo đang được phát triển. Bạn sẽ nhận được thông
                báo về bài nộp mới, câu hỏi từ sinh viên, và các hoạt động trong
                lớp trong các phiên bản tiếp theo.
              </Text>
              <Text size="2" className="text-yellow-700">
                Dự kiến bao gồm: Thông báo bài nộp, Câu hỏi sinh viên, Hoạt động
                lớp học, Cài đặt thông báo.
              </Text>
            </Flex>
          </Card>

          <Link
            href="/dashboard/teacher/classes"
            className="text-mint-600 hover:text-mint-700 font-medium transition-colors"
          >
            ← Quay lại lớp học
          </Link>
        </Flex>
      </Container>
    </div>
  );
}

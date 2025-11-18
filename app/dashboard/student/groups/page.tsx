"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Heading, Text, Card, Flex } from "@radix-ui/themes";
import { FiUsers } from "react-icons/fi";
import DashboardNavBar from "@/components/ui/DashboardNavBar";
import { studentTabs } from "@/components/ui/StudentDashboardNav";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function StudentGroupsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "STUDENT")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
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

  return (
    <div className="min-h-screen bg-mint-50">
      <DashboardNavBar tabs={studentTabs} />

      <Container size="3" className="py-12">
        <Flex direction="column" align="center" gap="6" className="text-center">
          <div className="bg-mint-100 p-6 rounded-full">
            <FiUsers className="text-mint-600" size={64} />
          </div>

          <div>
            <Heading size="8" className="text-gray-900 mb-2">
              Nhóm học tập
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
                Tính năng quản lý nhóm đang được phát triển. Bạn sẽ có thể tham
                gia nhóm, làm việc nhóm, và quản lý thành viên nhóm trong các
                phiên bản tiếp theo.
              </Text>
              <Text size="2" className="text-yellow-700">
                Dự kiến bao gồm: Danh sách nhóm, Tham gia nhóm, Quản lý thành
                viên, Chat nhóm.
              </Text>
            </Flex>
          </Card>

          <Link
            href="/dashboard/student/classes"
            className="text-mint-600 hover:text-mint-700 font-medium transition-colors"
          >
            ← Quay lại lớp học
          </Link>
        </Flex>
      </Container>
    </div>
  );
}

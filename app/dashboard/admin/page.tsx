"use client";

import { Container, Heading, Text, Card, Flex } from "@radix-ui/themes";
import { FiTool } from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "ADMINISTRATOR")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mint-50 flex items-center justify-center">
        <Text size="5" className="text-gray-600">
          Đang tải...
        </Text>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-mint-50">
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-mint-200 shadow-sm">
        <Container size="4">
          <Flex justify="between" align="center" py="4">
            <Heading size="6" className="text-mint-700">
              HUST LMS - Quản trị viên
            </Heading>
            <button
              onClick={logout}
              className="text-sm text-gray-600 hover:text-mint-600 transition-colors"
            >
              Đăng xuất
            </button>
          </Flex>
        </Container>
      </nav>

      <Container size="3" className="py-12">
        <Flex direction="column" align="center" gap="6" className="text-center">
          <div className="bg-mint-100 p-6 rounded-full">
            <FiTool className="text-mint-600" size={64} />
          </div>

          <div>
            <Heading size="8" className="text-gray-900 mb-2">
              Bảng điều khiển quản trị
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
                Bảng điều khiển quản trị viên đang được phát triển. Các tính
                năng quản lý hệ thống sẽ được bổ sung trong các phiên bản tiếp
                theo.
              </Text>
              <Text size="2" className="text-yellow-700">
                Dự kiến bao gồm: Quản lý người dùng, Quản lý lớp học, Báo cáo
                thống kê, Cấu hình hệ thống.
              </Text>
            </Flex>
          </Card>

          <Link
            href="/"
            className="text-mint-600 hover:text-mint-700 font-medium transition-colors"
          >
            ← Quay lại trang chủ
          </Link>
        </Flex>
      </Container>
    </div>
  );
}

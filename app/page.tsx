"use client";

import {
  Flex,
  Container,
  Heading,
  Text,
  Button,
  Section,
  Card,
  Grid,
} from "@radix-ui/themes";
import Link from "next/link";
import {
  FiBook,
  FiEdit,
  FiUsers,
  FiBell,
  FiCheckCircle,
  FiTrendingUp,
} from "react-icons/fi";
import NavBar from "@/components/ui/NavBar";

export default function Home() {
  return (
    <div className="min-h-screen bg-mint-50">
      <NavBar />

      {/* Hero Section */}
      <Section size="3" className="bg-linear-to-br from-mint-100 to-white">
        <Container size="4">
          <Flex
            direction="column"
            align="center"
            gap="6"
            className="text-center py-16"
          >
            <Heading size="9" className="text-gray-900 max-w-4xl">
              Hệ thống Quản lý Học tập{" "}
              <span className="text-mint-600">HUST</span>
            </Heading>
            <Text size="5" className="text-gray-600 max-w-2xl">
              Nền tảng học tập trực tuyến hiện đại cho Đại học Bách Khoa Hà Nội.
              Kết nối giảng viên và sinh viên trong môi trường học tập số hóa.
            </Text>
            <Flex gap="4" mt="4">
              <Link href="/login">
                <Button
                  size="4"
                  className="bg-mint-500 hover:bg-mint-600 text-white cursor-pointer px-8"
                >
                  Bắt đầu ngay
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="4"
                  variant="outline"
                  className="border-mint-500 text-mint-700 hover:bg-mint-50 cursor-pointer px-8"
                >
                  Tìm hiểu thêm
                </Button>
              </Link>
            </Flex>
          </Flex>
        </Container>
      </Section>

      {/* Features Section */}
      <Section size="3" className="bg-white">
        <Container size="4">
          <Flex direction="column" gap="6" align="center" mb="6">
            <Heading size="8" className="text-gray-900 text-center">
              Tính năng nổi bật
            </Heading>
            <Text size="4" className="text-gray-600 text-center max-w-2xl">
              Trải nghiệm học tập toàn diện với các công cụ và tính năng hiện
              đại
            </Text>
          </Flex>

          <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="6">
            <Card className="bg-white border border-mint-200 hover:shadow-lg transition-shadow">
              <Flex direction="column" gap="3" p="4">
                <div className="bg-mint-100 p-3 rounded-lg w-fit">
                  <FiBook className="text-mint-600" size={28} />
                </div>
                <Heading size="5" className="text-gray-900">
                  Quản lý Khóa học
                </Heading>
                <Text className="text-gray-600">
                  Tổ chức và quản lý khóa học dễ dàng với giao diện trực quan và
                  thân thiện
                </Text>
              </Flex>
            </Card>

            <Card className="bg-white border border-mint-200 hover:shadow-lg transition-shadow">
              <Flex direction="column" gap="3" p="4">
                <div className="bg-mint-100 p-3 rounded-lg w-fit">
                  <FiEdit className="text-mint-600" size={28} />
                </div>
                <Heading size="5" className="text-gray-900">
                  Bài tập & Đánh giá
                </Heading>
                <Text className="text-gray-600">
                  Tạo, nộp và chấm điểm bài tập trực tuyến một cách nhanh chóng
                  và chính xác
                </Text>
              </Flex>
            </Card>

            <Card className="bg-white border border-mint-200 hover:shadow-lg transition-shadow">
              <Flex direction="column" gap="3" p="4">
                <div className="bg-mint-100 p-3 rounded-lg w-fit">
                  <FiUsers className="text-mint-600" size={28} />
                </div>
                <Heading size="5" className="text-gray-900">
                  Cộng tác & Trao đổi
                </Heading>
                <Text className="text-gray-600">
                  Kết nối và trao đổi giữa giảng viên và sinh viên trong thời
                  gian thực
                </Text>
              </Flex>
            </Card>

            <Card className="bg-white border border-mint-200 hover:shadow-lg transition-shadow">
              <Flex direction="column" gap="3" p="4">
                <div className="bg-mint-100 p-3 rounded-lg w-fit">
                  <FiBell className="text-mint-600" size={28} />
                </div>
                <Heading size="5" className="text-gray-900">
                  Thông báo Thông minh
                </Heading>
                <Text className="text-gray-600">
                  Nhận thông báo tức thì về các hoạt động quan trọng trong khóa
                  học
                </Text>
              </Flex>
            </Card>

            <Card className="bg-white border border-mint-200 hover:shadow-lg transition-shadow">
              <Flex direction="column" gap="3" p="4">
                <div className="bg-mint-100 p-3 rounded-lg w-fit">
                  <FiCheckCircle className="text-mint-600" size={28} />
                </div>
                <Heading size="5" className="text-gray-900">
                  Điểm danh Tự động
                </Heading>
                <Text className="text-gray-600">
                  Hệ thống điểm danh tự động giúp theo dõi sự tham gia của sinh
                  viên
                </Text>
              </Flex>
            </Card>

            <Card className="bg-white border border-mint-200 hover:shadow-lg transition-shadow">
              <Flex direction="column" gap="3" p="4">
                <div className="bg-mint-100 p-3 rounded-lg w-fit">
                  <FiTrendingUp className="text-mint-600" size={28} />
                </div>
                <Heading size="5" className="text-gray-900">
                  Báo cáo & Thống kê
                </Heading>
                <Text className="text-gray-600">
                  Theo dõi tiến độ học tập và hiệu suất với các báo cáo chi tiết
                </Text>
              </Flex>
            </Card>
          </Grid>
        </Container>
      </Section>

      {/* Footer */}
      <Section size="1" className="bg-mint-100 border-t border-mint-200">
        <Container size="4">
          <Flex justify="center" align="center" py="6">
            <Text className="text-gray-700">
              © 2024 HUST LMS. Đại học Bách Khoa Hà Nội.
            </Text>
          </Flex>
        </Container>
      </Section>
    </div>
  );
}

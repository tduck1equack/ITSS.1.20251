"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Container, Flex } from "@radix-ui/themes";
import { FiBook } from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";

export default function NavBar() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      // Redirect to dashboard based on role
      if (user.role === "ADMINISTRATOR") {
        router.push("/dashboard/admin");
      } else if (user.role === "TEACHER") {
        router.push("/dashboard/teacher/classes");
      } else {
        router.push("/dashboard/student/classes");
      }
    } else {
      router.push("/");
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-mint-200 shadow-sm">
      <Container size="4">
        <Flex justify="between" align="center" py="4">
          {/* Logo and Title */}
          <a
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="bg-mint-500 p-2 rounded-lg">
              <FiBook className="text-white" size={24} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-mint-700">HUST LMS</span>
              <span className="text-xs text-gray-600">
                Learning Management System
              </span>
            </div>
          </a>

          {/* Navigation Links */}
          <Flex gap="4" align="center">
            <Link
              href="/"
              className="text-gray-700 hover:text-mint-600 transition-colors font-medium"
            >
              Trang chủ
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-mint-600 transition-colors font-medium"
            >
              Về chúng tôi
            </Link>
            <Link href="/login">
              <Button
                size="2"
                className="bg-mint-500 hover:bg-mint-600 text-white cursor-pointer"
              >
                Đăng nhập
              </Button>
            </Link>
          </Flex>
        </Flex>
      </Container>
    </nav>
  );
}

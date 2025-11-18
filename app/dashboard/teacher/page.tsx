"use client";

import { Container, Heading, Text, Card, Flex } from "@radix-ui/themes";
import {
  FiBook,
  FiFileText,
  FiUsers,
  FiMessageSquare,
  FiBell,
  FiSettings,
} from "react-icons/fi";
import DashboardNavBar from "@/components/ui/DashboardNavBar";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const teacherTabs = [
  {
    label: "Lớp học",
    href: "/dashboard/teacher/classes",
    icon: <FiBook size={18} />,
  },
  {
    label: "Bài tập",
    href: "/dashboard/teacher/assignments",
    icon: <FiFileText size={18} />,
  },
  {
    label: "Nhóm",
    href: "/dashboard/teacher/groups",
    icon: <FiUsers size={18} />,
  },
  {
    label: "Bài viết",
    href: "/dashboard/teacher/posts",
    icon: <FiMessageSquare size={18} />,
  },
  {
    label: "Thông báo",
    href: "/dashboard/teacher/notifications",
    icon: <FiBell size={18} />,
  },
];

export default function TeacherDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "TEACHER")) {
      router.push("/login");
    } else if (!isLoading && user) {
      // Redirect to classes tab by default
      router.push("/dashboard/teacher/classes");
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

  return null;
}

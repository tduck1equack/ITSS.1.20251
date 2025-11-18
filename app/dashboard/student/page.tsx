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

const studentTabs = [
  {
    label: "Lớp học",
    href: "/dashboard/student/classes",
    icon: <FiBook size={18} />,
  },
  {
    label: "Bài tập",
    href: "/dashboard/student/assignments",
    icon: <FiFileText size={18} />,
  },
  {
    label: "Nhóm",
    href: "/dashboard/student/groups",
    icon: <FiUsers size={18} />,
  },
  {
    label: "Bài viết",
    href: "/dashboard/student/posts",
    icon: <FiMessageSquare size={18} />,
  },
  {
    label: "Thông báo",
    href: "/dashboard/student/notifications",
    icon: <FiBell size={18} />,
  },
];

export default function StudentDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "STUDENT")) {
      router.push("/login");
    } else if (!isLoading && user) {
      // Redirect to classes tab by default
      router.push("/dashboard/student/classes");
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Button,
  Container,
  Flex,
  Avatar,
  DropdownMenu,
} from "@radix-ui/themes";
import { FiBook, FiLogOut, FiUser, FiSettings } from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardNavBarProps {
  tabs: { label: string; href: string; icon: React.ReactNode }[];
}

export default function DashboardNavBar({ tabs }: DashboardNavBarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const getDashboardUrl = () => {
    if (!user) return "/";
    if (user.role === "ADMINISTRATOR") return "/dashboard/admin";
    if (user.role === "TEACHER") return "/dashboard/teacher/classes";
    return "/dashboard/student/classes";
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-mint-200 shadow-sm">
      <Container size="4">
        <Flex justify="between" align="center" py="3">
          {/* Logo */}
          <Link
            href={getDashboardUrl()}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="bg-mint-500 p-2 rounded-lg">
              <FiBook className="text-white" size={20} />
            </div>
            <span className="font-bold text-lg text-mint-700">HUST LMS</span>
          </Link>

          {/* Navigation Tabs */}
          <Flex gap="1" align="center">
            {tabs.map((tab) => {
              const isActive =
                pathname === tab.href || pathname?.startsWith(tab.href + "/");
              return (
                <Link key={tab.href} href={tab.href}>
                  <Button
                    variant={isActive ? "solid" : "ghost"}
                    className={
                      isActive
                        ? "bg-mint-500 text-white"
                        : "text-gray-700 hover:bg-mint-50"
                    }
                  >
                    <Flex align="center" gap="2">
                      {tab.icon}
                      {tab.label}
                    </Flex>
                  </Button>
                </Link>
              );
            })}
          </Flex>

          {/* User Menu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="ghost" className="cursor-pointer">
                <Flex align="center" gap="2">
                  <Avatar
                    size="2"
                    src={user?.avatar}
                    fallback={user?.name?.charAt(0) || "U"}
                    className="bg-mint-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name}
                  </span>
                </Flex>
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2"
                >
                  <FiSettings size={16} />
                  Cài đặt tài khoản
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-2"
                >
                  <FiUser size={16} />
                  Hồ sơ cá nhân
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item color="red" onClick={logout}>
                <Flex align="center" gap="2">
                  <FiLogOut size={16} />
                  Đăng xuất
                </Flex>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>
      </Container>
    </nav>
  );
}

"use client";

import { Card, Flex, Heading, Text, Button, Grid } from "@radix-ui/themes";
import { FiUser, FiCopy } from "react-icons/fi";

interface DemoAccount {
  role: string;
  email: string;
  password: string;
  name: string;
  icon: string;
}

const demoAccounts: DemoAccount[] = [
  {
    role: "Quản trị viên",
    email: "quantri@hust.edu.vn",
    password: "Admin@2025",
    name: "Nguyễn Văn Quản",
    icon: "👨‍💼",
  },
  {
    role: "Giảng viên",
    email: "nguyenvana@hust.edu.vn",
    password: "Teacher@2025",
    name: "TS. Nguyễn Văn An",
    icon: "👨‍🏫",
  },
  {
    role: "Sinh viên",
    email: "hoang.nm20210001@sis.hust.edu.vn",
    password: "Student@2025",
    name: "Nguyễn Minh Hoàng",
    icon: "👨‍🎓",
  },
];

interface DemoAccountsCardProps {
  onFillForm: (email: string, password: string) => void;
}

export default function DemoAccountsCard({
  onFillForm,
}: DemoAccountsCardProps) {
  return (
    <Card className="bg-mint-100/50 border-2 border-mint-300 dark:border-mint-800 p-6">
      <Flex direction="column" gap="4">
        <Flex align="center" gap="2">
          <FiUser className="text-mint-600" size={24} />
          <Heading size="5" className="text-mint-900">
            Tài khoản Demo
          </Heading>
        </Flex>
        <Text className="text-gray-600 text-sm">
          Nhấp vào nút bên dưới để tự động điền thông tin đăng nhập
        </Text>

        <Grid columns="1" gap="3">
          {demoAccounts.map((account) => (
            <Card
              key={account.email}
              className="bg-white border border-mint-200 dark:border-mint-900 hover:border-mint-400 dark:hover:border-mint-600 transition-all"
            >
              <Flex direction="column" gap="3" p="3">
                <Flex justify="between" align="center">
                  <Flex align="center" gap="3">
                    <span className="text-3xl">{account.icon}</span>
                    <Flex direction="column">
                      <Text
                        weight="bold"
                        className="text-gray-900"
                      >
                        {account.role}
                      </Text>
                      <Text
                        size="2"
                        className="text-gray-600"
                      >
                        {account.name}
                      </Text>
                    </Flex>
                  </Flex>
                  <Button
                    size="2"
                    onClick={() => onFillForm(account.email, account.password)}
                    className="bg-mint-500 hover:bg-mint-600 dark:hover:bg-mint-500 text-white cursor-pointer"
                  >
                    <FiCopy size={16} />
                    Sử dụng
                  </Button>
                </Flex>
                <Flex direction="column" gap="1">
                  <Text size="1" className="text-gray-600">
                    Email:{" "}
                    <span className="text-gray-800 font-mono">
                      {account.email}
                    </span>
                  </Text>
                  <Text size="1" className="text-gray-600">
                    Mật khẩu:{" "}
                    <span className="text-gray-800 font-mono">
                      {account.password}
                    </span>
                  </Text>
                </Flex>
              </Flex>
            </Card>
          ))}
        </Grid>

        <Card className="bg-yellow-50 border border-yellow-300 dark:border-yellow-800 p-3">
          <Text size="2" className="text-yellow-800">
            ⚠️ <strong>Lưu ý:</strong> Đây là tài khoản demo chỉ dùng để thử
            nghiệm hệ thống.
          </Text>
        </Card>
      </Flex>
    </Card>
  );
}

"use client";

import { Card, Flex, Heading, Text, Button, Select } from "@radix-ui/themes";
import { FiUser, FiCopy } from "react-icons/fi";
import { useState } from "react";

interface DemoAccount {
  role: string;
  email: string;
  password: string;
  name: string;
  icon: string;
}

const demoAccountsByRole: Record<string, DemoAccount[]> = {
  admin: [
    {
      role: "Quản trị viên",
      email: "admin@hust.edu.vn",
      password: "Admin@2025",
      name: "Quản Trị Viên",
      icon: "👨‍💼",
    },
  ],
  teacher: [
    {
      role: "Giảng viên",
      email: "nguyenvanan@hust.edu.vn",
      password: "Teacher@2025",
      name: "PGS.TS. Nguyễn Văn An",
      icon: "👨‍🏫",
    },
    {
      role: "Giảng viên",
      email: "vuonganhtuan@hust.edu.vn",
      password: "Teacher@2025",
      name: "TS. Vương Anh Tuấn",
      icon: "👨‍🏫",
    },
    {
      role: "Giảng viên",
      email: "dinhthimai@hust.edu.vn",
      password: "Teacher@2025",
      name: "ThS. Đinh Thị Mai",
      icon: "👩‍🏫",
    },
    {
      role: "Giảng viên",
      email: "luongvankhoa@hust.edu.vn",
      password: "Teacher@2025",
      name: "TS. Lương Văn Khoa",
      icon: "👨‍🏫",
    },
  ],
  student: [
    {
      role: "Sinh viên",
      email: "nguyenminhan20210001@sis.hust.edu.vn",
      password: "Student@2025",
      name: "Nguyễn Minh An",
      icon: "👨‍🎓",
    },
    {
      role: "Sinh viên",
      email: "tranvanbao20210002@sis.hust.edu.vn",
      password: "Student@2025",
      name: "Trần Văn Bảo",
      icon: "👨‍🎓",
    },
    {
      role: "Sinh viên",
      email: "lethichau20220010@sis.hust.edu.vn",
      password: "Student@2025",
      name: "Lê Thị Châu",
      icon: "👩‍🎓",
    },
    {
      role: "Sinh viên",
      email: "phamvandung202510001@sis.hust.edu.vn",
      password: "Student@2025",
      name: "Phạm Văn Dũng",
      icon: "👨‍🎓",
    },
  ],
};

interface DemoAccountsCardProps {
  onFillForm: (email: string, password: string) => void;
}

export default function DemoAccountsCard({
  onFillForm,
}: DemoAccountsCardProps) {
  const [selectedAdmin, setSelectedAdmin] = useState(
    demoAccountsByRole.admin[0].email
  );
  const [selectedTeacher, setSelectedTeacher] = useState(
    demoAccountsByRole.teacher[0].email
  );
  const [selectedStudent, setSelectedStudent] = useState(
    demoAccountsByRole.student[0].email
  );

  const getAccountByEmail = (email: string): DemoAccount | undefined => {
    for (const roleAccounts of Object.values(demoAccountsByRole)) {
      const account = roleAccounts.find((acc) => acc.email === email);
      if (account) return account;
    }
    return undefined;
  };

  const handleUseAccount = (roleType: string) => {
    let email: string;
    if (roleType === "admin") email = selectedAdmin;
    else if (roleType === "teacher") email = selectedTeacher;
    else email = selectedStudent;

    const account = getAccountByEmail(email);
    if (account) {
      onFillForm(account.email, account.password);
    }
  };

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
          Chọn tài khoản và nhấp "Sử dụng" để tự động điền thông tin đăng nhập
        </Text>

        <Flex direction="column" gap="3">
          {/* Admin Account */}
          <Card className="bg-white border border-mint-200 dark:border-mint-900 p-4">
            <Flex direction="column" gap="3">
              <Flex justify="between" align="center">
                <Text weight="bold" size="3" className="text-gray-900">
                  👨‍💼 Quản trị viên
                </Text>
                <Button
                  size="2"
                  onClick={() => handleUseAccount("admin")}
                  className="bg-mint-500 hover:bg-mint-600 text-white cursor-pointer"
                >
                  <FiCopy size={16} />
                  Sử dụng
                </Button>
              </Flex>
              <Flex direction="column" gap="2">
                <Text size="2" weight="bold" className="text-gray-700">
                  {getAccountByEmail(selectedAdmin)?.name}
                </Text>
                <Text size="1" className="text-gray-600 font-mono">
                  {selectedAdmin}
                </Text>
              </Flex>
            </Flex>
          </Card>

          {/* Teacher Accounts */}
          <Card className="bg-white border border-mint-200 dark:border-mint-900 p-4">
            <Flex direction="column" gap="3">
              <Flex justify="between" align="center">
                <Text weight="bold" size="3" className="text-gray-900">
                  👨‍🏫 Giảng viên
                </Text>
                <Button
                  size="2"
                  onClick={() => handleUseAccount("teacher")}
                  className="bg-mint-500 hover:bg-mint-600 text-white cursor-pointer"
                >
                  <FiCopy size={16} />
                  Sử dụng
                </Button>
              </Flex>
              <Select.Root
                value={selectedTeacher}
                onValueChange={setSelectedTeacher}
              >
                <Select.Trigger className="w-full" />
                <Select.Content>
                  {demoAccountsByRole.teacher.map((account) => (
                    <Select.Item key={account.email} value={account.email}>
                      {account.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              <Text size="1" className="text-gray-600 font-mono">
                {selectedTeacher}
              </Text>
            </Flex>
          </Card>

          {/* Student Accounts */}
          <Card className="bg-white border border-mint-200 dark:border-mint-900 p-4">
            <Flex direction="column" gap="3">
              <Flex justify="between" align="center">
                <Text weight="bold" size="3" className="text-gray-900">
                  👨‍🎓 Sinh viên
                </Text>
                <Button
                  size="2"
                  onClick={() => handleUseAccount("student")}
                  className="bg-mint-500 hover:bg-mint-600 text-white cursor-pointer"
                >
                  <FiCopy size={16} />
                  Sử dụng
                </Button>
              </Flex>
              <Select.Root
                value={selectedStudent}
                onValueChange={setSelectedStudent}
              >
                <Select.Trigger className="w-full" />
                <Select.Content>
                  {demoAccountsByRole.student.map((account) => (
                    <Select.Item key={account.email} value={account.email}>
                      {account.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              <Text size="1" className="text-gray-600 font-mono">
                {selectedStudent}
              </Text>
            </Flex>
          </Card>
        </Flex>

        <Card className="bg-yellow-50 border border-yellow-300 dark:border-yellow-800 p-3">
          <Text size="2" className="text-yellow-800">
            ⚠️ <strong>Lưu ý:</strong> Đây là tài khoản demo chỉ dùng để thử
            nghiệm hệ thống. Tất cả tài khoản đều có mật khẩu giống nhau theo
            vai trò.
          </Text>
        </Card>
      </Flex>
    </Card>
  );
}

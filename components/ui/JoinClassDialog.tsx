"use client";

import { useState } from "react";
import {
  Dialog,
  Button,
  Flex,
  Text,
  TextField,
  Card,
  Badge,
} from "@radix-ui/themes";
import { FiKey, FiAlertCircle, FiCopy } from "react-icons/fi";
import axios from "@/lib/axios";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";

interface JoinClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Demo private class codes for demonstration
const DEMO_CODES = [
  { code: "AI25#7XQ", name: "Trí tuệ nhân tạo nâng cao" },
  { code: "ML@25Y9K", name: "Học máy và Deep Learning" },
  { code: "DS#25Z3M", name: "Khoa học dữ liệu" },
  { code: "WEB@5ABP", name: "Phát triển Web Full-stack" },
  { code: "CYB#R925", name: "An ninh mạng" },
  { code: "IOT@2025", name: "Internet of Things" },
];

export function JoinClassDialog({
  open,
  onOpenChange,
  onSuccess,
}: JoinClassDialogProps) {
  const [classCode, setClassCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();
  const { user } = useAuth();

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!classCode.trim()) {
      setError("Vui lòng nhập mã lớp học");
      return;
    }

    // Basic validation for code format
    if (classCode.length !== 8) {
      setError("Mã lớp học không hợp lệ! Mã phải có đúng 8 ký tự.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await axios.post("/api/classes/join-private", {
        joinCode: classCode.trim(),
        userId: user?.id,
        userRole: user?.role,
      });

      toast.success(
        "Tham gia lớp học thành công",
        `Bạn đã tham gia lớp "${response.data.className}"`
      );

      setClassCode("");
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Failed to join class:", err);

      if (err.response?.status === 404) {
        setError("Mã lớp học không hợp lệ! Vui lòng kiểm tra lại.");
      } else if (err.response?.status === 400) {
        setError(err.response.data.error || "Không thể tham gia lớp học này.");
      } else if (err.response?.status === 409) {
        setError("Bạn đã tham gia lớp học này rồi.");
      } else {
        setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    setClassCode(code);
    toast.info("Đã sao chép", `Mã "${code}" đã được điền vào ô nhập`);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 550 }}>
        <Dialog.Title>Tham gia lớp học riêng tư</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Nhập mã lớp học 8 ký tự để tham gia lớp học riêng tư
        </Dialog.Description>

        <form onSubmit={handleJoinClass}>
          <Flex direction="column" gap="4">
            <div>
              <Text as="div" size="2" mb="2" weight="bold">
                Mã lớp học <span className="text-red-500">*</span>
              </Text>
              <TextField.Root
                placeholder="Nhập mã 8 ký tự (VD: aB3@xY*2)"
                value={classCode}
                onChange={(e) => {
                  setClassCode(e.target.value);
                  setError("");
                }}
                maxLength={8}
                className="font-mono"
                size="3"
              >
                <TextField.Slot>
                  <FiKey />
                </TextField.Slot>
              </TextField.Root>
              {error && (
                <Flex align="center" gap="2" mt="2" className="text-red-600">
                  <FiAlertCircle size={16} />
                  <Text size="2">{error}</Text>
                </Flex>
              )}
            </div>

            {/* Demo Codes Section */}
            <Card className="bg-blue-50 border border-blue-200 p-4">
              <Flex direction="column" gap="3">
                <Flex align="center" gap="2">
                  <Badge color="blue" size="2">
                    DEMO
                  </Badge>
                  <Text size="2" weight="bold" className="text-blue-900">
                    Mã lớp demo để thử nghiệm
                  </Text>
                </Flex>
                <div className="grid grid-cols-1 gap-2">
                  {DEMO_CODES.map((demo) => (
                    <Card
                      key={demo.code}
                      className="bg-white border border-blue-100 hover:border-blue-300 transition-colors cursor-pointer"
                      onClick={() => handleCopyCode(demo.code)}
                    >
                      <Flex justify="between" align="center" p="2">
                        <Flex direction="column" gap="1">
                          <Text
                            size="2"
                            weight="bold"
                            className="font-mono text-blue-700"
                          >
                            {demo.code}
                          </Text>
                          <Text size="1" className="text-gray-600">
                            {demo.name}
                          </Text>
                        </Flex>
                        <Button
                          type="button"
                          size="1"
                          variant="soft"
                          color="blue"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyCode(demo.code);
                          }}
                        >
                          <FiCopy size={12} />
                          Dùng
                        </Button>
                      </Flex>
                    </Card>
                  ))}
                </div>
              </Flex>
            </Card>

            <Flex gap="3" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray" type="button">
                  Hủy
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                disabled={loading || !classCode.trim()}
                className="bg-mint-500 hover:bg-mint-600"
              >
                {loading ? "Đang tham gia..." : "Tham gia lớp học"}
              </Button>
            </Flex>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}

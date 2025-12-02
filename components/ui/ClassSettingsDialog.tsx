"use client";

import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import {
  Dialog,
  Button,
  Flex,
  Text,
  TextField,
  TextArea,
  Checkbox,
} from "@radix-ui/themes";
import { FiSettings, FiLock, FiCopy, FiCheck } from "react-icons/fi";

interface Teacher {
  id: string;
  name: string;
  email?: string;
  avatar: string | null;
}

interface ClassData {
  id: string;
  code: string;
  name: string;
  description: string | null;
  semester: string | null;
  year: number | null;
  isPrivate?: boolean;
  joinCode?: string | null;
  teachers: Array<{
    teacher: Teacher;
  }>;
}

interface ClassSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData?: ClassData | null;
  onUpdate: () => void;
}

export function ClassSettingsDialog({
  open,
  onOpenChange,
  classData,
  onUpdate,
}: ClassSettingsDialogProps) {
  const [formData, setFormData] = useState({
    code: classData?.code || "",
    name: classData?.name || "",
    description: classData?.description || "",
    semester: classData?.semester || "",
    year: classData?.year || new Date().getFullYear(),
    isPrivate: classData?.isPrivate || false,
    joinCode: classData?.joinCode || "",
  });

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedJoinCode, setCopiedJoinCode] = useState(false);

  const handleCopyCode = async () => {
    if (classData?.code) {
      await navigator.clipboard.writeText(classData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyJoinCode = async () => {
    if (classData?.joinCode) {
      await navigator.clipboard.writeText(classData.joinCode);
      setCopiedJoinCode(true);
      setTimeout(() => setCopiedJoinCode(false), 2000);
    }
  };

  useEffect(() => {
    if (open && classData) {
      setFormData({
        code: classData.code,
        name: classData.name,
        description: classData.description || "",
        semester: classData.semester || "",
        year: classData.year || new Date().getFullYear(),
        isPrivate: classData.isPrivate || false,
        joinCode: classData.joinCode || "",
      });
    }
  }, [open, classData]);

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classData?.id) return;

    setLoading(true);
    try {
      await axios.patch(`/api/classes/${classData.id}`, formData);
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update class:", error);
      alert("Không thể cập nhật thông tin lớp học");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 700, maxHeight: "85vh" }}>
        <Dialog.Title>Cấu hình lớp học</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Quản lý thông tin lớp học
        </Dialog.Description>

        <form onSubmit={handleUpdateInfo}>
          <Flex direction="column" gap="3" className="mt-4">
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Mã lớp
              </Text>
              <Flex gap="2">
                <TextField.Root
                  value={classData?.code || ""}
                  readOnly
                  className="flex-1 font-mono bg-gray-50"
                />
                <Button type="button" variant="soft" onClick={handleCopyCode}>
                  {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
                  {copied ? "Đã sao chép" : "Sao chép"}
                </Button>
              </Flex>
              <Text size="1" className="text-gray-500 mt-1 block">
                Mã lớp được tạo tự động và không thể thay đổi
              </Text>
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Tên lớp <span className="text-red-500">*</span>
              </Text>
              <TextField.Root
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Mô tả
              </Text>
              <TextArea
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                rows={3}
              />
            </label>
            <Flex gap="3">
              <label className="flex-1">
                <Text as="div" size="2" mb="1" weight="bold">
                  Học kỳ
                </Text>
                <TextField.Root
                  value={formData.semester}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      semester: e.target.value,
                    })
                  }
                />
              </label>
              <label className="flex-1">
                <Text as="div" size="2" mb="1" weight="bold">
                  Năm học
                </Text>
                <TextField.Root
                  type="number"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      year:
                        parseInt(e.target.value) || new Date().getFullYear(),
                    })
                  }
                />
              </label>
            </Flex>
            <label>
              <Flex align="center" gap="2">
                <Checkbox
                  checked={formData.isPrivate}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      isPrivate: checked === true,
                    })
                  }
                />
                <Flex align="center" gap="2">
                  <FiLock size={14} />
                  <Text size="2" weight="bold">
                    Lớp riêng tư
                  </Text>
                </Flex>
              </Flex>
              <Text size="1" className="text-gray-500 ml-6 mt-1 block">
                Lớp riêng tư không hiển thị công khai, chỉ tham gia bằng mã lớp
              </Text>
            </label>
            {formData.isPrivate && classData?.joinCode && (
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Mã tham gia lớp riêng tư
                </Text>
                <Flex gap="2">
                  <TextField.Root
                    value={classData.joinCode}
                    readOnly
                    className="flex-1 font-mono bg-gray-50"
                  />
                  <Button
                    type="button"
                    variant="soft"
                    onClick={handleCopyJoinCode}
                  >
                    {copiedJoinCode ? (
                      <FiCheck size={16} />
                    ) : (
                      <FiCopy size={16} />
                    )}
                    {copiedJoinCode ? "Đã sao chép" : "Sao chép"}
                  </Button>
                </Flex>
                <Text size="1" className="text-gray-500 mt-1 block">
                  Mã này được tạo tự động và dùng để tham gia lớp riêng tư
                </Text>
              </label>
            )}
          </Flex>
          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray" type="button">
                Hủy
              </Button>
            </Dialog.Close>
            <Button type="submit" className="bg-mint-500" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}

"use client";

import { useState } from "react";
import {
  Dialog,
  Button,
  Flex,
  Text,
  TextField,
  TextArea,
} from "@radix-ui/themes";
import { FiPlus } from "react-icons/fi";

interface CreateClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: {
    code: string;
    name: string;
    description: string;
    semester: string;
    year: number;
  }) => Promise<void>;
}

export function CreateClassDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateClassDialogProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    semester: "",
    year: new Date().getFullYear(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({
      code: "",
      name: "",
      description: "",
      semester: "",
      year: new Date().getFullYear(),
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 500 }}>
        <Dialog.Title>Tạo lớp học mới</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Điền thông tin để tạo lớp học mới
        </Dialog.Description>
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="3">
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Mã lớp <span className="text-red-500">*</span>
              </Text>
              <TextField.Root
                placeholder="VD: CS101-2024"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                required
              />
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Tên lớp <span className="text-red-500">*</span>
              </Text>
              <TextField.Root
                placeholder="VD: Nhập môn Khoa học Máy tính"
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
                placeholder="Mô tả về lớp học..."
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
                  placeholder="VD: HK1"
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
                  placeholder={new Date().getFullYear().toString()}
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
          </Flex>
          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray" type="button">
                Hủy
              </Button>
            </Dialog.Close>
            <Button type="submit" className="bg-mint-500">
              <FiPlus size={16} /> Tạo lớp
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}

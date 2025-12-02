"use client";

import { useState } from "react";
import {
  Dialog,
  Button,
  Flex,
  Text,
  TextField,
  TextArea,
  Checkbox,
} from "@radix-ui/themes";
import { FiPlus, FiLock } from "react-icons/fi";

// Generate random 8-character class code
function generateClassCode(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#@$&*!";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

interface CreateClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: {
    code: string;
    name: string;
    description: string;
    semester: string;
    year: number;
    isPrivate: boolean;
    joinCode?: string;
  }) => Promise<void>;
}

export function CreateClassDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateClassDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    semester: "",
    year: new Date().getFullYear(),
    isPrivate: false,
    joinCode: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData: any = {
      ...formData,
      code: generateClassCode(), // Auto-generate class code
    };
    if (submitData.isPrivate) {
      submitData.joinCode = generateClassCode(); // Auto-generate join code for private classes
    } else {
      delete submitData.joinCode;
    }
    await onSubmit(submitData);
    setFormData({
      name: "",
      description: "",
      semester: "",
      year: new Date().getFullYear(),
      isPrivate: false,
      joinCode: "",
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
                Lớp riêng tư không hiển thị công khai, chỉ tham gia bằng mã lớp.
                Mã tham gia sẽ được tạo tự động.
              </Text>
            </label>
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

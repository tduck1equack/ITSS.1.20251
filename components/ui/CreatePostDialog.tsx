"use client";

import { useState } from "react";
import {
  Dialog,
  Button,
  Flex,
  Text,
  TextField,
  TextArea,
  Select,
} from "@radix-ui/themes";
import { FiPlus } from "react-icons/fi";

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: {
    title: string;
    content: string;
    type: string;
  }) => Promise<void>;
}

export function CreatePostDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreatePostDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "DISCUSSION",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({
      title: "",
      content: "",
      type: "DISCUSSION",
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 600 }}>
        <Dialog.Title>Tạo bài viết mới</Dialog.Title>
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="3" className="mt-4">
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Loại bài viết
              </Text>
              <Select.Root
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="ANNOUNCEMENT">Thông báo</Select.Item>
                  <Select.Item value="DISCUSSION">Thảo luận</Select.Item>
                  <Select.Item value="MATERIAL">Tài liệu</Select.Item>
                </Select.Content>
              </Select.Root>
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Tiêu đề
              </Text>
              <TextField.Root
                placeholder="Nhập tiêu đề..."
                value={formData.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: e.target.value,
                  })
                }
                required
              />
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Nội dung
              </Text>
              <TextArea
                placeholder="Nhập nội dung bài viết..."
                value={formData.content}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    content: e.target.value,
                  })
                }
                rows={6}
                required
              />
            </label>
          </Flex>
          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray" type="button">
                Hủy
              </Button>
            </Dialog.Close>
            <Button type="submit" className="bg-mint-500">
              <FiPlus size={16} /> Đăng bài
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}

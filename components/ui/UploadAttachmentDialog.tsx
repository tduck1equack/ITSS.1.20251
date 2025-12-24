"use client";

import { useState, useRef } from "react";
import { Dialog, Button, Flex, Text } from "@radix-ui/themes";
import { FiUpload, FiFile, FiX } from "react-icons/fi";
import { useToast } from "@/contexts/ToastContext";

interface UploadAttachmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (fileData: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }) => Promise<void>;
}

export function UploadAttachmentDialog({
  open,
  onOpenChange,
  onUpload,
}: UploadAttachmentDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Lỗi", "Kích thước tệp vượt quá giới hạn 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Lỗi", "Vui lòng chọn tệp");
      return;
    }

    setUploading(true);
    try {
      // Upload file to storage
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      const uploadData = await uploadResponse.json();

      await onUpload(uploadData);

      toast.success("Thành công", "Đã tải lên tài liệu");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onOpenChange(false);
    } catch (error) {
      toast.error("Lỗi", "Không thể tải lên tài liệu");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 500 }}>
        <Dialog.Title>Tải lên tài liệu</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Chọn tệp để tải lên (tối đa 10MB)
        </Dialog.Description>

        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="3">
            <div>
              <Text as="div" size="2" mb="2" weight="bold">
                Chọn tệp <span className="text-red-500">*</span>
              </Text>
              
              {!selectedFile ? (
                <label className="block">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif,.mp4,.webm,.mp3,.wav,.zip,.rar"
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
                    <FiUpload className="mx-auto text-4xl text-gray-400 mb-2" />
                    <Text size="2" className="text-gray-600">
                      Nhấn để chọn tệp
                    </Text>
                    <Text size="1" className="text-gray-400 mt-1">
                      PDF, Word, Excel, PowerPoint, hình ảnh, video...
                    </Text>
                  </div>
                </label>
              ) : (
                <div className="border border-gray-300 rounded-lg p-4">
                  <Flex justify="between" align="center">
                    <Flex gap="2" align="center">
                      <FiFile className="text-blue-500 text-xl" />
                      <div>
                        <Text size="2" weight="bold">
                          {selectedFile.name}
                        </Text>
                        <Text size="1" className="text-gray-500">
                          {formatFileSize(selectedFile.size)}
                        </Text>
                      </div>
                    </Flex>
                    <Button
                      type="button"
                      variant="ghost"
                      color="red"
                      size="1"
                      onClick={handleRemoveFile}
                    >
                      <FiX />
                    </Button>
                  </Flex>
                </div>
              )}
            </div>

            <Flex gap="3" justify="end" className="mt-2">
              <Dialog.Close>
                <Button variant="soft" color="gray" type="button">
                  Hủy
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                className="bg-mint-500"
                disabled={uploading || !selectedFile}
                loading={uploading}
              >
                <FiUpload size={16} />
                {uploading ? "Đang tải lên..." : "Tải lên"}
              </Button>
            </Flex>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}

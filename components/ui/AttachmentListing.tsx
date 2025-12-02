"use client";

import { Badge, Card, Flex, IconButton, Text } from "@radix-ui/themes";
import {
  FiFile,
  FiFileText,
  FiImage,
  FiVideo,
  FiMusic,
  FiDownload,
  FiShare2,
  FiLink,
  FiTrash2,
} from "react-icons/fi";
import { useState } from "react";
import { useToast } from "@/contexts/ToastContext";

interface AttachmentListingProps {
  attachment: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize?: number | null;
    mimeType?: string | null;
    uploadedAt?: Date | string;
    uploader?: {
      name: string;
    };
  };
  canDelete?: boolean;
  onDelete?: (id: string) => void;
}

export function AttachmentListing({
  attachment,
  canDelete = false,
  onDelete,
}: AttachmentListingProps) {
  const [isHovering, setIsHovering] = useState(false);
  const toast = useToast();

  // Format file size
  const formatFileSize = (bytes?: number | null): string => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  // Get file icon based on MIME type
  const getFileIcon = () => {
    const mimeType = attachment.mimeType?.toLowerCase() || "";

    if (mimeType.startsWith("video/")) {
      return <FiVideo size={20} className="text-purple-500" />;
    }
    if (mimeType.startsWith("image/")) {
      return <FiImage size={20} className="text-blue-500" />;
    }
    if (mimeType.startsWith("audio/")) {
      return <FiMusic size={20} className="text-pink-500" />;
    }
    if (
      mimeType.includes("pdf") ||
      mimeType.includes("document") ||
      mimeType.includes("word")
    ) {
      return <FiFileText size={20} className="text-red-500" />;
    }
    if (
      mimeType.includes("spreadsheet") ||
      mimeType.includes("excel") ||
      mimeType.includes("csv")
    ) {
      return <FiFileText size={20} className="text-green-500" />;
    }
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) {
      return <FiFileText size={20} className="text-orange-500" />;
    }

    return <FiFile size={20} className="text-gray-500" />;
  };

  // Get file extension badge
  const getFileExtension = () => {
    const ext = attachment.fileName.split(".").pop()?.toUpperCase();
    return ext || "FILE";
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = attachment.fileUrl;
    link.download = attachment.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    toast.info(
      "Tính năng đang phát triển",
      "Tính năng chia sẻ đang được phát triển"
    );
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(attachment.fileUrl);
      toast.success("Đã sao chép", "Đã sao chép liên kết vào clipboard");
    } catch (error) {
      toast.error("Lỗi", "Không thể sao chép liên kết");
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(attachment.id);
    } else {
      toast.info(
        "Tính năng đang phát triển",
        "Tính năng xóa đang được phát triển"
      );
    }
  };

  return (
    <Card
      className="bg-white hover:shadow-md transition-all"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Flex gap="3" align="center" className="p-3">
        <div className="flex-shrink-0">{getFileIcon()}</div>
        <Flex direction="column" gap="1" className="flex-1 min-w-0">
          <Text size="2" weight="medium" className="truncate">
            {attachment.fileName}
          </Text>
          <Flex align="center" gap="2" wrap="wrap">
            <Badge size="1" color="gray">
              {getFileExtension()}
            </Badge>
            <Text size="1" className="text-gray-500">
              {formatFileSize(attachment.fileSize)}
            </Text>
            {attachment.uploader && (
              <>
                <Text size="1" className="text-gray-400">
                  •
                </Text>
                <Text size="1" className="text-gray-500">
                  {attachment.uploader.name}
                </Text>
              </>
            )}
            {attachment.uploadedAt && (
              <>
                <Text size="1" className="text-gray-400">
                  •
                </Text>
                <Text size="1" className="text-gray-500">
                  {new Date(attachment.uploadedAt).toLocaleDateString("vi-VN")}
                </Text>
              </>
            )}
          </Flex>
        </Flex>

        {/* Action buttons - visible on hover */}
        {isHovering && (
          <Flex gap="1" className="flex-shrink-0">
            <IconButton
              size="1"
              variant="soft"
              color="gray"
              onClick={handleDownload}
              title="Tải xuống"
            >
              <FiDownload size={14} />
            </IconButton>
            <IconButton
              size="1"
              variant="soft"
              color="gray"
              onClick={handleCopyLink}
              title="Sao chép liên kết"
            >
              <FiLink size={14} />
            </IconButton>
            <IconButton
              size="1"
              variant="soft"
              color="gray"
              onClick={handleShare}
              title="Chia sẻ"
            >
              <FiShare2 size={14} />
            </IconButton>
            {canDelete && (
              <IconButton
                size="1"
                variant="soft"
                color="red"
                onClick={handleDelete}
                title="Xóa"
              >
                <FiTrash2 size={14} />
              </IconButton>
            )}
          </Flex>
        )}
      </Flex>
    </Card>
  );
}

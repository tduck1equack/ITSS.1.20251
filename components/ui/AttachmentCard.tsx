"use client";

import { Badge, Card, Flex, Text } from "@radix-ui/themes";
import {
  FiFile,
  FiFileText,
  FiImage,
  FiVideo,
  FiMusic,
  FiDownload,
} from "react-icons/fi";
import { useState } from "react";

interface AttachmentCardProps {
  attachment: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize?: number | null;
    mimeType?: string | null;
  };
  showDownload?: boolean;
}

export function AttachmentCard({
  attachment,
  showDownload = true,
}: AttachmentCardProps) {
  const [isHovering, setIsHovering] = useState(false);

  // Format file size
  const formatFileSize = (bytes?: number | null): string => {
    if (!bytes) return "Unknown size";
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
      return <FiVideo size={24} className="text-purple-500" />;
    }
    if (mimeType.startsWith("image/")) {
      return <FiImage size={24} className="text-blue-500" />;
    }
    if (mimeType.startsWith("audio/")) {
      return <FiMusic size={24} className="text-pink-500" />;
    }
    if (
      mimeType.includes("pdf") ||
      mimeType.includes("document") ||
      mimeType.includes("word")
    ) {
      return <FiFileText size={24} className="text-red-500" />;
    }
    if (
      mimeType.includes("spreadsheet") ||
      mimeType.includes("excel") ||
      mimeType.includes("csv")
    ) {
      return <FiFileText size={24} className="text-green-500" />;
    }
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) {
      return <FiFileText size={24} className="text-orange-500" />;
    }

    return <FiFile size={24} className="text-gray-500" />;
  };

  // Get file extension badge
  const getFileExtension = () => {
    const ext = attachment.fileName.split(".").pop()?.toUpperCase();
    return ext || "FILE";
  };

  // Check if it's a video file
  const isVideo =
    attachment.mimeType?.toLowerCase().startsWith("video/") || false;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = attachment.fileUrl;
    link.download = attachment.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Video player
  if (isVideo) {
    return (
      <Card
        className="bg-white p-3 relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="relative">
          <video
            controls
            className="w-full rounded-md"
            style={{ maxHeight: "400px" }}
          >
            <source src={attachment.fileUrl} type={attachment.mimeType || ""} />
            Your browser does not support the video tag.
          </video>
          {isHovering && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 rounded-b-md transition-opacity duration-200">
              <Text size="2" className="text-white font-medium">
                {attachment.fileName}
              </Text>
            </div>
          )}
        </div>
        {showDownload && (
          <Flex justify="between" align="center" className="mt-2">
            <Text size="1" className="text-gray-500">
              {formatFileSize(attachment.fileSize)}
            </Text>
            <button
              onClick={handleDownload}
              className="text-mint-600 hover:text-mint-700 flex items-center gap-1"
            >
              <FiDownload size={14} />
              <Text size="1">Tải xuống</Text>
            </button>
          </Flex>
        )}
      </Card>
    );
  }

  // Regular file card
  return (
    <Card className="bg-white hover:bg-gray-50 transition-colors">
      <Flex gap="3" align="center" className="p-2">
        <div className="flex-shrink-0">{getFileIcon()}</div>
        <Flex direction="column" gap="1" className="flex-1 min-w-0">
          <Text size="2" weight="medium" className="truncate">
            {attachment.fileName}
          </Text>
          <Flex align="center" gap="2">
            <Badge size="1" color="gray">
              {getFileExtension()}
            </Badge>
            <Text size="1" className="text-gray-500">
              {formatFileSize(attachment.fileSize)}
            </Text>
          </Flex>
        </Flex>
        {showDownload && (
          <button
            onClick={handleDownload}
            className="flex-shrink-0 text-mint-600 hover:text-mint-700 p-2 rounded hover:bg-mint-50 transition-colors"
            title="Tải xuống"
          >
            <FiDownload size={18} />
          </button>
        )}
      </Flex>
    </Card>
  );
}

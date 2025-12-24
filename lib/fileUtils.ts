/**
 * File utility functions for upload and file management
 */

/**
 * Format bytes to human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  if (bytes < 1024 * 1024 * 1024)
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

/**
 * Get MIME type from file extension
 */
export function getMimeType(filename: string): string {
  const extension = getFileExtension(filename);
  const mimeTypes: Record<string, string> = {
    // Documents
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    txt: "text/plain",
    csv: "text/csv",
    // Images
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    svg: "image/svg+xml",
    webp: "image/webp",
    // Videos
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    // Audio
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    // Archives
    zip: "application/zip",
    rar: "application/x-rar-compressed",
    "7z": "application/x-7z-compressed",
    tar: "application/x-tar",
    gz: "application/gzip",
  };

  return mimeTypes[extension] || "application/octet-stream";
}

/**
 * Check if file is an image
 */
export function isImage(filename: string): boolean {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp"];
  return imageExtensions.includes(getFileExtension(filename));
}

/**
 * Check if file is a video
 */
export function isVideo(filename: string): boolean {
  const videoExtensions = ["mp4", "webm", "mov", "avi", "mkv"];
  return videoExtensions.includes(getFileExtension(filename));
}

/**
 * Check if file is a document
 */
export function isDocument(filename: string): boolean {
  const docExtensions = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv"];
  return docExtensions.includes(getFileExtension(filename));
}

/**
 * Validate file size
 */
export function validateFileSize(
  fileSize: number,
  maxSizeMB: number = 10
): { valid: boolean; error?: string } {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (fileSize > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }
  return { valid: true };
}

/**
 * Validate file type
 */
export function validateFileType(
  filename: string,
  allowedExtensions: string[]
): { valid: boolean; error?: string } {
  const extension = getFileExtension(filename);
  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `File type .${extension} is not allowed. Allowed types: ${allowedExtensions.join(", ")}`,
    };
  }
  return { valid: true };
}

/**
 * Generate unique filename for upload
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = getFileExtension(originalFilename);
  return `${timestamp}-${random}.${extension}`;
}

/**
 * Extract filename from URL
 */
export function getFilenameFromUrl(url: string): string {
  return url.split("/").pop() || "";
}

/**
 * Check if URL is an upload URL
 */
export function isUploadUrl(url: string): boolean {
  return url.startsWith("/uploads/");
}

/**
 * Get file icon based on file type
 */
export function getFileIcon(filename: string): string {
  const extension = getFileExtension(filename);
  
  if (isImage(filename)) return "🖼️";
  if (isVideo(filename)) return "🎥";
  
  const iconMap: Record<string, string> = {
    pdf: "📄",
    doc: "📝",
    docx: "📝",
    xls: "📊",
    xlsx: "📊",
    ppt: "📽️",
    pptx: "📽️",
    txt: "📃",
    csv: "📊",
    zip: "📦",
    rar: "📦",
    "7z": "📦",
    mp3: "🎵",
    wav: "🎵",
  };

  return iconMap[extension] || "📎";
}

/**
 * Convert File to Base64 (useful for previews)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Download file from URL
 */
export function downloadFile(url: string, filename?: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || getFilenameFromUrl(url);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Allowed file extensions for uploads
 */
export const ALLOWED_EXTENSIONS = [
  // Documents
  "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv",
  // Images
  "jpg", "jpeg", "png", "gif", "svg", "webp",
  // Videos
  "mp4", "webm", "mov", "avi",
  // Audio
  "mp3", "wav", "ogg",
  // Archives
  "zip", "rar", "7z",
];

/**
 * Maximum file size in MB
 */
export const MAX_FILE_SIZE_MB = 10;

/**
 * Maximum file size in bytes
 */
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

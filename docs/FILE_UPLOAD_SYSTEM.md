# File Upload System Documentation

## Overview
This application implements a local file storage system using the `/public/uploads` directory. Files uploaded through the assignment and attachment dialogs are stored locally and served as static assets.

## Architecture

### Upload Flow
1. User selects a file through the upload dialog UI
2. File is validated (size limit: 10MB)
3. File is sent to `/api/upload` endpoint via FormData
4. Server generates unique filename and saves to `/public/uploads`
5. Server returns file metadata including public URL
6. Client receives URL and stores in database

### File Storage Structure
```
public/
└── uploads/
    ├── .gitkeep (tracks directory in git)
    ├── .gitignore (excludes uploaded files from git)
    └── [timestamp]-[random].[ext] (uploaded files)
```

## API Endpoints

### POST /api/upload
Handles file uploads and storage.

**Request:**
- Content-Type: multipart/form-data
- Body: FormData with "file" field

**Response:**
```json
{
  "success": true,
  "fileName": "original-name.pdf",
  "fileUrl": "/uploads/1234567890-abc123.pdf",
  "fileSize": 1024000,
  "mimeType": "application/pdf"
}
```

**Validation:**
- Maximum file size: 10MB
- Allowed file types: PDF, Word, Excel, PowerPoint, images, videos, archives
- File extension: .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt, .csv, .jpg, .jpeg, .png, .gif, .mp4, .webm, .mp3, .wav, .zip, .rar

**Error Responses:**
- 400: No file provided or file size exceeds limit
- 500: Server error during file processing

## Upload Components

### AssignmentUploadDialog
Location: `components/ui/AssignmentUploadDialog.tsx`

**Purpose:** Upload student assignment submissions

**Features:**
- File selection with drag-and-drop area
- Real-time file size validation
- File preview with name and size
- Upload progress indication
- Remove file before upload

**Usage:**
```tsx
<AssignmentUploadDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  assignmentId={assignmentId}
  studentId={studentId}
  onUpload={(fileData) => {
    // Handle uploaded file data
    console.log(fileData);
  }}
/>
```

### UploadAttachmentDialog
Location: `components/ui/UploadAttachmentDialog.tsx`

**Purpose:** Upload class attachments and materials

**Features:**
- Similar to AssignmentUploadDialog
- Optimized for class materials
- Supports all document types

**Usage:**
```tsx
<UploadAttachmentDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  onUpload={async (fileData) => {
    // Handle uploaded file data
    await saveAttachment(fileData);
  }}
/>
```

## Security Considerations

### File Validation
- Size limit enforced both client and server-side
- File type validation through accept attribute
- Unique filename generation prevents overwrites
- No path traversal vulnerabilities (sanitized paths)

### File Access
- Files served as static assets from /public
- No authentication required for file access (public files)
- Consider implementing signed URLs for sensitive files

### Recommended Improvements
For production deployments:
1. Add virus scanning before storage
2. Implement user-specific upload directories
3. Add file access logging
4. Implement file retention policies
5. Use cloud storage (S3, Azure Blob, etc.)
6. Add authentication to file URLs
7. Implement file compression
8. Add thumbnail generation for images

## File Management

### Manual Cleanup
Files can be manually removed from the server:
```bash
cd public/uploads
rm [filename]
```

### Programmatic Cleanup
Implement a cleanup job to remove old/unused files:
```typescript
// Example cleanup function (not implemented)
async function cleanupOrphanedFiles() {
  const files = await readdir('public/uploads');
  // Compare with database records
  // Delete files not referenced in database
}
```

## Troubleshooting

### File Not Uploading
1. Check file size (must be < 10MB)
2. Verify file type is in allowed list
3. Check browser console for errors
4. Verify /public/uploads directory exists with write permissions

### File URL Not Accessible
1. Verify file exists in /public/uploads
2. Check Next.js static file serving
3. Verify URL format: `/uploads/filename.ext` (not `/public/uploads/...`)

### Upload Directory Permissions
```bash
chmod 755 public/uploads
```

## Development vs Production

### Development
- Files stored locally in /public/uploads
- Files tracked in .gitignore
- No backup or redundancy
- Limited to single server instance

### Production Recommendations
1. **Use Cloud Storage:**
   - AWS S3
   - Azure Blob Storage
   - Google Cloud Storage
   - Cloudflare R2

2. **Implement CDN:**
   - Faster file delivery
   - Reduced server load
   - Global availability

3. **Add Processing:**
   - Image optimization
   - Video transcoding
   - Document preview generation

4. **Monitoring:**
   - Track upload success/failure rates
   - Monitor storage usage
   - Set up alerts for issues

## Testing

### Manual Testing
1. Navigate to assignment or class page
2. Click upload button
3. Select a test file
4. Verify file uploads successfully
5. Check file appears in /public/uploads
6. Verify file is accessible via URL
7. Test file download

### Automated Testing
```typescript
// Example test (not implemented)
describe('File Upload', () => {
  it('should upload file successfully', async () => {
    const file = new File(['content'], 'test.pdf', {
      type: 'application/pdf'
    });
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.fileUrl).toMatch(/^\/uploads\//);
  });
});
```

## Migration from Mock Implementation

The previous mock implementation used text inputs for file URLs. The new implementation:

**Before:**
```tsx
// Mock implementation
const [fileName, setFileName] = useState("");
const [fileUrl, setFileUrl] = useState("");
// User manually entered file name and URL
```

**After:**
```tsx
// Real implementation
const [selectedFile, setSelectedFile] = useState<File | null>(null);
// User selects actual file through file input
// File is uploaded to server
// Server returns actual URL
```

## Additional Resources

- [Next.js Static File Serving](https://nextjs.org/docs/basic-features/static-file-serving)
- [FormData API](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [File API](https://developer.mozilla.org/en-US/docs/Web/API/File)

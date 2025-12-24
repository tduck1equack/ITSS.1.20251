# File Upload Implementation Summary

## Changes Made

### 1. Created Upload API Endpoint
**File:** `app/api/upload/route.ts`
- Handles multipart/form-data file uploads
- Validates file size (max 10MB)
- Generates unique filenames using timestamp + random string
- Saves files to `/public/uploads` directory
- Returns file metadata (fileName, fileUrl, fileSize, mimeType)

### 2. Updated AssignmentUploadDialog
**File:** `components/ui/AssignmentUploadDialog.tsx`
- Replaced text inputs with real file input
- Added file selection with drag-and-drop area UI
- Implemented file size validation (client-side)
- Added file preview showing name and size
- Integrated with `/api/upload` endpoint
- Updated to upload actual files instead of mock URLs

### 3. Updated UploadAttachmentDialog
**File:** `components/ui/UploadAttachmentDialog.tsx`
- Same changes as AssignmentUploadDialog
- Supports class attachment uploads
- Real file handling instead of mock implementation

### 4. Created Upload Directory Structure
**Directory:** `public/uploads/`
- Created uploads directory in public folder
- Added `.gitkeep` to track directory in git
- Added `.gitignore` to exclude uploaded files from version control
- Files accessible via `/uploads/[filename]` URL

### 5. Documentation
**File:** `docs/FILE_UPLOAD_SYSTEM.md`
- Comprehensive documentation of upload system
- API endpoint details
- Component usage examples
- Security considerations
- Troubleshooting guide
- Production recommendations

## How It Works

### Upload Process
1. User opens upload dialog (assignment submission or class attachment)
2. User clicks to select a file from their device
3. File is validated for size (must be ≤ 10MB)
4. File information is displayed (name and size)
5. User clicks "Upload" button
6. File is sent to `/api/upload` via FormData
7. Server saves file to `/public/uploads/[timestamp]-[random].[ext]`
8. Server responds with file metadata including public URL
9. Client stores file information in database
10. File is accessible at `/uploads/[filename]`

### File Naming
Files are renamed on upload using the format:
```
[timestamp]-[random].[extension]
Example: 1703431234567-abc123def456.pdf
```

This prevents:
- Filename conflicts
- Overwriting existing files
- Path traversal attacks
- Special character issues

## Testing the Implementation

### 1. Start Development Server
```bash
cd /home/tduckie/External/Codes/School\ Projects/itss.1.20251
npm run dev
```

### 2. Test Assignment Submission Upload
1. Navigate to a student assignment page
2. Click on "Submit Assignment" or "Upload" button
3. Select a test file (any file < 10MB)
4. Verify file name and size are displayed
5. Click "Upload"
6. Check that upload succeeds
7. Verify file appears in `public/uploads/` directory

### 3. Test Class Attachment Upload
1. Navigate to a class page as teacher
2. Click "Upload Attachment" or similar
3. Select a test file
4. Upload the file
5. Verify file is saved correctly

### 4. Verify File Access
1. After uploading, note the file URL (e.g., `/uploads/1703431234567-abc.pdf`)
2. Navigate to `http://localhost:3000/uploads/[filename]`
3. Verify file is downloadable/viewable

### 5. Test Validation
1. Try uploading a file > 10MB → Should show error
2. Try submitting without selecting file → Should show error
3. Select file, then remove it → Upload button should be disabled

## File Structure

```
itss.1.20251/
├── app/
│   └── api/
│       └── upload/
│           └── route.ts                    # NEW: Upload endpoint
├── components/
│   └── ui/
│       ├── AssignmentUploadDialog.tsx      # UPDATED: Real file upload
│       └── UploadAttachmentDialog.tsx      # UPDATED: Real file upload
├── docs/
│   └── FILE_UPLOAD_SYSTEM.md              # NEW: Documentation
└── public/
    └── uploads/                            # NEW: Upload directory
        ├── .gitignore                      # Excludes files from git
        ├── .gitkeep                        # Tracks directory
        └── [uploaded-files]                # User uploaded files
```

## Key Features

### ✅ Implemented
- Real file upload (no more mock URLs)
- Local storage in /public directory
- File size validation (10MB limit)
- Unique filename generation
- File type filtering
- Upload progress indication
- File preview before upload
- Error handling
- Client and server-side validation

### 🔄 For Future Enhancement
- Cloud storage integration (S3, Azure, etc.)
- File compression
- Image thumbnail generation
- Progress bar for large uploads
- Multiple file upload at once
- Drag and drop file upload
- File type icons
- Download statistics
- File expiry/cleanup
- Virus scanning

## Security Notes

### Current Implementation
- Files are publicly accessible (no authentication)
- Size limited to 10MB
- File types limited by accept attribute
- Unique filenames prevent overwrites
- No executable file uploads recommended

### Production Recommendations
1. Add user authentication to file access
2. Implement virus scanning
3. Use cloud storage with CDN
4. Add rate limiting on uploads
5. Implement file access logging
6. Add CORS restrictions
7. Scan for malicious content
8. Implement signed URLs for temporary access

## Migration Notes

### Before (Mock Implementation)
```tsx
// Users manually entered file URLs
<TextField.Root
  placeholder="https://example.com/file.pdf"
  value={fileUrl}
  onChange={(e) => setFileUrl(e.target.value)}
/>
```

### After (Real Implementation)
```tsx
// Users select actual files
<input
  type="file"
  onChange={handleFileSelect}
  accept=".pdf,.doc,.docx,..."
/>
```

## Troubleshooting

### Issue: Files not uploading
**Check:**
- File size < 10MB
- File type in allowed list
- `/public/uploads` directory exists
- Server has write permissions

### Issue: Files not accessible
**Check:**
- File exists in `/public/uploads`
- URL format: `/uploads/filename` (not `/public/uploads/filename`)
- Next.js dev server is running

### Issue: Upload directory not found
**Solution:**
```bash
mkdir -p public/uploads
chmod 755 public/uploads
```

## Next Steps

1. **Test the upload functionality** with various file types
2. **Monitor the uploads directory** for storage usage
3. **Consider cloud storage** for production deployment
4. **Implement file cleanup** for unused files
5. **Add download tracking** for analytics
6. **Implement access control** if files should be private

## Questions?

Refer to the detailed documentation:
- **Full System Docs:** `docs/FILE_UPLOAD_SYSTEM.md`
- **API Endpoint:** `app/api/upload/route.ts`
- **Upload Dialogs:** `components/ui/*UploadDialog.tsx`

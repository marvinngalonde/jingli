# Storage Buckets Setup Guide

## 📦 Storage Buckets Created

The following storage buckets have been configured for the Jingli School Management System:

### 1. **student-photos** (Private)
- **Purpose**: Student profile pictures
- **File Size Limit**: 5MB
- **Allowed Types**: JPEG, PNG, WebP
- **Access**: Authenticated users can upload/view, Admin can delete

### 2. **staff-photos** (Private)
- **Purpose**: Staff profile pictures
- **File Size Limit**: 5MB
- **Allowed Types**: JPEG, PNG, WebP
- **Access**: Authenticated users can upload/view, Admin can delete

### 3. **book-covers** (Public)
- **Purpose**: Library book cover images
- **File Size Limit**: 2MB
- **Allowed Types**: JPEG, PNG, WebP
- **Access**: Public viewing, Authenticated users can upload, Admin can delete

### 4. **documents** (Private)
- **Purpose**: Admission documents, certificates, reports
- **File Size Limit**: 10MB
- **Allowed Types**: PDF, JPEG, PNG, DOC, DOCX
- **Access**: Authenticated users can upload/view, Admin can delete

---

## 🚀 Setup Instructions

### Run the Storage Migration

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/002_create_storage_buckets.sql`
4. Paste and execute the SQL

This will:
- ✅ Create all 4 storage buckets
- ✅ Set file size limits
- ✅ Configure allowed MIME types
- ✅ Apply Row Level Security policies

---

## 💻 Usage Examples

### Upload Student Photo

```typescript
import { storageService } from './services/storageService';

// Upload photo
const photoPath = await storageService.uploadStudentPhoto(
    studentId,
    photoFile
);

// Get signed URL to display
const photoUrl = await storageService.getStudentPhotoUrl(photoPath);
```

### Upload Book Cover

```typescript
// Upload cover (returns public URL)
const coverUrl = await storageService.uploadBookCover(
    bookId,
    coverFile
);

// No need for signed URL - it's public!
// Use coverUrl directly in <img src={coverUrl} />
```

### Upload Document

```typescript
// Upload admission document
const docPath = await storageService.uploadDocument(
    'admissions',
    'birth-certificate',
    documentFile
);

// Get signed URL (valid for 1 hour by default)
const docUrl = await storageService.getDocumentUrl(docPath);
```

### Delete File

```typescript
await storageService.deleteFile('student-photos', photoPath);
```

---

## 🔐 Security Policies

### Student Photos
- **Upload**: Any authenticated user
- **View**: Any authenticated user
- **Update**: Admin and staff only
- **Delete**: Admin only

### Staff Photos
- **Upload**: Any authenticated user
- **View**: Any authenticated user
- **Update**: Owner or admin
- **Delete**: Admin only

### Book Covers (Public)
- **View**: Anyone (public)
- **Upload**: Authenticated users
- **Update**: Admin and staff
- **Delete**: Admin only

### Documents
- **Upload**: Any authenticated user
- **View**: Any authenticated user
- **Update**: Admin and staff
- **Delete**: Admin only

---

## 📝 Integration with Forms

### Example: Add Photo Upload to AddStudentModal

```typescript
import { storageService } from '../services/storageService';

const handleSubmit = async (values) => {
    try {
        // Upload photo first
        let photoPath = null;
        if (photoFile) {
            photoPath = await storageService.uploadStudentPhoto(
                values.student_id,
                photoFile
            );
        }

        // Create student with photo path
        await studentService.create({
            ...values,
            avatar_url: photoPath
        });

        showSuccessNotification('Student added successfully!');
    } catch (error) {
        showErrorNotification(error.message);
    }
};
```

---

## 🎨 Display Images

### For Private Buckets (student-photos, staff-photos, documents)

```typescript
const [photoUrl, setPhotoUrl] = useState<string | null>(null);

useEffect(() => {
    if (student.avatar_url) {
        storageService.getStudentPhotoUrl(student.avatar_url)
            .then(setPhotoUrl);
    }
}, [student.avatar_url]);

return <Avatar src={photoUrl} />;
```

### For Public Buckets (book-covers)

```typescript
// Direct usage - no signed URL needed
const coverUrl = storageService.getPublicUrl('book-covers', book.cover_image_url);

return <img src={coverUrl} alt={book.title} />;
```

---

## 📊 Storage Service API

| Method | Description |
|--------|-------------|
| `uploadFile(bucket, path, file)` | Upload file to any bucket |
| `getSignedUrl(bucket, path, expiresIn)` | Get signed URL for private files |
| `getPublicUrl(bucket, path)` | Get public URL for public files |
| `deleteFile(bucket, path)` | Delete a file |
| `listFiles(bucket, folder)` | List files in a folder |
| `uploadStudentPhoto(studentId, file)` | Upload student photo |
| `uploadStaffPhoto(staffId, file)` | Upload staff photo |
| `uploadBookCover(bookId, file)` | Upload book cover |
| `uploadDocument(category, fileName, file)` | Upload document |
| `getStudentPhotoUrl(path)` | Get student photo URL |
| `getStaffPhotoUrl(path)` | Get staff photo URL |
| `getDocumentUrl(path)` | Get document URL |

---

## ✅ Next Steps

1. Run the storage migration SQL
2. Test file uploads in Supabase dashboard
3. Integrate file upload into modals (AddStudentModal, AddStaffModal, etc.)
4. Update student/staff display components to show photos
5. Add file upload UI components (drag & drop, preview, etc.)

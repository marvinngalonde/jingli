import { supabase } from '../lib/supabase';

export type BucketName = 'student-photos' | 'staff-photos' | 'book-covers' | 'documents';

export const storageService = {
    /**
     * Upload a file to a storage bucket
     * @param bucket - The bucket name
     * @param path - The file path within the bucket
     * @param file - The file to upload
     * @returns The public URL or path to the uploaded file
     */
    async uploadFile(bucket: BucketName, path: string, file: File) {
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file, {
                cacheControl: '3600',
                upsert: true,
            });

        if (error) throw error;

        // For public buckets, return the public URL
        if (bucket === 'book-covers') {
            const { data: publicData } = supabase.storage
                .from(bucket)
                .getPublicUrl(path);
            return publicData.publicUrl;
        }

        // For private buckets, return the path
        return data.path;
    },

    /**
     * Get a signed URL for a private file
     * @param bucket - The bucket name
     * @param path - The file path
     * @param expiresIn - Expiration time in seconds (default: 1 hour)
     * @returns Signed URL
     */
    async getSignedUrl(bucket: BucketName, path: string, expiresIn: number = 3600) {
        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(path, expiresIn);

        if (error) throw error;
        return data.signedUrl;
    },

    /**
     * Get public URL for a file (only works for public buckets)
     * @param bucket - The bucket name
     * @param path - The file path
     * @returns Public URL
     */
    getPublicUrl(bucket: BucketName, path: string) {
        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(path);

        return data.publicUrl;
    },

    /**
     * Delete a file from storage
     * @param bucket - The bucket name
     * @param path - The file path
     */
    async deleteFile(bucket: BucketName, path: string) {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([path]);

        if (error) throw error;
    },

    /**
     * List files in a bucket folder
     * @param bucket - The bucket name
     * @param folder - The folder path (optional)
     * @returns List of files
     */
    async listFiles(bucket: BucketName, folder: string = '') {
        const { data, error } = await supabase.storage
            .from(bucket)
            .list(folder);

        if (error) throw error;
        return data;
    },

    /**
     * Upload student photo
     * @param studentId - The student ID
     * @param file - The photo file
     * @returns The file path
     */
    async uploadStudentPhoto(studentId: string, file: File) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${studentId}-${Date.now()}.${fileExt}`;
        const filePath = `students/${fileName}`;

        return await this.uploadFile('student-photos', filePath, file);
    },

    /**
     * Upload staff photo
     * @param staffId - The staff ID
     * @param file - The photo file
     * @returns The file path
     */
    async uploadStaffPhoto(staffId: string, file: File) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${staffId}-${Date.now()}.${fileExt}`;
        const filePath = `staff/${fileName}`;

        return await this.uploadFile('staff-photos', filePath, file);
    },

    /**
     * Upload book cover
     * @param bookId - The book ID
     * @param file - The cover image file
     * @returns The public URL
     */
    async uploadBookCover(bookId: string, file: File) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${bookId}-${Date.now()}.${fileExt}`;
        const filePath = `covers/${fileName}`;

        return await this.uploadFile('book-covers', filePath, file);
    },

    /**
     * Upload document
     * @param category - Document category (e.g., 'admissions', 'certificates')
     * @param fileName - The file name
     * @param file - The document file
     * @returns The file path
     */
    async uploadDocument(category: string, fileName: string, file: File) {
        const fileExt = file.name.split('.').pop();
        const uniqueFileName = `${fileName}-${Date.now()}.${fileExt}`;
        const filePath = `${category}/${uniqueFileName}`;

        return await this.uploadFile('documents', filePath, file);
    },

    /**
     * Get student photo URL
     * @param path - The file path
     * @returns Signed URL
     */
    async getStudentPhotoUrl(path: string) {
        return await this.getSignedUrl('student-photos', path);
    },

    /**
     * Get staff photo URL
     * @param path - The file path
     * @returns Signed URL
     */
    async getStaffPhotoUrl(path: string) {
        return await this.getSignedUrl('staff-photos', path);
    },

    /**
     * Get document URL
     * @param path - The file path
     * @returns Signed URL
     */
    async getDocumentUrl(path: string) {
        return await this.getSignedUrl('documents', path);
    },
};

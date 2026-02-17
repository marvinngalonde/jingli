import { api } from './api';
import type { Student, CreateStudentDto, UpdateStudentDto } from '../types/students';

export const studentService = {
    // Get all students
    async getAll(filters?: { sectionId?: string; schoolId?: string }) {
        const { data } = await api.get<Student[]>('/students', { params: filters });
        return data;
    },

    // Get student by ID
    async getById(id: string) {
        const { data } = await api.get<Student>(`/students/${id}`);
        return data;
    },

    // Create new student
    async create(student: CreateStudentDto) {
        const { data } = await api.post<Student>('/students', student);
        return data;
    },

    // Update student
    async update(id: string, updates: UpdateStudentDto) {
        const { data } = await api.patch<Student>(`/students/${id}`, updates);
        return data;
    },

    // Delete student
    async delete(id: string) {
        await api.delete(`/students/${id}`);
    },

    // Search students (using local filter or backend search if implemented)
    // For now, let's keep it simple or implement if backend supports 'q'
    async search(query: string) {
        // Fallback to fetching all and filtering client side if backend doesn't support search 
        // OR implement backend search parameter.
        // Assuming getAll matches backend which supports sectionId/schoolId.
        // We'll return empty for now to force using getAll + client filter in components
        // or update backend to support 'search'.
        // Let's implement client-side filtering helper or just remove if not used directly.
        // Returning GetAll for now to let component handle filter.
        const { data } = await api.get<Student[]>('/students');
        return data.filter(s =>
            s.firstName.toLowerCase().includes(query.toLowerCase()) ||
            s.lastName.toLowerCase().includes(query.toLowerCase()) ||
            s.admissionNo.toLowerCase().includes(query.toLowerCase())
        );
    },
};

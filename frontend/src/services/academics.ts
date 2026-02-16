import { api } from './api';
import type {
    AcademicYear,
    ClassLevel,
    ClassSection,
    Subject,
    CreateClassLevelDto,
    CreateClassSectionDto,
    CreateSubjectDto,
    CreateAcademicYearDto,
} from '../types/academics';

// ============================================================================
// CLASSES
// ============================================================================

export const classesApi = {
    // Get all classes (levels with sections)
    getAll: async (): Promise<ClassLevel[]> => {
        const { data } = await api.get('/classes');
        return data;
    },

    // Get single class level
    getOne: async (id: string): Promise<ClassLevel> => {
        const { data } = await api.get(`/classes/${id}`);
        return data;
    },

    // Create class level
    createLevel: async (dto: CreateClassLevelDto): Promise<ClassLevel> => {
        const { data } = await api.post('/classes/levels', dto);
        return data;
    },

    // Create class section
    createSection: async (dto: CreateClassSectionDto): Promise<ClassSection> => {
        const { data } = await api.post('/classes/sections', dto);
        return data;
    },

    // Update class level
    updateLevel: async (id: string, dto: Partial<CreateClassLevelDto>): Promise<ClassLevel> => {
        const { data } = await api.patch(`/classes/levels/${id}`, dto);
        return data;
    },

    // Update class section
    updateSection: async (id: string, dto: Partial<CreateClassSectionDto>): Promise<ClassSection> => {
        const { data } = await api.patch(`/classes/sections/${id}`, dto);
        return data;
    },

    // Delete class
    delete: async (id: string): Promise<void> => {
        await api.delete(`/classes/${id}`);
    },
};

// ============================================================================
// SUBJECTS
// ============================================================================

export const subjectsApi = {
    // Get all subjects
    getAll: async (): Promise<Subject[]> => {
        const { data } = await api.get('/subjects');
        return data;
    },

    // Get single subject
    getOne: async (id: string): Promise<Subject> => {
        const { data } = await api.get(`/subjects/${id}`);
        return data;
    },

    // Create subject
    create: async (dto: CreateSubjectDto): Promise<Subject> => {
        const { data } = await api.post('/subjects', dto);
        return data;
    },

    // Update subject
    update: async (id: string, dto: Partial<CreateSubjectDto>): Promise<Subject> => {
        const { data } = await api.patch(`/subjects/${id}`, dto);
        return data;
    },

    // Delete subject
    delete: async (id: string): Promise<void> => {
        await api.delete(`/subjects/${id}`);
    },
};

// ============================================================================
// ACADEMIC YEARS
// ============================================================================

export const academicYearsApi = {
    // Get all academic years
    getAll: async (): Promise<AcademicYear[]> => {
        const { data } = await api.get('/academic-years');
        return data;
    },

    // Get single academic year
    getOne: async (id: string): Promise<AcademicYear> => {
        const { data } = await api.get(`/academic-years/${id}`);
        return data;
    },

    // Create academic year
    create: async (dto: CreateAcademicYearDto): Promise<AcademicYear> => {
        const { data } = await api.post('/academic-years', dto);
        return data;
    },

    // Update academic year
    update: async (id: string, dto: Partial<CreateAcademicYearDto>): Promise<AcademicYear> => {
        const { data } = await api.patch(`/academic-years/${id}`, dto);
        return data;
    },

    // Activate academic year
    activate: async (id: string): Promise<AcademicYear> => {
        const { data } = await api.patch(`/academic-years/${id}/activate`);
        return data;
    },

    // Delete academic year
    delete: async (id: string): Promise<void> => {
        await api.delete(`/academic-years/${id}`);
    },
};

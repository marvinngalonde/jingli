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
    getAll: async (schoolId?: string): Promise<ClassLevel[]> => {
        // schoolId is handled by backend token usually, but sometimes passed as param
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
    getAll: async (schoolId?: string): Promise<Subject[]> => {
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

// ============================================================================
// TIMETABLE
// ============================================================================

import type {
    TimetableEntry,
    CreateTimetableDto,
    BulkCreateTimetableDto
} from '../types/academics';

export const timetableApi = {
    // Get all entries (with optional filters)
    getAll: async (filters?: { sectionId?: string; teacherId?: string; subjectId?: string }): Promise<TimetableEntry[]> => {
        const { data } = await api.get('/timetable', { params: filters });
        return data;
    },

    // Get single entry
    getOne: async (id: string): Promise<TimetableEntry> => {
        const { data } = await api.get(`/timetable/${id}`);
        return data;
    },

    // Create entry
    create: async (dto: CreateTimetableDto): Promise<TimetableEntry> => {
        const { data } = await api.post('/timetable', dto);
        return data;
    },

    // Bulk create entries
    bulkCreate: async (dto: BulkCreateTimetableDto): Promise<void> => {
        await api.post('/timetable/bulk', dto);
    },

    // Update entry
    update: async (id: string, dto: Partial<CreateTimetableDto>): Promise<TimetableEntry> => {
        const { data } = await api.patch(`/timetable/${id}`, dto);
        return data;
    },

    // Delete entry
    delete: async (id: string): Promise<void> => {
        await api.delete(`/timetable/${id}`);
    },
};

// Unified Service Export for Backward Compatibility
export const academicsService = {
    getSubjects: subjectsApi.getAll,
    getSubject: subjectsApi.getOne,
    createSubject: subjectsApi.create,
    updateSubject: subjectsApi.update,
    deleteSubject: subjectsApi.delete,

    getClasses: classesApi.getAll,
    getClass: classesApi.getOne,
    createClassLevel: classesApi.createLevel,
    createClassSection: classesApi.createSection,
    updateClassLevel: classesApi.updateLevel,
    updateClassSection: classesApi.updateSection,
    deleteClass: classesApi.delete,

    getAcademicYears: academicYearsApi.getAll,
    getAcademicYear: academicYearsApi.getOne,
    createAcademicYear: academicYearsApi.create,
    updateAcademicYear: academicYearsApi.update,
    activateAcademicYear: academicYearsApi.activate,
    deleteAcademicYear: academicYearsApi.delete,
};

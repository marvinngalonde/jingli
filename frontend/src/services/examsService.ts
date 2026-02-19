import { api } from './api';
import type { Exam, ExamTerm, CreateExamDto, ExamResult } from '../types/exams';

export const examsService = {
    // Exams
    getExams: async (schoolId: string, filters?: { termId?: string, classLevelId?: string }) => {
        const response = await api.get<Exam[]>('/exams', { params: { schoolId, ...filters } });
        return response.data;
    },

    getExam: async (id: string) => {
        const response = await api.get<Exam>(`/exams/${id}`);
        return response.data;
    },

    createExam: async (data: CreateExamDto) => {
        const response = await api.post<Exam>('/exams', data);
        return response.data;
    },

    deleteExam: async (id: string) => {
        await api.delete(`/exams/${id}`);
    },

    updateExam: async (id: string, data: Partial<CreateExamDto>) => {
        const response = await api.patch<Exam>(`/exams/${id}`, data);
        return response.data;
    },

    // Terms
    getTerms: async (schoolId: string) => {
        const response = await api.get<ExamTerm[]>('/exams/terms', { params: { schoolId } });
        return response.data;
    },

    // Results
    submitBulkResults: async (examId: string, results: { studentId: string, marksObtained: number, remarks?: string, gradedBy: string }[]) => {
        const response = await api.post('/exam-results/bulk', { examId, results });
        return response.data;
    },

    getExamResults: async (examId: string) => {
        const response = await api.get<ExamResult[]>(`/exam-results/exam/${examId}`);
        return response.data;
    },

    getStudentResults: async (studentId: string) => {
        const response = await api.get<ExamResult[]>(`/exam-results/student/${studentId}`);
        return response.data;
    }
};

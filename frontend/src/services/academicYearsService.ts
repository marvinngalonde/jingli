import { api } from './api';

export interface AcademicYear {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    current: boolean;
    schoolId: string;
}

export const academicYearsService = {
    getAll: () => api.get<AcademicYear[]>('/academic-years').then(res => res.data),
    getOne: (id: string) => api.get<AcademicYear>(`/academic-years/${id}`).then(res => res.data),
    create: (data: Partial<AcademicYear>) => api.post<AcademicYear>('/academic-years', data).then(res => res.data),
    update: (id: string, data: Partial<AcademicYear>) => api.patch<AcademicYear>(`/academic-years/${id}`, data).then(res => res.data),
    delete: (id: string) => api.delete(`/academic-years/${id}`).then(res => res.data),
    activate: (id: string) => api.post(`/academic-years/${id}/activate`).then(res => res.data),
};

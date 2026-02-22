import { api } from './api';

export interface ReportLog {
    id: string;
    name: string;
    type: string;
    status: string;
    generatedBy: string;
    fileUrl?: string;
    parameters?: any;
    createdAt: string;
}

export interface ReportStats {
    totalGenerated: number;
    downloads: number;
    pending: number;
    storageUsed: string;
}

export interface ReportColumn { header: string; key: string; }
export interface LiveReportResult {
    title: string;
    columns: ReportColumn[];
    rows: Record<string, any>[];
    totalRecords: number;
}

export const reportsService = {
    getHistory: async (): Promise<ReportLog[]> => {
        const response = await api.get('/reports/history');
        return response.data;
    },

    getStats: async (): Promise<ReportStats> => {
        const response = await api.get('/reports/stats');
        return response.data;
    },

    generateReport: async (data: any): Promise<ReportLog> => {
        const response = await api.post('/reports/generate', data);
        return response.data;
    },

    getById: async (id: string): Promise<ReportLog> => {
        const response = await api.get(`/reports/${id}`);
        return response.data;
    },

    downloadPdf: async (id: string, filename: string): Promise<void> => {
        const response = await api.get(`/reports/${id}/pdf`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${filename}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/reports/${id}`);
    },

    // ─── Live tabular data reports ──────────────────────────────────────────────
    getReportData: async (type: string, filters: Record<string, string> = {}): Promise<LiveReportResult> => {
        const params = new URLSearchParams({ type, ...filters }).toString();
        const response = await api.get(`/reports/data?${params}`);
        return response.data;
    },

    downloadReportDataPdf: async (type: string, filters: Record<string, string> = {}, filename: string): Promise<void> => {
        const params = new URLSearchParams({ type, ...filters }).toString();
        const response = await api.get(`/reports/data/pdf?${params}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
    },
};

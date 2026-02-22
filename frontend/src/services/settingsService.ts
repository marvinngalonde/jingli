import { api } from './api';

export interface SchoolSettings {
    id: string;
    name: string;
    logoUrl?: string;
    config?: any;
}

export const settingsService = {
    getSettings: async (): Promise<SchoolSettings> => {
        const response = await api.get('/system/settings');
        return response.data;
    },

    updateSettings: async (data: Partial<SchoolSettings>): Promise<SchoolSettings> => {
        const response = await api.patch('/system/settings', data);
        return response.data;
    }
};

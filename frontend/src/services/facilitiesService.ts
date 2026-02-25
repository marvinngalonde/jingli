import { api } from './api';

export interface AssetCategory {
    id: string;
    name: string;
    description?: string;
    _count?: { assets: number };
}

export interface Asset {
    id: string;
    name: string;
    categoryId: string;
    serialNo?: string;
    location?: string;
    purchaseDate?: string;
    purchasePrice?: number;
    condition: string;
    quantity: number;
    notes?: string;
    createdAt: string;
    category?: { id: string; name: string };
}

export interface AssetStats {
    totalAssets: number;
    totalValue: number;
    categories: number;
}

export const assetService = {
    // Stats
    getStats: () => api.get('/assets/stats').then(r => r.data as AssetStats),

    // Categories
    getCategories: () => api.get('/assets/categories').then(r => r.data as AssetCategory[]),
    createCategory: (data: { name: string; description?: string }) =>
        api.post('/assets/categories', data).then(r => r.data),
    deleteCategory: (id: string) => api.delete(`/assets/categories/${id}`).then(r => r.data),

    // Assets
    getAll: (categoryId?: string, condition?: string) => {
        const params = new URLSearchParams();
        if (categoryId) params.append('categoryId', categoryId);
        if (condition) params.append('condition', condition);
        return api.get(`/assets?${params}`).then(r => r.data as Asset[]);
    },
    getOne: (id: string) => api.get(`/assets/${id}`).then(r => r.data as Asset),
    create: (data: Partial<Asset>) => api.post('/assets', data).then(r => r.data),
    update: (id: string, data: Partial<Asset>) => api.patch(`/assets/${id}`, data).then(r => r.data),
    remove: (id: string) => api.delete(`/assets/${id}`).then(r => r.data),
};

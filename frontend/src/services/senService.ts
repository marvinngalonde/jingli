import { api } from './api';

export const senService = {
  // Profiles
  getProfiles: async () => {
    const response = await api.get('/sen/profiles');
    return response.data;
  },
  createProfile: async (data: any) => {
    const response = await api.post('/sen/profiles', data);
    return response.data;
  },
  updateProfile: async (id: string, data: any) => {
    const response = await api.patch(`/sen/profiles/${id}`, data);
    return response.data;
  },

  // IEPs
  getIEPs: async (profileId: string) => {
    const response = await api.get(`/sen/profiles/${profileId}/ieps`);
    return response.data;
  },
  createIEP: async (profileId: string, data: any) => {
    const response = await api.post(`/sen/profiles/${profileId}/ieps`, data);
    return response.data;
  },
  updateIEP: async (id: string, data: any) => {
    const response = await api.patch(`/sen/ieps/${id}`, data);
    return response.data;
  },
  deleteIEP: async (id: string) => {
    const response = await api.delete(`/sen/ieps/${id}`);
    return response.data;
  },
  deleteProfile: async (id: string) => {
    const response = await api.delete(`/sen/profiles/${id}`);
    return response.data;
  },
};

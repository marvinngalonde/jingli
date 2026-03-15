import { api } from './api';

export const labService = {
  // Chemicals
  getChemicals: async () => {
    const response = await api.get('/lab/chemicals');
    return response.data;
  },
  createChemical: async (data: any) => {
    const response = await api.post('/lab/chemicals', data);
    return response.data;
  },
  updateChemical: async (id: string, data: any) => {
    const response = await api.patch(`/lab/chemicals/${id}`, data);
    return response.data;
  },
  deleteChemical: async (id: string) => {
    const response = await api.delete(`/lab/chemicals/${id}`);
    return response.data;
  },

  // Bookings
  getBookings: async () => {
    const response = await api.get('/lab/bookings');
    return response.data;
  },
  createBooking: async (data: any) => {
    const response = await api.post('/lab/bookings', data);
    return response.data;
  },
  updateBookingStatus: async (id: string, status: string) => {
    const response = await api.patch(`/lab/bookings/${id}/status`, { status });
    return response.data;
  },
  deleteBooking: async (id: string) => {
    const response = await api.delete(`/lab/bookings/${id}`);
    return response.data;
  },

  // Equipment
  getEquipment: async () => {
    const response = await api.get('/lab/equipment');
    return response.data;
  },
  createEquipment: async (data: any) => {
    const response = await api.post('/lab/equipment', data);
    return response.data;
  },
  updateEquipment: async (id: string, data: any) => {
    const response = await api.patch(`/lab/equipment/${id}`, data);
    return response.data;
  },
  deleteEquipment: async (id: string) => {
    const response = await api.delete(`/lab/equipment/${id}`);
    return response.data;
  },
};

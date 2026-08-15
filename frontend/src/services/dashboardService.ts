import { api } from './api';
import { DashboardStats, DashboardTrends } from '../types';

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    return api.get<DashboardStats>('/dashboard/stats');
  },

  getTrends: async (days: number = 14): Promise<DashboardTrends> => {
    return api.get<DashboardTrends>(`/dashboard/trends?days=${days}`);
  },
};

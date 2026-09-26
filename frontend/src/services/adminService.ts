import { api } from './api';
import { AdminUserItem, AdminAuditLogItem, SystemHealth } from '../types';

export const adminService = {
  getUsers: async (params: { page?: number; page_size?: number; search?: string } = {}): Promise<{
    total: number;
    page: number;
    page_size: number;
    items: AdminUserItem[];
  }> => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.page_size) query.append('page_size', params.page_size.toString());
    if (params.search) query.append('search', params.search);
    return api.get(`/admin/users?${query.toString()}`);
  },

  updateUserStatus: async (userId: number, isActive: boolean): Promise<{ message: string; is_active: boolean }> => {
    return api.patch(`/admin/users/${userId}/status`, { is_active: isActive });
  },

  getAuditLogs: async (params: { page?: number; page_size?: number; search?: string } = {}): Promise<{
    total: number;
    page: number;
    page_size: number;
    items: AdminAuditLogItem[];
  }> => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.page_size) query.append('page_size', params.page_size.toString());
    if (params.search) query.append('search', params.search);
    return api.get(`/admin/audit-logs?${query.toString()}`);
  },

  getSystemHealth: async (): Promise<SystemHealth> => {
    return api.get<SystemHealth>('/admin/system-health');
  },
};

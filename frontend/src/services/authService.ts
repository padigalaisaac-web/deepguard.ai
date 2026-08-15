import { api } from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/login', { email, password });
  },

  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/register', { name, email, password });
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('deepguard_token');
      localStorage.removeItem('deepguard_user');
    }
  },

  getMe: async (): Promise<User> => {
    return api.get<User>('/auth/me');
  },

  updateProfile: async (data: { name?: string; password?: string }): Promise<User> => {
    return api.patch<User>('/auth/profile', data);
  },
};

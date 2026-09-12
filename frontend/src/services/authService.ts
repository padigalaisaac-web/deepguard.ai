import { supabase } from '../lib/supabase';

export const authService = {
  async register(name: string, email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'user',
        },
      },
    });

    if (error) throw new Error(error.message);

    return data;
  },

  async login(email: string, password: string) {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) throw new Error(error.message);

    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();

    if (error) throw new Error(error.message);
  },

  async getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user;
  },

  async updateProfile(updates: {
    name?: string;
    role?: string;
    password?: string;
  }) {
    const userData: {
      data?: {
        name?: string;
        role?: string;
      };
      password?: string;
    } = {};

    if (updates.name || updates.role) {
      userData.data = {
        name: updates.name,
        role: updates.role,
      };
    }

    if (updates.password) {
      userData.password = updates.password;
    }

    const { data, error } =
      await supabase.auth.updateUser(userData);

    if (error) throw new Error(error.message);

    return data.user;
  },
};

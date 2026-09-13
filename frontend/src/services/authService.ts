import { supabase } from '../lib/supabase';

export type ProfileUpdates = {
  name?: string;
  role?: string;
  password?: string;
};

export const authService = {
  async register(
    name: string,
    email: string,
    password: string
  ) {
    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'user',
          },
        },
      });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async login(
    email: string,
    password: string
  ) {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async logout() {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  },

  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return null;
    }

    return user;
  },

  async updateProfile(
    updates: ProfileUpdates
  ) {
    const userMetadata: Record<string, string> = {};

    if (updates.name !== undefined) {
      userMetadata.name = updates.name;
    }

    if (updates.role !== undefined) {
      userMetadata.role = updates.role;
    }

    const updateData: {
      data?: Record<string, string>;
      password?: string;
    } = {};

    if (Object.keys(userMetadata).length > 0) {
      updateData.data = userMetadata;
    }

    if (updates.password) {
      updateData.password = updates.password;
    }

    const { data, error } =
      await supabase.auth.updateUser(updateData);

    if (error) {
      throw new Error(error.message);
    }

    return data.user;
  },
};

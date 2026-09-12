import { supabase } from '../lib/supabase';

export const authService = {
  async register(
    name: string,
    email: string,
    password: string
  ) {
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

    return {
      user: data.user,
      session: data.session,
    };
  },

  async login(email: string, password: string) {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) throw new Error(error.message);

    return {
      user: data.user,
      session: data.session,
    };
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
  }) {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });

    if (error) throw new Error(error.message);

    return data.user;
  },
};

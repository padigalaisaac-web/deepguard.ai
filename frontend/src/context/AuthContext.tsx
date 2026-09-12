import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import { supabase } from '../lib/supabase';
import { authService } from '../services/authService';

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
};

type ProfileUpdates = {
  name?: string;
  role?: string;
  password?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  loading: boolean;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;
  login: (
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (
    updates: ProfileUpdates
  ) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

function formatUser(supabaseUser: any): User | null {
  if (!supabaseUser) return null;

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name:
      supabaseUser.user_metadata?.name ||
      supabaseUser.email?.split('@')[0] ||
      'User',
    role: supabaseUser.user_metadata?.role || 'user',
    created_at: supabaseUser.created_at || '',
  };
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(formatUser(currentUser));
  };

  useEffect(() => {
    refreshUser().finally(() => {
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(formatUser(session?.user));
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function register(
    name: string,
    email: string,
    password: string
  ) {
    const result = await authService.register(
      name,
      email,
      password
    );

    setUser(formatUser(result.user));
  }

  async function login(email: string, password: string) {
    const result = await authService.login(email, password);

    setUser(formatUser(result.user));
  }

  async function logout() {
    await authService.logout();
    setUser(null);
  }

  async function updateProfile(updates: ProfileUpdates) {
    const updatedUser =
      await authService.updateProfile(updates);

    setUser(formatUser(updatedUser));
  }

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isLoading,
        loading: isLoading,
        register,
        login,
        logout,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    );
  }

  return context;
}

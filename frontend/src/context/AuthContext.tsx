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
  email?: string;
  user_metadata?: {
    name?: string;
  };
};

type AuthContextType = {
  user: User | null;
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
};

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getCurrentUser().then((currentUser) => {
      setUser(currentUser as User | null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser((session?.user as User) || null);
        setLoading(false);
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

    setUser(result.user as User | null);
  }

  async function login(email: string, password: string) {
    const result = await authService.login(email, password);

    setUser(result.user as User | null);
  }

  async function logout() {
    await authService.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
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

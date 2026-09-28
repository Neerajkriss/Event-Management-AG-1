import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, Role } from '@/types';
import { seedUsers } from '@/data/seed';
import { authService } from '@/services/authService';

export interface AuthContextValue {
  user: User | null;
  isAuthed: boolean;
  login: (user: User) => void;
  loginWithCredentials: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, role: Role) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (role: Role) => void;
  users: User[];
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<User[]>(seedUsers);

  // Initialize session & users list
  useEffect(() => {
    const cachedUser = authService.getStoredUser();
    if (cachedUser) {
      setUser(cachedUser);
    }

    const initUsers = async () => {
      try {
        const users = await authService.seedUsersIfEmpty(seedUsers);
        setUsersList(users);
      } catch (err) {
        console.error('Error initializing users:', err);
      }
    };

    initUsers();
  }, []);

  const persistUser = useCallback((u: User) => {
    setUser(u);
    authService.setStoredUser(u);
  }, []);

  const login = useCallback((u: User) => persistUser(u), [persistUser]);

  const loginWithCredentials = useCallback(
    async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
      void password;
      const normalized = email.trim().toLowerCase();

      // 1. Try Supabase lookup
      const remoteUser = await authService.lookupUserByEmail(normalized);
      if (remoteUser) {
        persistUser(remoteUser);
        return { success: true };
      }

      // 2. Fallback check local mock list
      const match = usersList.find((u) => u.email.toLowerCase() === normalized);
      if (!match) {
        return { success: false, error: 'No account found with that email address.' };
      }
      persistUser(match);
      return { success: true };
    },
    [persistUser, usersList]
  );

  const register = useCallback(
    async (name: string, email: string, password: string, role: Role): Promise<{ success: boolean; error?: string }> => {
      void password;
      const res = await authService.registerUser(name, email, role);
      if (!res.success || !res.user) {
        return { success: false, error: res.error || 'Failed to register account.' };
      }

      setUsersList((prev) => [...prev, res.user!]);
      persistUser(res.user);
      return { success: true };
    },
    [persistUser]
  );

  const logout = useCallback(() => {
    setUser(null);
    authService.setStoredUser(null);
  }, []);

  const switchRole = useCallback(
    (role: Role) => {
      const target = usersList.find((u) => u.role === role) ?? null;
      if (target) persistUser(target);
    },
    [persistUser, usersList]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthed: user !== null,
        login,
        loginWithCredentials,
        register,
        logout,
        switchRole,
        users: usersList,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
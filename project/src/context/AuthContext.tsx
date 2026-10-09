import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, Role } from '@/types';
import { seedUsers } from '@/data/seed';
import { authService } from '@/services/authService';

export interface AuthContextValue {
  user: User | null;
  currentUser: User | null;
  isAuthed: boolean;
  login: (emailOrUser: string | User, password?: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  loginWithCredentials: (email: string, password?: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (name: string, email: string, password: string, role: Role) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  switchRole: (role: Role) => void;
  users: User[];
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<User[]>(seedUsers);

  // Initialize session & users list on startup
  useEffect(() => {
    try {
      const cachedUser = authService.getStoredUser();
      if (cachedUser) {
        setUser(cachedUser);
      }
    } catch (err) {
      console.warn('[AuthContext] Error reading cached user session:', err);
    }

    const initUsers = async () => {
      try {
        const users = await authService.fetchUsers();
        if (users && users.length > 0) {
          setUsersList(users);
        }
      } catch (err) {
        console.error('[AuthContext] Error initializing users list:', err);
      }
    };

    initUsers();
  }, []);

  const persistUser = useCallback((u: User) => {
    setUser(u);
    authService.setStoredUser(u);
  }, []);

  const login = useCallback(
    async (emailOrUser: string | User, password?: string): Promise<{ success: boolean; user?: User; error?: string }> => {
      try {
        // Direct User object login (e.g. demo role switcher or direct session)
        if (typeof emailOrUser === 'object' && emailOrUser !== null) {
          persistUser(emailOrUser);
          return { success: true, user: emailOrUser };
        }

        // Standard credential login (email + password)
        const email = emailOrUser;
        const res = await authService.loginUser(email, password);
        if (res.success && res.user) {
          persistUser(res.user);
          setUsersList((prev) => {
            const exists = prev.some((u) => u.email.toLowerCase() === res.user!.email.toLowerCase());
            return exists ? prev : [...prev, res.user!];
          });
          return { success: true, user: res.user };
        }

        return { success: false, error: res.error || 'Invalid email address or password.' };
      } catch (err) {
        console.error('[AuthContext] Unexpected error during login:', err);
        return { success: false, error: 'An unexpected authentication error occurred.' };
      }
    },
    [persistUser]
  );

  const loginWithCredentials = useCallback(
    async (email: string, password?: string): Promise<{ success: boolean; user?: User; error?: string }> => {
      return login(email, password);
    },
    [login]
  );

  const register = useCallback(
    async (name: string, email: string, password: string, role: Role): Promise<{ success: boolean; user?: User; error?: string }> => {
      try {
        const res = await authService.registerUser(name, email, password, role);
        if (!res.success || !res.user) {
          return { success: false, error: res.error || 'Failed to create account.' };
        }

        setUsersList((prev) => {
          const filtered = prev.filter((u) => u.email.toLowerCase() !== res.user!.email.toLowerCase());
          return [...filtered, res.user!];
        });
        persistUser(res.user);
        return { success: true, user: res.user };
      } catch (err) {
        console.error('[AuthContext] Unexpected error during registration:', err);
        return { success: false, error: 'An unexpected registration error occurred.' };
      }
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
        currentUser: user,
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
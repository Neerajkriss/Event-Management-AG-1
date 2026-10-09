import { supabase } from './supabaseClient';
import type { User, Role } from '@/types';
import { seedUsers } from '@/data/seed';

const STORAGE_KEY = 'eventhub:auth-user';
const USERS_STORAGE_KEY = 'eventhub:registered-users';

export const authService = {
  getStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch (err) {
      console.warn('[authService] Failed to read stored user session from localStorage:', err);
      return null;
    }
  },

  setStoredUser(user: User | null): void {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      console.warn('[authService] Failed to write stored user session to localStorage:', err);
    }
  },

  getLocalUsers(): User[] {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User[]) : [];
    } catch (err) {
      console.warn('[authService] Failed to read registered users from localStorage:', err);
      return [];
    }
  },

  saveLocalUser(user: User): void {
    try {
      const existing = this.getLocalUsers();
      const updated = [...existing.filter((u) => u.email.toLowerCase() !== user.email.toLowerCase()), user];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('[authService] Failed to save registered user to localStorage:', err);
    }
  },

  async fetchUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        console.error('[authService] Error fetching users from Supabase:', error);
      }
      const remote = (data as User[]) || [];
      const local = this.getLocalUsers();
      const allMap = new Map<string, User>();

      // Merge order: seedUsers -> localStorage -> Supabase (latest remote wins)
      for (const u of seedUsers) allMap.set(u.email.toLowerCase(), u);
      for (const u of local) allMap.set(u.email.toLowerCase(), u);
      for (const u of remote) allMap.set(u.email.toLowerCase(), u);

      return Array.from(allMap.values());
    } catch (err) {
      console.error('[authService] Unexpected exception fetching users:', err);
      const local = this.getLocalUsers();
      const allMap = new Map<string, User>();
      for (const u of seedUsers) allMap.set(u.email.toLowerCase(), u);
      for (const u of local) allMap.set(u.email.toLowerCase(), u);
      return Array.from(allMap.values());
    }
  },

  async lookupUserByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    if (!normalized) return null;

    // 1. Check Supabase
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('email', normalized)
        .maybeSingle();

      if (error) {
        console.warn('[authService] Supabase lookup error for email', normalized, error);
      } else if (data) {
        return data as User;
      }
    } catch (err) {
      console.warn('[authService] Supabase connection error for email lookup:', err);
    }

    // 2. Check localStorage registered users
    const localUsers = this.getLocalUsers();
    const localMatch = localUsers.find((u) => u.email.trim().toLowerCase() === normalized);
    if (localMatch) {
      return localMatch;
    }

    // 3. Check mock/seed users
    const seedMatch = seedUsers.find((u) => u.email.trim().toLowerCase() === normalized);
    if (seedMatch) {
      return seedMatch;
    }

    return null;
  },

  async loginUser(
    email: string,
    password?: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      console.warn('[authService] Login rejected: email address is empty.');
      return { success: false, error: 'Please enter your email address.' };
    }

    console.info(`[authService] Attempting login for: "${normalized}"`);

    // 1. Try Supabase query with case-insensitive email match
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('email', normalized)
        .maybeSingle();

      if (error) {
        console.error('[authService] Supabase error during login query:', error);
      } else if (data) {
        const remoteUser = data as User;
        // Verify password if one is registered on the account
        if (password && remoteUser.password && remoteUser.password !== password) {
          console.warn('[authService] Password mismatch for Supabase user:', normalized);
          return { success: false, error: 'Incorrect password. Please try again.' };
        }

        console.info('[authService] User authenticated successfully via Supabase:', normalized);
        this.setStoredUser(remoteUser);
        this.saveLocalUser(remoteUser);
        return { success: true, user: remoteUser };
      }
    } catch (err) {
      console.error('[authService] Exception during Supabase login lookup:', err);
    }

    // 2. Fallback: check localStorage registered accounts
    const localUsers = this.getLocalUsers();
    const localMatch = localUsers.find((u) => u.email.trim().toLowerCase() === normalized);
    if (localMatch) {
      if (password && localMatch.password && localMatch.password !== password) {
        console.warn('[authService] Password mismatch for local user account:', normalized);
        return { success: false, error: 'Incorrect password. Please try again.' };
      }

      console.info('[authService] User authenticated via localStorage registered accounts:', normalized);
      this.setStoredUser(localMatch);
      return { success: true, user: localMatch };
    }

    // 3. Fallback: check seed/demo accounts
    const seedMatch = seedUsers.find((u) => u.email.trim().toLowerCase() === normalized);
    if (seedMatch) {
      console.info('[authService] User authenticated via demo seed account:', normalized);
      this.setStoredUser(seedMatch);
      return { success: true, user: seedMatch };
    }

    // 4. User not found anywhere
    console.error('[authService] Login failed: User not found in Supabase, localStorage, or seed data:', normalized);
    return { success: false, error: 'No account found with this email address. Please check your spelling or sign up.' };
  },

  async registerUser(
    name: string,
    email: string,
    password: string,
    role: Role
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    const normalized = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedName) {
      return { success: false, error: 'Please enter your name.' };
    }
    if (!normalized) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    // Check existing across Supabase and local cache
    const existing = await this.lookupUserByEmail(normalized);
    if (existing) {
      console.warn('[authService] Registration failed: Account already exists for', normalized);
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: `u-${role}-${Date.now()}`,
      name: trimmedName,
      email: normalized,
      password: password || undefined,
      role,
      avatar: trimmedName.slice(0, 2).toUpperCase() || 'U',
      createdAt: new Date().toISOString(),
    };

    console.info('[authService] Registering new user:', newUser);

    // 1. Attempt insert into Supabase
    try {
      const { error: insertError } = await supabase.from('users').insert(newUser);
      if (insertError) {
        console.error('[authService] Supabase user insertion returned error:', insertError);
        // If Supabase failed (e.g., column constraint, RLS, or network error),
        // we log it and continue so the user account is still saved in localStorage.
      } else {
        console.info('[authService] Successfully saved new user into Supabase `users` table:', newUser.email);
      }
    } catch (err) {
      console.error('[authService] Exception while inserting user into Supabase:', err);
    }

    // 2. Persist to localStorage (both registered users list and active session)
    this.saveLocalUser(newUser);
    this.setStoredUser(newUser);

    return { success: true, user: newUser };
  },

  async seedUsersIfEmpty(defaultUsers: User[]): Promise<User[]> {
    const existing = await this.fetchUsers();
    if (existing.length > 0) {
      return existing;
    }
    try {
      await supabase.from('users').insert(defaultUsers);
    } catch (err) {
      console.warn('[authService] Error seeding users into Supabase:', err);
    }
    return defaultUsers;
  },
};


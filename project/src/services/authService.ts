import { supabase } from './supabaseClient';
import type { User, Role } from '@/types';

const STORAGE_KEY = 'eventhub:auth-user';

export const authService = {
  getStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
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
    } catch {
      // ignore storage errors
    }
  },

  async fetchUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      console.error('Error fetching users from Supabase:', error);
      return [];
    }
    return (data as User[]) || [];
  },

  async lookupUserByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalized)
      .maybeSingle();

    if (error || !data) return null;
    return data as User;
  },

  async registerUser(name: string, email: string, role: Role): Promise<{ success: boolean; user?: User; error?: string }> {
    const normalized = email.trim().toLowerCase();

    // Check existing
    const existing = await this.lookupUserByEmail(normalized);
    if (existing) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: `u-${role}-${Date.now()}`,
      name: name.trim(),
      email: normalized,
      role,
      avatar: name.trim().slice(0, 2).toUpperCase(),
    };

    const { error: insertError } = await supabase.from('users').insert(newUser);
    if (insertError) {
      console.error('Error inserting user to Supabase:', insertError);
      return { success: false, error: insertError.message };
    }

    return { success: true, user: newUser };
  },

  async seedUsersIfEmpty(defaultUsers: User[]): Promise<User[]> {
    const existing = await this.fetchUsers();
    if (existing.length > 0) {
      return existing;
    }
    await supabase.from('users').insert(defaultUsers);
    return defaultUsers;
  },
};

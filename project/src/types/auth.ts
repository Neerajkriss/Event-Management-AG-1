export type Role = 'admin' | 'organizer' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
}

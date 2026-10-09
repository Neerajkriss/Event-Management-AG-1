export type Role = 'admin' | 'organizer' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  password?: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

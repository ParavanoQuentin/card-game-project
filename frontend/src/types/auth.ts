export interface User {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  createdAt: Date;
  lastLoginAt?: Date;
  passwordCreatedAt: Date;
  needsPasswordChange: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

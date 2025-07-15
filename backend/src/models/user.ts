export interface User {
  id: string;
  email: string;
  password: string; // This will be hashed
  username: string;
  role: 'user' | 'admin';
  createdAt: Date;
  lastLoginAt?: Date;
  passwordCreatedAt: Date;
  failedLoginAttempts: number;
  lockedUntil?: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  createdAt: Date;
  lastLoginAt?: Date;
  passwordCreatedAt: Date;
  needsPasswordChange: boolean;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
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
  user?: UserProfile;
  token?: string;
}

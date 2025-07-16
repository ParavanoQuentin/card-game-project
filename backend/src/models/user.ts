export interface User {
  id: string;
  email: string;
  passwordHash: string; // This will be hashed
  username: string;
  role?: 'user' | 'admin'; // Optional since it's not in DB schema yet
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  passwordCreatedAt?: Date;
  failedLoginAttempts?: number;
  lockedUntil?: Date;
  // Email verification fields
  emailVerified?: boolean;
  emailVerificationToken?: string;
  emailVerificationTokenExpiry?: Date;
  // Password reset fields
  passwordResetToken?: string;
  passwordResetTokenExpiry?: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role?: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  passwordCreatedAt?: Date;
  needsPasswordChange?: boolean;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  username: string;
  role?: 'user' | 'admin';
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

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

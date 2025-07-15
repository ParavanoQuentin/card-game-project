import jwt from 'jsonwebtoken';
import { userService } from './userService';
import {
  User,
  UserProfile,
  AuthTokenPayload,
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  AuthResponse,
} from '../models/user';

const JWT_SECRET = process.env.JWT_SECRET || 'aether-beasts-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

class AuthService {
  generateToken(user: User): string {
    const payload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  }

  verifyToken(token: string): AuthTokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  async register(registerData: RegisterRequest): Promise<AuthResponse> {
    try {
      // Validate input
      if (!registerData.email || !registerData.password || !registerData.username) {
        return {
          success: false,
          message: 'Email, password, and username are required',
        };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(registerData.email)) {
        return {
          success: false,
          message: 'Invalid email format',
        };
      }

      // Validate new password strength
      const passwordValidation = userService.validatePasswordStrength(registerData.password);
      if (!passwordValidation.valid) {
        return {
          success: false,
          message: passwordValidation.message || 'Password does not meet security requirements',
        };
      }

      // Validate username
      if (registerData.username.length < 3) {
        return {
          success: false,
          message: 'Username must be at least 3 characters long',
        };
      }

      // Create user
      const user = await userService.createUser(registerData.email, registerData.password, registerData.username);

      // Generate token
      const token = this.generateToken(user);

      // Update last login
      await userService.updateLastLogin(user.id);

      console.log(`✅ User registered successfully: ${user.email} (${user.username})`);

      return {
        success: true,
        message: 'Registration successful',
        user: userService.userToProfile(user),
        token,
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.message || 'Registration failed',
      };
    }
  }

  async login(loginData: LoginRequest): Promise<AuthResponse> {
    try {
      // Validate input
      if (!loginData.email || !loginData.password) {
        return {
          success: false,
          message: 'Email and password are required',
        };
      }

      // Find user
      const user = await userService.findUserByEmail(loginData.email);
      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password',
        };
      }

      // Check if account is locked
      if (userService.isAccountLocked(user)) {
        const lockedUntil = user.lockedUntil!;
        const minutesLeft = Math.ceil((lockedUntil.getTime() - Date.now()) / (1000 * 60));
        return {
          success: false,
          message: `Account is temporarily locked due to too many failed login attempts. Try again in ${minutesLeft} minutes.`,
        };
      }

      // Verify password
      const isValidPassword = await userService.verifyPassword(user, loginData.password);
      if (!isValidPassword) {
        // Increment failed login attempts
        await userService.incrementFailedLoginAttempts(user.id);

        const attemptsLeft = 5 - ((user.failedLoginAttempts || 0) + 1);
        if (attemptsLeft > 0) {
          return {
            success: false,
            message: `Invalid email or password. ${attemptsLeft} attempts remaining before account lockout.`,
          };
        } else {
          return {
            success: false,
            message: 'Invalid email or password. Account has been temporarily locked due to too many failed attempts.',
          };
        }
      }

      // Reset failed login attempts on successful login
      await userService.resetFailedLoginAttempts(user.id);

      // Check if password needs to be changed
      const userProfile = userService.userToProfile(user);
      if (userProfile.needsPasswordChange) {
        return {
          success: false,
          message: 'Your password has expired. Please change your password to continue.',
          user: userProfile,
        };
      }

      // Generate token
      const token = this.generateToken(user);

      // Update last login
      await userService.updateLastLogin(user.id);

      console.log(`✅ User logged in successfully: ${user.email} (${user.username})`);

      return {
        success: true,
        message: 'Login successful',
        user: userProfile,
        token,
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed',
      };
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const user = await userService.findUserById(userId);
    return user ? userService.userToProfile(user) : null;
  }

  async validateTokenAndGetUser(token: string): Promise<UserProfile | null> {
    const payload = this.verifyToken(token);
    if (!payload) return null;

    return this.getUserProfile(payload.userId);
  }

  async changePassword(userId: string, changePasswordData: ChangePasswordRequest): Promise<AuthResponse> {
    try {
      // Find user
      const user = await userService.findUserById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      // Verify current password
      const isValidCurrentPassword = await userService.verifyPassword(user, changePasswordData.currentPassword);
      if (!isValidCurrentPassword) {
        return {
          success: false,
          message: 'Current password is incorrect',
        };
      }

      // Validate new password strength
      const passwordValidation = userService.validatePasswordStrength(changePasswordData.newPassword);
      if (!passwordValidation.valid) {
        return {
          success: false,
          message: passwordValidation.message || 'New password does not meet security requirements',
        };
      }

      // Check if new password is different from current password
      const isSamePassword = await userService.verifyPassword(user, changePasswordData.newPassword);
      if (isSamePassword) {
        return {
          success: false,
          message: 'New password must be different from current password',
        };
      }

      // Change password
      await userService.changePassword(userId, changePasswordData.newPassword);

      console.log(`✅ Password changed successfully for user: ${user.email}`);

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error: any) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: 'Failed to change password',
      };
    }
  }
}

export const authService = new AuthService();

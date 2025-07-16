import jwt from 'jsonwebtoken';
import { userService } from './userService';
import { emailService } from './emailService';
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

      console.log('DEBUG', process.env.BREVO_API_KEY);
      
      // Create user
      const user = await userService.createUser(registerData.email, registerData.password, registerData.username);

      // Send verification email
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verificationUrl = `${frontendUrl}/verify-email?token=${user.emailVerificationToken}`;
      
      const emailSent = await emailService.sendVerificationEmail({
        email: user.email,
        username: user.username,
        verificationToken: user.emailVerificationToken!,
        verificationUrl
      });

      if (!emailSent) {
        console.warn('⚠️ Failed to send verification email, but user was created');
      }

      console.log(`✅ User registered successfully: ${user.email} (${user.username})`);

      return {
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        user: userService.userToProfile(user),
        // Note: We don't provide a token here since email is not verified yet
        // Users can still login but should be reminded to verify their email
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

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      const user = await userService.verifyEmail(token);
      
      if (!user) {
        return {
          success: false,
          message: 'Invalid or expired verification token',
        };
      }

      // Send welcome email
      await emailService.sendWelcomeEmail(user.email, user.username);

      // Generate token for automatic login after verification
      const authToken = this.generateToken(user);

      console.log(`✅ Email verified successfully for user: ${user.email}`);

      return {
        success: true,
        message: 'Email verified successfully! Welcome to Aether Beasts!',
        user: userService.userToProfile(user),
        token: authToken,
      };
    } catch (error: any) {
      console.error('Email verification error:', error);
      return {
        success: false,
        message: 'Email verification failed',
      };
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<AuthResponse> {
    try {
      const result = await userService.generateNewVerificationToken(email);
      
      if (!result) {
        return {
          success: false,
          message: 'User not found or email already verified',
        };
      }

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verificationUrl = `${frontendUrl}/verify-email?token=${result.token}`;
      
      const emailSent = await emailService.sendVerificationEmail({
        email: result.user.email,
        username: result.user.username,
        verificationToken: result.token,
        verificationUrl
      });

      if (!emailSent) {
        return {
          success: false,
          message: 'Failed to send verification email',
        };
      }

      console.log(`✅ Verification email resent to: ${email}`);

      return {
        success: true,
        message: 'Verification email sent! Please check your inbox.',
      };
    } catch (error: any) {
      console.error('Resend verification email error:', error);
      return {
        success: false,
        message: 'Failed to resend verification email',
      };
    }
  }

  async requestPasswordReset(email: string): Promise<AuthResponse> {
    try {
      const result = await userService.setPasswordResetToken(email);
      
      if (!result) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Get username for email template
      const username = result.user.username;

      // Send password reset email
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetUrl = `${frontendUrl}/reset-password?token=${result.token}`;
      
      const emailSent = await emailService.sendPasswordResetEmail({
        email: email,
        username: username,
        resetToken: result.token,
        resetUrl
      });

      if (!emailSent) {
        return {
          success: false,
          message: 'Failed to send password reset email',
        };
      }

      console.log(`✅ Password reset email sent to: ${email}`);

      return {
        success: true,
        message: 'Password reset email sent! Please check your inbox.',
      };
    } catch (error: any) {
      console.error('Password reset request error:', error);
      return {
        success: false,
        message: 'Failed to process password reset request',
      };
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      // Validate new password strength
      const passwordValidation = userService.validatePasswordStrength(newPassword);
      if (!passwordValidation.valid) {
        return {
          success: false,
          message: passwordValidation.message || 'Password does not meet security requirements',
        };
      }

      const result = await userService.resetPassword(token, newPassword);
      
      if (!result.success) {
        return result;
      }

      console.log(`✅ Password reset successful for user: ${result.user?.email}`);

      return {
        success: true,
        message: 'Password reset successful! You can now login with your new password.',
        user: result.user,
      };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return {
        success: false,
        message: 'Failed to reset password',
      };
    }
  }
}

export const authService = new AuthService();

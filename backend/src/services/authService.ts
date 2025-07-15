import jwt from 'jsonwebtoken';
import { userStore } from './userStore';
import { initializeEmailService } from './emailService';
import { 
  User, 
  UserProfile, 
  AuthTokenPayload, 
  LoginRequest, 
  RegisterRequest, 
  ChangePasswordRequest,
  AuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  EmailVerificationRequest,
  ResendVerificationRequest
} from '../models/user';

const JWT_SECRET = process.env.JWT_SECRET || 'aether-beasts-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

class AuthService {
  generateToken(user: User): string {
    const payload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role
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
          message: 'Email, password, and username are required'
        };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(registerData.email)) {
        return {
          success: false,
          message: 'Invalid email format'
        };
      }

      // Validate password strength
      const passwordValidation = userStore.validatePasswordStrength(registerData.password);
      if (!passwordValidation.valid) {
        return {
          success: false,
          message: passwordValidation.message || 'Password does not meet security requirements'
        };
      }

      // Validate username
      if (registerData.username.length < 3) {
        return {
          success: false,
          message: 'Username must be at least 3 characters long'
        };
      }

      // Create user
      const user = await userStore.createUser(
        registerData.email,
        registerData.password,
        registerData.username
      );

      // Send verification email (if not admin)
      if (user.role !== 'admin' && user.emailVerificationToken) {
        try {
          const emailService = initializeEmailService();
          await emailService.sendVerificationEmail(
            user.email,
            user.username,
            user.emailVerificationToken
          );
          console.log(`📧 Verification email sent to: ${user.email}`);
        } catch (error) {
          console.error('Failed to send verification email:', error);
          // Don't fail registration if email fails
        }
      }

      console.log(`✅ User registered successfully: ${user.email} (${user.username})`);

      return {
        success: true,
        message: user.role === 'admin' 
          ? 'Registration successful' 
          : 'Registration successful! Please check your email to verify your account.',
        user: userStore.userToProfile(user),
        token: user.isEmailVerified ? this.generateToken(user) : undefined
      };

    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.message || 'Registration failed'
      };
    }
  }

  async login(loginData: LoginRequest): Promise<AuthResponse> {
    try {
      // Validate input
      if (!loginData.email || !loginData.password) {
        return {
          success: false,
          message: 'Email and password are required'
        };
      }

      // Find user
      const user = await userStore.findUserByEmail(loginData.email);
      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Check if account is locked
      if (userStore.isAccountLocked(user)) {
        const lockedUntil = user.lockedUntil!;
        const minutesLeft = Math.ceil((lockedUntil.getTime() - Date.now()) / (1000 * 60));
        return {
          success: false,
          message: `Account is temporarily locked due to too many failed login attempts. Try again in ${minutesLeft} minutes.`
        };
      }

      // Verify password
      const isValidPassword = await userStore.verifyPassword(user, loginData.password);
      if (!isValidPassword) {
        // Increment failed login attempts
        await userStore.incrementFailedLoginAttempts(user.id);
        
        const attemptsLeft = 5 - (user.failedLoginAttempts + 1);
        if (attemptsLeft > 0) {
          return {
            success: false,
            message: `Invalid email or password. ${attemptsLeft} attempts remaining before account lockout.`
          };
        } else {
          return {
            success: false,
            message: 'Invalid email or password. Account has been temporarily locked due to too many failed attempts.'
          };
        }
      }

      // Reset failed login attempts on successful login
      await userStore.resetFailedLoginAttempts(user.id);

      // Check if email is verified
      if (!user.isEmailVerified) {
        return {
          success: false,
          message: 'Please verify your email address before logging in. Check your email for the verification link.'
        };
      }

      // Check if password needs to be changed
      const userProfile = userStore.userToProfile(user);
      if (userProfile.needsPasswordChange) {
        return {
          success: false,
          message: 'Your password has expired. Please change your password to continue.',
          user: userProfile
        };
      }

      // Generate token
      const token = this.generateToken(user);

      // Update last login
      await userStore.updateLastLogin(user.id);

      console.log(`✅ User logged in successfully: ${user.email} (${user.username})`);

      return {
        success: true,
        message: 'Login successful',
        user: userProfile,
        token
      };

    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed'
      };
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const user = await userStore.findUserById(userId);
    return user ? userStore.userToProfile(user) : null;
  }

  async validateTokenAndGetUser(token: string): Promise<UserProfile | null> {
    const payload = this.verifyToken(token);
    if (!payload) return null;

    return this.getUserProfile(payload.userId);
  }

  async changePassword(userId: string, changePasswordData: ChangePasswordRequest): Promise<AuthResponse> {
    try {
      // Find user
      const user = await userStore.findUserById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Verify current password
      const isValidCurrentPassword = await userStore.verifyPassword(user, changePasswordData.currentPassword);
      if (!isValidCurrentPassword) {
        return {
          success: false,
          message: 'Current password is incorrect'
        };
      }

      // Validate new password strength
      const passwordValidation = userStore.validatePasswordStrength(changePasswordData.newPassword);
      if (!passwordValidation.valid) {
        return {
          success: false,
          message: passwordValidation.message || 'New password does not meet security requirements'
        };
      }

      // Check if new password is different from current password
      const isSamePassword = await userStore.verifyPassword(user, changePasswordData.newPassword);
      if (isSamePassword) {
        return {
          success: false,
          message: 'New password must be different from current password'
        };
      }

      // Change password
      await userStore.changePassword(userId, changePasswordData.newPassword);

      console.log(`✅ Password changed successfully for user: ${user.email}`);

      return {
        success: true,
        message: 'Password changed successfully'
      };

    } catch (error: any) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: 'Failed to change password'
      };
    }
  }

  // Email verification methods
  async verifyEmail(verificationData: EmailVerificationRequest): Promise<AuthResponse> {
    try {
      const result = await userStore.verifyEmail(verificationData.token);
      
      if (result.success && result.user) {
        // Generate token now that email is verified
        const token = this.generateToken(result.user);
        
        // Update last login
        await userStore.updateLastLogin(result.user.id);
        
        console.log(`✅ Email verified successfully: ${result.user.email}`);
        
        return {
          success: true,
          message: 'Email verified successfully! You can now log in.',
          user: userStore.userToProfile(result.user),
          token
        };
      } else {
        return {
          success: false,
          message: result.message
        };
      }
    } catch (error: any) {
      console.error('Email verification error:', error);
      return {
        success: false,
        message: 'Email verification failed'
      };
    }
  }

  async resendVerificationEmail(resendData: ResendVerificationRequest): Promise<AuthResponse> {
    try {
      const user = await userStore.findUserByEmail(resendData.email);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      if (user.isEmailVerified) {
        return {
          success: false,
          message: 'Email is already verified'
        };
      }

      // Generate new verification token
      const token = await userStore.generateEmailVerificationToken(user.id);
      
      if (!token) {
        return {
          success: false,
          message: 'Failed to generate verification token'
        };
      }

      // Send verification email
      const emailService = initializeEmailService();
      const emailSent = await emailService.sendVerificationEmail(
        user.email,
        user.username,
        token
      );

      if (!emailSent) {
        return {
          success: false,
          message: 'Failed to send verification email'
        };
      }

      console.log(`📧 Verification email resent to: ${user.email}`);

      return {
        success: true,
        message: 'Verification email sent! Please check your email.'
      };

    } catch (error: any) {
      console.error('Resend verification error:', error);
      return {
        success: false,
        message: 'Failed to resend verification email'
      };
    }
  }

  // Password reset methods
  async forgotPassword(forgotData: ForgotPasswordRequest): Promise<AuthResponse> {
    try {
      const user = await userStore.findUserByEmail(forgotData.email);
      
      if (!user) {
        // Don't reveal if email exists for security
        return {
          success: true,
          message: 'If an account with this email exists, you will receive a password reset link.'
        };
      }

      // Generate reset token
      const token = await userStore.generatePasswordResetToken(user.id);
      
      if (!token) {
        return {
          success: false,
          message: 'Failed to generate reset token'
        };
      }

      // Send reset email
      const emailService = initializeEmailService();
      const emailSent = await emailService.sendPasswordResetEmail(
        user.email,
        user.username,
        token
      );

      if (!emailSent) {
        console.error('Failed to send password reset email');
        // Don't reveal email send failure for security
      }

      console.log(`📧 Password reset email sent to: ${user.email}`);

      return {
        success: true,
        message: 'If an account with this email exists, you will receive a password reset link.'
      };

    } catch (error: any) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: 'Failed to process password reset request'
      };
    }
  }

  async resetPassword(resetData: ResetPasswordRequest): Promise<AuthResponse> {
    try {
      const result = await userStore.resetPassword(resetData.token, resetData.newPassword);
      
      if (result.success && result.user) {
        console.log(`✅ Password reset successfully: ${result.user.email}`);
        
        return {
          success: true,
          message: 'Password reset successfully! You can now log in with your new password.',
          user: userStore.userToProfile(result.user)
        };
      } else {
        return {
          success: false,
          message: result.message
        };
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: 'Password reset failed'
      };
    }
  }
}

export const authService = new AuthService();

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from './databaseService';
import { User, UserProfile } from '../models/user';

export interface PasswordValidationResult {
  valid: boolean;
  message?: string;
}

class UserService {
  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): PasswordValidationResult {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (password.length < minLength) {
      return {
        valid: false,
        message: `Password must be at least ${minLength} characters long`
      };
    }

    if (!hasUpperCase) {
      return {
        valid: false,
        message: 'Password must contain at least one uppercase letter'
      };
    }

    if (!hasLowerCase) {
      return {
        valid: false,
        message: 'Password must contain at least one lowercase letter'
      };
    }

    if (!hasNumbers) {
      return {
        valid: false,
        message: 'Password must contain at least one number'
      };
    }

    if (!hasSpecialChar) {
      return {
        valid: false,
        message: 'Password must contain at least one special character'
      };
    }

    return { valid: true };
  }

  /**
   * Hash a password
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify a password against a hash
   */
  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  /**
   * Create a new user
   */
  async createUser(email: string, password: string, username: string): Promise<User> {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        throw new Error('User with this email already exists');
      }
      if (existingUser.username === username) {
        throw new Error('Username is already taken');
      }
    }

    const passwordHash = await this.hashPassword(password);

    // Generate email verification token
    const { token, expiry } = this.generateEmailVerificationToken();

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username,
        passwordHash,
        emailVerified: false,
        emailVerificationToken: token,
        emailVerificationTokenExpiry: expiry,
      }
    });

    return this.mapPrismaUserToUser(user);
  }

  /**
   * Find user by ID
   */
  async findUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id }
    });

    return user ? this.mapPrismaUserToUser(user) : null;
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    return user ? this.mapPrismaUserToUser(user) : null;
  }

  /**
   * Find user by username
   */
  async findUserByUsername(username: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { username }
    });

    return user ? this.mapPrismaUserToUser(user) : null;
  }

  /**
   * Update user's last login time
   */
  async updateLastLogin(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { updatedAt: new Date() }
    });
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, newPassword: string): Promise<void> {
    const passwordHash = await this.hashPassword(newPassword);
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Convert a User to UserProfile (remove sensitive data)
   */
  userToProfile(user: User): UserProfile {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role || 'user',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
      passwordCreatedAt: user.passwordCreatedAt,
      needsPasswordChange: false // Can be implemented based on password age if needed
    };
  }

  /**
   * Map Prisma User to our User interface
   */
  private mapPrismaUserToUser(prismaUser: any): User {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      passwordHash: prismaUser.passwordHash,
      username: prismaUser.username,
      role: 'user', // Default role since not in schema yet
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
      lastLoginAt: undefined,
      passwordCreatedAt: prismaUser.createdAt,
      failedLoginAttempts: 0,
      lockedUntil: undefined,
      emailVerified: prismaUser.emailVerified || false,
      emailVerificationToken: prismaUser.emailVerificationToken,
      emailVerificationTokenExpiry: prismaUser.emailVerificationTokenExpiry,
      passwordResetToken: prismaUser.passwordResetToken,
      passwordResetTokenExpiry: prismaUser.passwordResetTokenExpiry
    };
  }

  /**
   * Delete user by ID
   */
  async deleteUser(userId: string): Promise<void> {
    await prisma.user.delete({
      where: { id: userId }
    });
  }

  /**
   * Get all users (admin function)
   */
  async getAllUsers(): Promise<UserProfile[]> {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return users.map(user => this.userToProfile(this.mapPrismaUserToUser(user)));
  }

  /**
   * Account lockout functions (simplified for now since not in schema)
   */
  isAccountLocked(user: User): boolean {
    return false; // Simplified - can be enhanced later
  }

  async incrementFailedLoginAttempts(userId: string): Promise<void> {
    // Simplified - can be enhanced later with additional fields in schema
    console.log(`Failed login attempt for user ${userId}`);
  }

  async resetFailedLoginAttempts(userId: string): Promise<void> {
    // Simplified - can be enhanced later with additional fields in schema
    console.log(`Reset failed login attempts for user ${userId}`);
  }

  /**
   * Update user role (admin function) - simplified since role is not in schema yet
   */
  async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<User | null> {
    // For now, we'll just return the user since role is not in the database schema
    // This can be implemented when we add role to the schema
    const user = await this.findUserById(userId);
    if (user) {
      user.role = role; // Update in memory for now
      console.log(`User ${userId} role updated to ${role} (note: role not persisted to DB yet)`);
    }
    return user;
  }

  /**
   * Generate email verification token
   */
  generateEmailVerificationToken(): { token: string; expiry: Date } {
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    return { token, expiry };
  }

  /**
   * Update user with email verification token
   */
  async setEmailVerificationToken(userId: string, token: string, expiry: Date): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerificationToken: token,
        emailVerificationTokenExpiry: expiry,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationTokenExpiry: {
          gt: new Date() // Token must not be expired
        }
      }
    });

    if (!user) {
      return null;
    }

    // Mark email as verified and clear verification token
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenExpiry: null,
        updatedAt: new Date()
      }
    });

    return this.mapPrismaUserToUser(updatedUser);
  }

  /**
   * Find user by verification token
   */
  async findUserByVerificationToken(token: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationTokenExpiry: {
          gt: new Date()
        }
      }
    });

    return user ? this.mapPrismaUserToUser(user) : null;
  }

  /**
   * Resend verification email (generates new token)
   */
  async generateNewVerificationToken(email: string): Promise<{ user: User; token: string; expiry: Date } | null> {
    const user = await this.findUserByEmail(email);
    if (!user || user.emailVerified) {
      return null;
    }

    const { token, expiry } = this.generateEmailVerificationToken();
    await this.setEmailVerificationToken(user.id, token, expiry);

    return { user, token, expiry };
  }

  /**
   * Generate password reset token
   */
  generatePasswordResetToken(): { token: string; expiry: Date } {
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    return { token, expiry };
  }

  /**
   * Set password reset token for user
   */
  async setPasswordResetToken(email: string): Promise<{ user: User; token: string; expiry: Date } | null> {
    const user = await this.findUserByEmail(email);
    if (!user) {
      return null;
    }

    const { token, expiry } = this.generatePasswordResetToken();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetTokenExpiry: expiry,
        updatedAt: new Date()
      }
    });

    return { user, token, expiry };
  }

  /**
   * Find user by password reset token
   */
  async findUserByPasswordResetToken(token: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetTokenExpiry: {
          gt: new Date() // Token must not be expired
        }
      }
    });

    return user ? this.mapPrismaUserToUser(user) : null;
  }

  /**
   * Reset password with token
   */
  async resetPasswordWithToken(token: string, newPassword: string): Promise<User | null> {
    const user = await this.findUserByPasswordResetToken(token);
    if (!user) {
      return null;
    }

    const passwordHash = await this.hashPassword(newPassword);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetTokenExpiry: null,
        updatedAt: new Date()
      }
    });

    return this.mapPrismaUserToUser(updatedUser);
  }

  /**
   * Reset a user's password using a valid token (for API)
   */
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string; user?: UserProfile }> {
    const user = await this.findUserByPasswordResetToken(token);
    
    if (!user) {
      return {
        success: false,
        message: 'Invalid or expired password reset token'
      };
    }

    // Hash the new password
    const passwordHash = await this.hashPassword(newPassword);

    // Update user's password and clear reset token
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetTokenExpiry: null,
        updatedAt: new Date()
      }
    });

    return {
      success: true,
      message: 'Password reset successfully',
      user: this.userToProfile(this.mapPrismaUserToUser(updatedUser))
    };
  }
}

export const userService = new UserService();

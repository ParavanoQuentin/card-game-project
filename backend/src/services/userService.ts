import bcrypt from 'bcryptjs';
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

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username,
        passwordHash,
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
      lockedUntil: undefined
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
}

export const userService = new UserService();

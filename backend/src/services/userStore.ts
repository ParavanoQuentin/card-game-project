import { User, UserProfile } from '../models/user';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// In-memory user storage (in a real app, this would be a database)
class UserStore {
  private users: Map<string, User> = new Map();
  private emailToId: Map<string, string> = new Map();

  constructor() {
    // Initialize with admin account
    this.initializeAdminAccount();
  }

  private async initializeAdminAccount() {
    try {
      // Check if admin account already exists
      const existingAdmin = await this.findUserByEmail('quentin.paravano@gmail.com');
      if (!existingAdmin) {
        console.log('🔧 Creating default admin account...');
        await this.createUser('quentin.paravano@gmail.com', 'Quentin27/04/01', 'admin', 'admin');
        console.log('✅ Admin account created successfully');
      } else {
        console.log('✅ Admin account already exists');
      }
    } catch (error) {
      console.error('❌ Failed to initialize admin account:', error);
    }
  }

  async createUser(email: string, password: string, username: string, role: 'user' | 'admin' = 'user'): Promise<User> {
    // Check if email already exists
    if (this.emailToId.has(email.toLowerCase())) {
      throw new Error('Email already exists');
    }

    // Check if username already exists
    const existingUserWithUsername = Array.from(this.users.values()).find(
      user => user.username.toLowerCase() === username.toLowerCase()
    );
    if (existingUserWithUsername) {
      throw new Error('Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const now = new Date();
    const user: User = {
      id: uuidv4(),
      email: email.toLowerCase(),
      password: hashedPassword,
      username,
      role,
      createdAt: now,
      passwordCreatedAt: now,
      failedLoginAttempts: 0
    };

    // Store user
    this.users.set(user.id, user);
    this.emailToId.set(email.toLowerCase(), user.id);

    return user;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const userId = this.emailToId.get(email.toLowerCase());
    if (!userId) return null;
    return this.users.get(userId) || null;
  }

  async findUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async updateLastLogin(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.lastLoginAt = new Date();
      this.users.set(userId, user);
    }
  }

  userToProfile(user: User): UserProfile {
    const passwordAge = Date.now() - user.passwordCreatedAt.getTime();
    const needsPasswordChange = passwordAge > (60 * 24 * 60 * 60 * 1000); // 60 days in milliseconds
    
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      passwordCreatedAt: user.passwordCreatedAt,
      needsPasswordChange
    };
  }

  // Security methods for enhanced password policy
  async incrementFailedLoginAttempts(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.failedLoginAttempts += 1;
      
      // Lock account after 5 failed attempts for 15 minutes
      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }
      
      this.users.set(userId, user);
    }
  }

  async resetFailedLoginAttempts(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.failedLoginAttempts = 0;
      user.lockedUntil = undefined;
      this.users.set(userId, user);
    }
  }

  isAccountLocked(user: User): boolean {
    if (!user.lockedUntil) return false;
    return Date.now() < user.lockedUntil.getTime();
  }

  needsPasswordChange(user: User): boolean {
    const passwordAge = Date.now() - user.passwordCreatedAt.getTime();
    return passwordAge > (60 * 24 * 60 * 60 * 1000); // 60 days in milliseconds
  }

  async changePassword(userId: string, newPassword: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    user.password = hashedPassword;
    user.passwordCreatedAt = new Date();
    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    
    this.users.set(userId, user);
  }

  validatePasswordStrength(password: string): { valid: boolean; message?: string } {
    if (password.length < 12) {
      return { valid: false, message: 'Password must be at least 12 characters long' };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!hasLowerCase) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!hasNumbers) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    if (!hasSpecialChar) {
      return { valid: false, message: 'Password must contain at least one special character' };
    }

    return { valid: true };
  }

  // Debug method to see all users
  getAllUsers(): UserProfile[] {
    return Array.from(this.users.values()).map(user => this.userToProfile(user));
  }

  // Admin management methods
  async deleteUser(userId: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) return false;

    // Remove from both maps
    this.users.delete(userId);
    this.emailToId.delete(user.email);
    return true;
  }

  async updateUserRole(userId: string, newRole: 'user' | 'admin'): Promise<User | null> {
    const user = this.users.get(userId);
    if (!user) return null;

    user.role = newRole;
    this.users.set(userId, user);
    return user;
  }

  async isAdmin(userId: string): Promise<boolean> {
    const user = this.users.get(userId);
    return user?.role === 'admin' || false;
  }
}

export const userStore = new UserStore();

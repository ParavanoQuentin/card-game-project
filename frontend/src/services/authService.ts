import axios from 'axios';
import { LoginRequest, RegisterRequest, ChangePasswordRequest, AuthResponse, User } from '../types/auth';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

class AuthService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
    if (this.token) {
      this.setAuthHeader(this.token);
    }
  }

  private setAuthHeader(token: string) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  private removeAuthHeader() {
    delete axios.defaults.headers.common['Authorization'];
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log('🔐 Attempting registration for:', data.email);
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, data);
      
      // Don't set token on registration since email verification is required
      console.log('✅ Registration successful - verification email sent');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('🔐 Attempting login for:', data.email);
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, data);
      
      if (response.data.success && response.data.token) {
        this.token = response.data.token;
        localStorage.setItem('auth_token', this.token!);
        this.setAuthHeader(this.token!);
        console.log('✅ Login successful');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  }

  async getProfile(): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      if (!this.token) {
        return { success: false, message: 'No token available' };
      }

      const response = await axios.get(`${API_BASE_URL}/api/auth/profile`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Profile fetch error:', error);
      if (error.response?.status === 401) {
        this.logout(); // Token is invalid, clear it
      }
      return {
        success: false,
        message: 'Failed to fetch profile'
      };
    }
  }

  getToken(): string | null {
    return this.token;
  }

  async changePassword(data: ChangePasswordRequest): Promise<AuthResponse> {
    try {
      console.log('🔐 Attempting password change');
      const response = await axios.post(`${API_BASE_URL}/api/auth/change-password`, data);
      
      console.log('✅ Password change successful');
      return response.data;
    } catch (error: any) {
      console.error('❌ Password change error:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  }

  async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      console.log('📧 Verifying email with token');
      const response = await axios.post(`${API_BASE_URL}/api/auth/verify-email`, { token });
      
      if (response.data.success && response.data.token) {
        this.token = response.data.token;
        localStorage.setItem('auth_token', this.token!);
        this.setAuthHeader(this.token!);
        console.log('✅ Email verification successful');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Email verification error:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Email verification failed. Please try again.'
      };
    }
  }

  async resendVerificationEmail(email: string): Promise<AuthResponse> {
    try {
      console.log('📧 Resending verification email to:', email);
      const response = await axios.post(`${API_BASE_URL}/api/auth/resend-verification`, { email });
      
      console.log('✅ Verification email resent');
      return response.data;
    } catch (error: any) {
      console.error('❌ Resend verification email error:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Failed to resend verification email. Please try again.'
      };
    }
  }

  async requestPasswordReset(email: string): Promise<AuthResponse> {
    try {
      console.log('🔐 Requesting password reset for:', email);
      const response = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });
      
      console.log('✅ Password reset email sent');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Password reset request error:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Failed to send password reset email. Please try again.'
      };
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      console.log('🔐 Resetting password with token');
      const response = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, { 
        token, 
        newPassword 
      });
      
      console.log('✅ Password reset successful');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Failed to reset password. Please try again.'
      };
    }
  }

  logout() {
    console.log('🚪 Logging out');
    this.token = null;
    localStorage.removeItem('auth_token');
    this.removeAuthHeader();
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const authService = new AuthService();

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
      
      if (response.data.success && response.data.token) {
        this.token = response.data.token;
        localStorage.setItem('auth_token', this.token!);
        this.setAuthHeader(this.token!);
        console.log('✅ Registration successful');
      }
      
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

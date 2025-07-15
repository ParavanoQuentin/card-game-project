import axios from 'axios';
import { User } from '../types/auth';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

export interface AdminUsersResponse {
  success: boolean;
  users?: User[];
  count?: number;
  message?: string;
}

export interface AdminActionResponse {
  success: boolean;
  message: string;
  user?: User;
}

class AdminService {
  async getAllUsers(): Promise<AdminUsersResponse> {
    try {
      console.log('🔧 Admin: Fetching all users...');
      const response = await axios.get(`${API_BASE_URL}/api/admin/users`);
      console.log('✅ Admin: Users fetched successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Admin: Failed to fetch users:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  }

  async deleteUser(userId: string): Promise<AdminActionResponse> {
    try {
      console.log('🗑️ Admin: Deleting user:', userId);
      const response = await axios.delete(`${API_BASE_URL}/api/admin/users/${userId}`);
      console.log('✅ Admin: User deleted successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Admin: Failed to delete user:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  }

  async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<AdminActionResponse> {
    try {
      console.log('Admin: Updating user role:', { userId, role });
      const response = await axios.put(`${API_BASE_URL}/api/admin/users/${userId}/role`, { role });
      console.log('✅ Admin: User role updated successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Admin: Failed to update user role:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  }
}

export const adminService = new AdminService();

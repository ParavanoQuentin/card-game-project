import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, LoginRequest, RegisterRequest } from '../types/auth';
import { authService } from '../services/authService';

interface AuthStore extends AuthState {
  // Actions
  login: (data: LoginRequest) => Promise<{ success: boolean; message: string }>;
  register: (data: RegisterRequest) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  loadUser: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null,

      // Actions
      login: async (data: LoginRequest) => {
        set({ loading: true, error: null });
        
        try {
          const response = await authService.login(data);
          
          if (response.success && response.user && response.token) {
            set({
              isAuthenticated: true,
              user: response.user,
              token: response.token,
              loading: false,
              error: null
            });
            return { success: true, message: response.message };
          } else {
            set({
              loading: false,
              error: response.message
            });
            return { success: false, message: response.message };
          }
        } catch (error) {
          const errorMessage = 'Login failed. Please try again.';
          set({
            loading: false,
            error: errorMessage
          });
          return { success: false, message: errorMessage };
        }
      },

      register: async (data: RegisterRequest) => {
        set({ loading: true, error: null });
        
        try {
          const response = await authService.register(data);
          
          if (response.success && response.user && response.token) {
            set({
              isAuthenticated: true,
              user: response.user,
              token: response.token,
              loading: false,
              error: null
            });
            return { success: true, message: response.message };
          } else {
            set({
              loading: false,
              error: response.message
            });
            return { success: false, message: response.message };
          }
        } catch (error) {
          const errorMessage = 'Registration failed. Please try again.';
          set({
            loading: false,
            error: errorMessage
          });
          return { success: false, message: errorMessage };
        }
      },

      logout: () => {
        authService.logout();
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          loading: false,
          error: null
        });
      },

      loadUser: async () => {
        const token = authService.getToken();
        if (!token) {
          set({ isAuthenticated: false, user: null, token: null });
          return;
        }

        set({ loading: true });
        
        try {
          const response = await authService.getProfile();
          
          if (response.success && response.user) {
            set({
              isAuthenticated: true,
              user: response.user,
              token,
              loading: false,
              error: null
            });
          } else {
            // Token is invalid, clear everything
            authService.logout();
            set({
              isAuthenticated: false,
              user: null,
              token: null,
              loading: false,
              error: null
            });
          }
        } catch (error) {
          authService.logout();
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            loading: false,
            error: null
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token
      })
    }
  )
);

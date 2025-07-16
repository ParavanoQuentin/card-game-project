import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, LoginRequest, RegisterRequest } from '../types/auth';
import { authService } from '../services/authService';

interface AuthStore extends AuthState {
  // Actions
  login: (data: LoginRequest) => Promise<{ success: boolean; message: string }>;
  register: (data: RegisterRequest) => Promise<{ success: boolean; message: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message: string }>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
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
              error: null,
            });
            return { success: true, message: response.message };
          } else {
            set({
              loading: false,
              error: response.message,
            });
            return { success: false, message: response.message };
          }
        } catch (error) {
          const errorMessage = 'Login failed. Please try again.';
          set({
            loading: false,
            error: errorMessage,
          });
          return { success: false, message: errorMessage };
        }
      },

      register: async (data: RegisterRequest) => {
        set({ loading: true, error: null });

        try {
          const response = await authService.register(data);

          if (response.success) {
            // Don't auto-login on registration since email verification is required
            set({
              loading: false,
              error: null,
            });
            return { success: true, message: response.message };
          } else {
            set({
              loading: false,
              error: response.message,
            });
            return { success: false, message: response.message };
          }
        } catch (error) {
          const errorMessage = 'Registration failed. Please try again.';
          set({
            loading: false,
            error: errorMessage,
          });
          return { success: false, message: errorMessage };
        }
      },

      verifyEmail: async (token: string) => {
        set({ loading: true, error: null });

        try {
          const response = await authService.verifyEmail(token);

          if (response.success && response.user && response.token) {
            set({
              isAuthenticated: true,
              user: response.user,
              token: response.token,
              loading: false,
              error: null,
            });
            return { success: true, message: response.message };
          } else {
            set({
              loading: false,
              error: response.message,
            });
            return { success: false, message: response.message };
          }
        } catch (error) {
          const errorMessage = 'Email verification failed. Please try again.';
          set({
            loading: false,
            error: errorMessage,
          });
          return { success: false, message: errorMessage };
        }
      },

      resendVerificationEmail: async (email: string) => {
        set({ loading: true, error: null });

        try {
          const response = await authService.resendVerificationEmail(email);

          set({
            loading: false,
            error: response.success ? null : response.message,
          });

          return { success: response.success, message: response.message };
        } catch (error) {
          const errorMessage = 'Failed to resend verification email. Please try again.';
          set({
            loading: false,
            error: errorMessage,
          });
          return { success: false, message: errorMessage };
        }
      },

      requestPasswordReset: async (email: string) => {
        set({ loading: true, error: null });

        try {
          const response = await authService.requestPasswordReset(email);

          set({
            loading: false,
            error: response.success ? null : response.message,
          });

          return { success: response.success, message: response.message };
        } catch (error) {
          const errorMessage = 'Failed to send password reset email. Please try again.';
          set({
            loading: false,
            error: errorMessage,
          });
          return { success: false, message: errorMessage };
        }
      },

      resetPassword: async (token: string, newPassword: string) => {
        set({ loading: true, error: null });

        try {
          const response = await authService.resetPassword(token, newPassword);

          set({
            loading: false,
            error: response.success ? null : response.message,
          });

          return { success: response.success, message: response.message };
        } catch (error) {
          const errorMessage = 'Failed to reset password. Please try again.';
          set({
            loading: false,
            error: errorMessage,
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
          error: null,
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
              error: null,
            });
          } else {
            // Token is invalid, clear everything
            authService.logout();
            set({
              isAuthenticated: false,
              user: null,
              token: null,
              loading: false,
              error: null,
            });
          }
        } catch (error) {
          authService.logout();
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            loading: false,
            error: null,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    }
  )
);

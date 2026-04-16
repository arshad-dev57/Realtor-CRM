// src/controllers/auth.controller.ts

import { api } from '@/lib/api';

class AuthController {
  async adminLogin(email: string, password: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const response = await api.adminLogin(email, password);
      
      if (response.success) {
        // Set cookie for middleware
        if (typeof document !== 'undefined') {
          document.cookie = `token=${response.token}; path=/; max-age=604800`; // 7 days
        }
        
        return {
          success: true,
          message: 'Login successful',
          data: response.data
        };
      }
      
      return {
        success: false,
        message: response.message || 'Login failed'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Network error'
      };
    }
  }

  async userLogin(email: string, password: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const response = await api.login(email, password);
      
      if (response.success) {
        // Set cookie for middleware
        if (typeof document !== 'undefined') {
          document.cookie = `token=${response.token}; path=/; max-age=604800`;
        }
        
        return {
          success: true,
          message: 'Login successful',
          data: response.data
        };
      }
      
      return {
        success: false,
        message: response.message || 'Login failed'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Network error'
      };
    }
  }

  isLoggedIn(): boolean {
    if (typeof window !== 'undefined') {
      // Check both localStorage and cookie
      const token = localStorage.getItem('token');
      const hasCookie = document.cookie.includes('token=');
      return !!token || hasCookie;
    }
    return false;
  }

  getUser(): any {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  logout() {
    if (typeof document !== 'undefined') {
      // Clear cookie
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    api.logout();
  }
}

export const authController = new AuthController();
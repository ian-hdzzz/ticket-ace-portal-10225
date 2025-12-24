import apiClient from '../api/client';

/**
 * Response types matching backend API
 */
export interface LoginResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    is_temporary_password: boolean;
    roles: Array<{
      id?: string;
      name: string;
    }>;
  };
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    is_temporary_password: boolean;
    roles: Array<{
      id?: string;
      name: string;
    }>;
  };
}

export interface ApiError {
  success: false;
  message: string;
}

/**
 * Authentication Service
 * Handles all authentication-related API calls to the backend
 */
class AuthService {
  /**
   * Login user with email and password
   * Sets HTTP-only cookies (accessToken, refreshToken) on successful login
   * 
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise with user data and success status
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email,
        password,
      });

      return response.data;
    } catch (error: any) {
      // If backend returned an error response
      if (error.response?.data) {
        throw error.response.data;
      }
      
      // Network or other error
      throw {
        success: false,
        message: error.message || 'Error de conexión con el servidor',
      };
    }
  }

  /**
   * Logout user
   * Clears HTTP-only cookies (accessToken, refreshToken)
   * 
   * @returns Promise with success status
   */
  async logout(): Promise<LogoutResponse> {
    try {
      const response = await apiClient.post<LogoutResponse>('/auth/logout');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }
      
      throw {
        success: false,
        message: error.message || 'Error al cerrar sesión',
      };
    }
  }

  /**
   * Refresh access token using refresh token from cookies
   * Backend will issue a new access token if refresh token is valid
   * 
   * @returns Promise with success status
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }
      
      throw {
        success: false,
        message: error.message || 'Error al actualizar token',
      };
    }
  }

  /**
   * Change password for authenticated user
   * Used especially for users with temporary passwords
   * 
   * @param newPassword - New password to set
   * @param confirmPassword - Confirmation of new password
   * @returns Promise with updated user data
   */
  async changePassword(newPassword: string, confirmPassword: string): Promise<ChangePasswordResponse> {
    try {
      const response = await apiClient.post<ChangePasswordResponse>('/auth/change-password', {
        newPassword,
        confirmPassword,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }
      
      throw {
        success: false,
        message: error.message || 'Error al cambiar contraseña',
      };
    }
  }

  /**
   * Check if user is authenticated by verifying stored user data
   * Note: This only checks localStorage, doesn't validate tokens
   * For true validation, use refreshToken() or protected API calls
   * 
   * @returns User object if authenticated, null otherwise
   */
  getCurrentUser(): LoginResponse['user'] | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Store user data in localStorage
   * Called after successful login
   * 
   * @param user - User object from login response
   */
  setCurrentUser(user: LoginResponse['user']): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Clear user data from localStorage
   * Called after logout
   */
  clearCurrentUser(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('user_temp');
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;


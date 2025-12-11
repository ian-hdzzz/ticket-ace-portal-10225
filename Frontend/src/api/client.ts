import axios from 'axios';

// Base API URL - your backend server
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Important: Send cookies with every request
  withCredentials: true,
});

// Request interceptor - can add auth tokens or logging here
apiClient.interceptors.request.use(
  (config) => {
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    // Log error in development
    if (import.meta.env.DEV) {
      console.error('[API Response Error]', error.response?.data || error.message);
    }

    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized - could trigger logout or token refresh here
        console.warn('[API] Unauthorized access');
      }

      if (status === 500) {
        console.error('[API] Server error:', data?.message || 'Internal server error');
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('[API] No response from server');
    } else {
      // Something else happened
      console.error('[API] Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;


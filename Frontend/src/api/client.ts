import axios from 'axios';

// Base API URL - empty string for relative URLs (Traefik/nginx handles routing)
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

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

// Track if we're currently refreshing to avoid multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error in development
    if (import.meta.env.DEV) {
      console.error('[API Response Error]', error.response?.data || error.message);
    }

    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      if (status === 401 && !originalRequest._retry) {
        // Don't redirect on login/logout/refresh endpoints
        const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                               originalRequest.url?.includes('/auth/logout') ||
                               originalRequest.url?.includes('/auth/refresh');
        
        if (isAuthEndpoint) {
          // Let auth errors bubble up naturally
          return Promise.reject(error);
        }

        // Unauthorized - clear session and redirect to login
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => {
            return apiClient(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          console.log('[API] 401 received, logging out...');
          processQueue(null);
          isRefreshing = false;

          // Clear user data and redirect to login
          localStorage.removeItem('user');
          localStorage.removeItem('user_temp');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        } catch (refreshError) {
          console.error('[API] Token refresh failed, logging out...');
          processQueue(refreshError);
          isRefreshing = false;

          // Clear user data and redirect to login
          localStorage.removeItem('user');
          localStorage.removeItem('user_temp');

          // Only redirect if not already on login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }

          return Promise.reject(refreshError);
        }
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


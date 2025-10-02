import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Base API configuration factory
export const createApiClient = (getToken?: () => Promise<string | null>) => {
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    timeout: 60000, // 60 seconds for AI model responses
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // Send cookies with requests for Clerk authentication
  });

  // Request interceptor
  api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // Get Clerk session token and add to Authorization header
      if (getToken) {
        try {
          const token = await getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('[API] Token added to request:', config.url, 'Token length:', token.length);
          } else {
            console.warn('[API] No token available for request to:', config.url);
            console.warn('[API] User may not be fully authenticated yet');
          }
        } catch (error) {
          console.error('[API] Failed to get Clerk token for:', config.url, error);
        }
      }
      // Note: Some endpoints don't require authentication, so no token getter is fine
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  api.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      // Global error handling
      const requestUrl = error.config?.url || 'unknown';
      
      // Handle 401 errors with detailed logging
      if (error.response?.status === 401) {
        console.error(`[API] 401 Unauthorized error for: ${requestUrl}`);
        console.error('[API] This usually means the auth token is missing, invalid, or expired');
        console.error('[API] Make sure you are signed in and the token is properly sent');
      }
      
      // Handle other error types
      if (error.response?.status === 429) {
        console.warn(`[API] Rate limit exceeded for: ${requestUrl}`);
      } else if (error.response?.status === 500) {
        console.error(`[API] Server error for: ${requestUrl}`, error.response.data);
      } else if (error.code === 'ECONNABORTED') {
        console.error(`[API] Request timeout for: ${requestUrl}`);
      } else if (error.code === 'ECONNREFUSED') {
        console.error(`[API] Connection refused. Backend server may be down.`);
      }
      
      return Promise.reject(error);
    }
  );

  return api;
};

// Default API instance for non-authenticated requests
const api = createApiClient();

export default api;

// Error handling utilities
export const isApiError = (error: any): error is AxiosError => {
  return error.isAxiosError === true;
};

export const getErrorMessage = (error: any): string => {
  if (isApiError(error)) {
    if (error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
      return String(error.response.data.message);
    }
    if (error.response?.status === 429) {
      return 'Rate limit exceeded. Please try again later.';
    }
    if (error.response?.status === 500) {
      return 'Server error. Please check if the backend is running.';
    }
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout. AI models are taking longer than expected.';
    }
    if (error.code === 'ECONNREFUSED') {
      return 'Unable to connect to the backend. Please ensure the API server is running.';
    }
  }
  return error.message || 'An unexpected error occurred';
};
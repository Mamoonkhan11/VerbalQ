import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

const configuredBaseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const baseURL = configuredBaseURL.includes('://localhost:8001') ? 'http://localhost:5000' : configuredBaseURL;

const api: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth and common errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const data = error.response?.data as any;

    // Handle authentication errors
    if (status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle blocked user errors (403)
    if (status === 403 && data && data.message?.includes('blocked')) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login?error=blocked';
      return Promise.reject(error);
    }
    
    // Handle guest limit reached (403 with GUEST_LIMIT_REACHED)
    if (status === 403 && data && data.message === 'GUEST_LIMIT_REACHED') {
      // Dispatch custom event to trigger modal
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('guest-limit-reached', {
          detail: { usageCount: data.data?.usageCount || 3 }
        }))
      }
      return Promise.reject(error);
    }

    // Handle rate limiting and server errors silently
    // Errors will be handled by the calling components with toast messages

    return Promise.reject(error);
  }
);

export default api;

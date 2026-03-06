import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available (skip for login endpoints)
api.interceptors.request.use((config) => {
  const isLoginRoute = config.url?.includes('/auth/login') || config.url?.includes('/auth/admin/login') || config.url?.includes('/auth/register');
  if (!isLoginRoute) {
    const storedAuth = localStorage.getItem('auth-storage');
    if (storedAuth) {
      try {
        const { state } = JSON.parse(storedAuth);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (e) {
        // corrupt storage, ignore
      }
    }
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only wipe auth-storage when the token is explicitly rejected (not just server errors)
      const url = error.config?.url || '';
      const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/admin/login') || url.includes('/auth/register');
      const message = error.response?.data?.message || '';
      // Only clear storage if backend explicitly says token is bad/missing, not for other 401s
      const isTokenRejection = message.includes('token') || message.includes('Not authorized, no token');
      if (!isAuthRoute && isTokenRejection) {
        localStorage.removeItem('auth-storage');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

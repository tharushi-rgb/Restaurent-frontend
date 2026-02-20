import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const storedAuth = localStorage.getItem('auth-storage');
  if (storedAuth) {
    const { state } = JSON.parse(storedAuth);
    if (state?.token) {
      config.headers.Authorization = `Bearer ${state.token}`;
    }
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      // Don't redirect if already on login page
      if (!window.location.pathname.includes('login')) {
        // window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

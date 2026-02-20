import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from './api';

// Auth Store
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: async (email, password) => {
        try {
          const { data } = await api.post('/auth/login', { email, password });
          set({ 
            user: data.user, 
            token: data.token, 
            isAuthenticated: true 
          });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          return { success: true };
        } catch (error) {
          return { success: false, error: error.response?.data?.message || 'Login failed' };
        }
      },
      
      adminLogin: async (email, password) => {
        try {
          const { data } = await api.post('/auth/admin/login', { email, password });
          set({ 
            user: data.user, 
            token: data.token, 
            isAuthenticated: true 
          });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          return { success: true };
        } catch (error) {
          return { success: false, error: error.response?.data?.message || 'Login failed' };
        }
      },
      
      register: async (userData) => {
        try {
          const { data } = await api.post('/auth/register', userData);
          set({ 
            user: data.user, 
            token: data.token, 
            isAuthenticated: true 
          });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          return { success: true };
        } catch (error) {
          return { success: false, error: error.response?.data?.message || 'Registration failed' };
        }
      },
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        delete api.defaults.headers.common['Authorization'];
      },
      
      updateHealthProfile: async (healthProfile) => {
        try {
          const { data } = await api.put('/health-profile', healthProfile);
          set((state) => ({
            user: { ...state.user, healthProfile: data.healthProfile }
          }));
          return { success: true };
        } catch (error) {
          return { success: false, error: error.response?.data?.message };
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// Cart Store
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      tableNumber: null,
      
      setTable: (tableNumber) => set({ tableNumber }),
      
      addItem: (item) => set((state) => ({
        items: [...state.items, { ...item, id: Date.now().toString() }]
      })),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map(item => 
          item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
        )
      })),
      
      clearCart: () => set({ items: [] }),
      
      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const priceMultiplier = item.customizations?.portion === 'Large' ? 1.5 : 1;
          return total + (item.price * priceMultiplier * item.quantity);
        }, 0);
      },
      
      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: 'cart-storage',
    }
  )
);

// Order Store
export const useOrderStore = create((set) => ({
  currentOrder: null,
  orderHistory: [],
  
  setCurrentOrder: (order) => set({ currentOrder: order }),
  
  addToHistory: (order) => set((state) => ({
    orderHistory: [order, ...state.orderHistory]
  })),
  
  clearCurrentOrder: () => set({ currentOrder: null }),
}));

// Menu Store
export const useMenuStore = create((set) => ({
  items: [],
  categories: ['All'],
  selectedCategory: 'All',
  isLoading: false,
  
  setItems: (items) => set({ items }),
  setCategories: (categories) => set({ categories }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setLoading: (isLoading) => set({ isLoading }),
  
  fetchMenu: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/menu');
      set({ items: data.items, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch menu:', error);
      set({ isLoading: false });
    }
  },
  
  fetchCategories: async () => {
    try {
      const { data } = await api.get('/menu/categories');
      set({ categories: data });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }
}));

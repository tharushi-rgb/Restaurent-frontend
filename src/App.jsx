import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store';
import api from './api';

// Customer Pages
import LandingPage from './pages/customer/LandingPage';
import MenuPage from './pages/customer/MenuPage';
import DishDetailPage from './pages/customer/DishDetailPage';
import CartPage from './pages/customer/CartPage';
import OrderStatusPage from './pages/customer/OrderStatusPage';
import HealthProfilePage from './pages/customer/HealthProfilePage';
import LoginPage from './pages/customer/LoginPage';
import RegisterPage from './pages/customer/RegisterPage';
import FeedbackPage from './pages/customer/FeedbackPage';
import ServiceRequestPage from './pages/customer/ServiceRequestPage';
import RecommendationsPage from './pages/customer/RecommendationsPage';
import ProfilePage from './pages/customer/ProfilePage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMenu from './pages/admin/AdminMenu';
import AdminOrders from './pages/admin/AdminOrders';
import AdminStaff from './pages/admin/AdminStaff';
import KitchenDisplay from './pages/admin/KitchenDisplay';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminFeedback from './pages/admin/AdminFeedback';
import AdminTables from './pages/admin/AdminTables';
import AdminLayout from './pages/admin/AdminLayout';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Mobile wrapper for customer-facing pages (QR code scanned on phone)
function MobileLayout({ children }) {
  return (
    <div className="h-screen bg-gray-950 flex flex-col">
      <div className="max-w-[375px] w-full mx-auto h-full bg-white shadow-2xl relative overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
}

function App() {
  const location = useLocation();
  const { token } = useAuthStore();
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname === '/kitchen';
  const isStaffLogin = location.pathname === '/admin/login';

  // Restore token on app mount / route change
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  // Admin / Staff routes — full desktop layout
  if (isAdminRoute) {
    if (isStaffLogin) {
      return (
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
        </Routes>
      );
    }

    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'kitchen_staff']}>
            <AdminLayout><AdminDashboard /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/menu" element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <AdminLayout><AdminMenu /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'kitchen_staff']}>
            <AdminLayout><AdminOrders /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/staff" element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <AdminLayout><AdminStaff /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <AdminLayout><AdminAnalytics /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/feedback" element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <AdminLayout><AdminFeedback /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/tables" element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <AdminLayout><AdminTables /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/kitchen" element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'kitchen_staff']}>
            <AdminLayout><KitchenDisplay /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }

  // Customer routes — mobile-first layout
  return (
    <MobileLayout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/menu/:id" element={<DishDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/order-status" element={<OrderStatusPage />} />
        <Route path="/health-profile" element={<HealthProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/service-request" element={<ServiceRequestPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MobileLayout>
  );
}

export default App;

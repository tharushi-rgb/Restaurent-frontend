import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store';

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

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMenu from './pages/admin/AdminMenu';
import AdminOrders from './pages/admin/AdminOrders';
import AdminStaff from './pages/admin/AdminStaff';
import KitchenDisplay from './pages/admin/KitchenDisplay';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminFeedback from './pages/admin/AdminFeedback';

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

function App() {
  const location = useLocation();
  const isStaffLogin = location.pathname === '/admin/login';

  return (
    <div className={`min-h-screen font-sans ${isStaffLogin ? 'bg-gray-950 text-white' : 'bg-gray-900 text-gray-900'}`}>
      <div className={isStaffLogin ? 'min-h-screen' : 'max-w-md mx-auto min-h-screen bg-white'}>
        <Routes>
        {/* Customer Routes */}
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
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/menu" element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <AdminMenu />
          </ProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'kitchen_staff']}>
            <AdminOrders />
          </ProtectedRoute>
        } />
        <Route path="/admin/staff" element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <AdminStaff />
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <AdminAnalytics />
          </ProtectedRoute>
        } />
        <Route path="/admin/feedback" element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <AdminFeedback />
          </ProtectedRoute>
        } />
        <Route path="/kitchen" element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'kitchen_staff']}>
            <KitchenDisplay />
          </ProtectedRoute>
        } />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Menu, ShoppingCart, Users, ChefHat, BarChart3, LogOut, 
  TrendingUp, Clock, Star, DollarSign, AlertCircle, MessageSquare
} from 'lucide-react';
import { useAuthStore } from '../../store';
import api from '../../api';

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm"
  >
    <div className="flex items-center justify-between mb-2">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500">{title}</p>
    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
  </motion.div>
);

// Navigation Item Component
const NavItem = ({ icon: Icon, label, onClick, active }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
      active ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await api.get('/admin/dashboard');
      setStats(data.todayStats);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">VibeDine Dashboard</h1>
            <p className="text-sm text-gray-400">Welcome, {user?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 bg-orange-600 rounded-full capitalize">
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>
      </header>

      <div className="p-4">
        {/* Quick Stats */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatCard
              title="Today's Orders"
              value={stats?.orders || 0}
              icon={ShoppingCart}
              color="bg-blue-500"
            />
            <StatCard
              title="Revenue"
              value={`$${stats?.revenue?.toFixed(2) || '0.00'}`}
              icon={DollarSign}
              color="bg-green-500"
            />
            <StatCard
              title="Active Orders"
              value={stats?.activeOrders || 0}
              icon={Clock}
              color="bg-orange-500"
              subtitle="In progress"
            />
            <StatCard
              title="Tables"
              value={`${stats?.tablesOccupied || 0}/${stats?.totalTables || 0}`}
              icon={Users}
              color="bg-purple-500"
              subtitle="Occupied"
            />
            <StatCard
              title="Avg Prep Time"
              value={`${stats?.avgPrepTime || 0} min`}
              icon={TrendingUp}
              color="bg-cyan-500"
            />
            <StatCard
              title="Rating"
              value={stats?.avgRating || 'N/A'}
              icon={Star}
              color="bg-yellow-500"
              subtitle="This week"
            />
          </div>
        )}

        {/* Navigation Menu */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <NavItem
              icon={ShoppingCart}
              label="View Orders"
              onClick={() => navigate('/admin/orders')}
            />
            <NavItem
              icon={Menu}
              label="Manage Menu"
              onClick={() => navigate('/admin/menu')}
            />
            <NavItem
              icon={ChefHat}
              label="Kitchen Display"
              onClick={() => navigate('/kitchen')}
            />
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <NavItem
                icon={Users}
                label="Staff Management"
                onClick={() => navigate('/admin/staff')}
              />
            )}
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <NavItem
                icon={BarChart3}
                label="Analytics & Reports"
                onClick={() => navigate('/admin/analytics')}
              />
            )}
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <NavItem
                icon={MessageSquare}
                label="Customer Feedback"
                onClick={() => navigate('/admin/feedback')}
              />
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
              <AlertCircle className="text-orange-600" size={20} />
              <div>
                <p className="text-sm font-medium text-gray-900">New orders incoming</p>
                <p className="text-xs text-gray-500">Check kitchen display for details</p>
              </div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl font-semibold"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

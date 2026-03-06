import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, Users, ChefHat, 
  TrendingUp, Clock, Star, DollarSign, AlertCircle,
  ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';
import { useAuthStore } from '../../store';
import api from '../../api';

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, bgColor, subtitle, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bgColor}`}>
        <Icon size={20} className={color} />
      </div>
      {subtitle && (
        <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
          {subtitle}
        </span>
      )}
    </div>
    <p className="text-2xl font-extrabold text-gray-900 mb-0.5">{value}</p>
    <p className="text-xs text-gray-500 font-medium">{title}</p>
  </motion.div>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
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

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Page Header */}
      <div className="px-6 lg:px-8 py-6 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500 mt-0.5">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-3 py-1.5 bg-green-50 text-green-600 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={10} />
                Live
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-6">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <StatCard
                  title="Today's Orders"
                  value={stats?.orders || 0}
                  icon={ShoppingCart}
                  color="text-blue-600"
                  bgColor="bg-blue-50"
                  subtitle="Today"
                  delay={0}
                />
                <StatCard
                  title="Revenue"
                  value={`$${stats?.revenue?.toFixed(2) || '0.00'}`}
                  icon={DollarSign}
                  color="text-green-600"
                  bgColor="bg-green-50"
                  subtitle="Today"
                  delay={1}
                />
                <StatCard
                  title="Active Orders"
                  value={stats?.activeOrders || 0}
                  icon={Clock}
                  color="text-orange-600"
                  bgColor="bg-orange-50"
                  subtitle="In progress"
                  delay={2}
                />
                <StatCard
                  title="Tables Occupied"
                  value={`${stats?.tablesOccupied || 0}/${stats?.totalTables || 0}`}
                  icon={Users}
                  color="text-purple-600"
                  bgColor="bg-purple-50"
                  delay={3}
                />
                <StatCard
                  title="Avg Prep Time"
                  value={`${stats?.avgPrepTime || 0} min`}
                  icon={TrendingUp}
                  color="text-cyan-600"
                  bgColor="bg-cyan-50"
                  delay={4}
                />
                <StatCard
                  title="Avg Rating"
                  value={stats?.avgRating || 'N/A'}
                  icon={Star}
                  color="text-yellow-600"
                  bgColor="bg-yellow-50"
                  subtitle="This week"
                  delay={5}
                />
              </div>

              {/* Quick Actions + Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
                >
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => navigate('/admin/orders')}
                      className="p-4 bg-blue-50 rounded-xl text-left hover:bg-blue-100 transition-colors group"
                    >
                      <ShoppingCart size={20} className="text-blue-600 mb-2" />
                      <p className="text-sm font-semibold text-gray-900">View Orders</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Manage all orders</p>
                    </button>
                    <button
                      onClick={() => navigate('/admin/menu')}
                      className="p-4 bg-orange-50 rounded-xl text-left hover:bg-orange-100 transition-colors group"
                    >
                      <ChefHat size={20} className="text-orange-600 mb-2" />
                      <p className="text-sm font-semibold text-gray-900">Menu</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Update menu items</p>
                    </button>
                    <button
                      onClick={() => navigate('/kitchen')}
                      className="p-4 bg-green-50 rounded-xl text-left hover:bg-green-100 transition-colors group"
                    >
                      <Activity size={20} className="text-green-600 mb-2" />
                      <p className="text-sm font-semibold text-gray-900">Kitchen</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Kitchen display</p>
                    </button>
                    <button
                      onClick={() => navigate('/admin/analytics')}
                      className="p-4 bg-purple-50 rounded-xl text-left hover:bg-purple-100 transition-colors group"
                    >
                      <TrendingUp size={20} className="text-purple-600 mb-2" />
                      <p className="text-sm font-semibold text-gray-900">Analytics</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">View insights</p>
                    </button>
                  </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
                >
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Recent Activity</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                      <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="text-orange-600" size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">New orders incoming</p>
                        <p className="text-[10px] text-gray-500">Check kitchen display for details</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                      <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ShoppingCart className="text-blue-600" size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{stats?.orders || 0} orders today</p>
                        <p className="text-[10px] text-gray-500">{stats?.activeOrders || 0} currently active</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                      <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <DollarSign className="text-green-600" size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">${stats?.revenue?.toFixed(2) || '0.00'} revenue</p>
                        <p className="text-[10px] text-gray-500">Today's total earnings</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

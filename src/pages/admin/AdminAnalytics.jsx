import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, TrendingUp, DollarSign, Clock, ShoppingCart,
  Star, BarChart3, PieChart as PieChartIcon, Calendar, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import api from '../../api';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#ef4444', '#06b6d4'];

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('7d');
  const [analytics, setAnalytics] = useState(null);
  const [serviceMetrics, setServiceMetrics] = useState(null);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, metricsRes, feedbackRes] = await Promise.all([
        api.get(`/admin/analytics?period=${period}`),
        api.get('/admin/service-metrics'),
        api.get('/feedback/stats')
      ]);
      setAnalytics(analyticsRes.data);
      setServiceMetrics(metricsRes.data.metrics);
      setFeedbackStats(feedbackRes.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')} className="p-2 hover:bg-gray-800 rounded-lg">
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold">Analytics & Reports</h1>
              <p className="text-sm text-gray-400">Performance insights & trends</p>
            </div>
          </div>
          
          {/* Period Selector */}
          <div className="flex gap-2">
            {[
              { key: '7d', label: '7 Days' },
              { key: '30d', label: '30 Days' },
              { key: '90d', label: '90 Days' }
            ].map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === p.key ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="max-w-6xl mx-auto p-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard
              title="Avg Order Value"
              value={`$${analytics?.avgOrderValue || '0.00'}`}
              icon={DollarSign}
              color="bg-green-500"
              trend="+5.2%"
              positive
            />
            <KPICard
              title="Avg Prep Time"
              value={`${serviceMetrics?.avgPrepTime || 0} min`}
              icon={Clock}
              color="bg-blue-500"
              trend={serviceMetrics?.avgPrepTime > 15 ? '+2 min' : '-1 min'}
              positive={serviceMetrics?.avgPrepTime <= 15}
            />
            <KPICard
              title="Order Accuracy"
              value={`${serviceMetrics?.orderAccuracy || 100}%`}
              icon={ShoppingCart}
              color="bg-purple-500"
              trend="+0.5%"
              positive
            />
            <KPICard
              title="Avg Rating"
              value={feedbackStats?.avgOverallRating || 'N/A'}
              icon={Star}
              color="bg-yellow-500"
              trend={`${feedbackStats?.totalFeedback || 0} reviews`}
              positive
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Trend */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Revenue Trend</h3>
                <BarChart3 size={20} className="text-gray-400" />
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.revenueByDay || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="_id" 
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      tickFormatter={(val) => {
                        const d = new Date(val);
                        return `${d.getMonth()+1}/${d.getDate()}`;
                      }}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip 
                      formatter={(val) => [`$${val.toFixed(2)}`, 'Revenue']}
                      labelFormatter={(val) => new Date(val).toLocaleDateString()}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Orders by Day */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Orders by Day</h3>
                <Calendar size={20} className="text-gray-400" />
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.revenueByDay || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="_id" 
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      tickFormatter={(val) => {
                        const d = new Date(val);
                        return `${d.getMonth()+1}/${d.getDate()}`;
                      }}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <Tooltip 
                      labelFormatter={(val) => new Date(val).toLocaleDateString()}
                    />
                    <Bar dataKey="orders" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Popular Items */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm lg:col-span-1">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Top Items</h3>
              <div className="space-y-3">
                {(analytics?.popularItems || []).slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                      idx === 0 ? 'bg-orange-500' : idx === 1 ? 'bg-gray-700' : idx === 2 ? 'bg-yellow-600' : 'bg-gray-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.category}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm text-gray-900">{item.totalOrdered}x</p>
                      <p className="text-xs text-gray-400">${item.revenue?.toFixed(0)}</p>
                    </div>
                  </div>
                ))}
                {(!analytics?.popularItems || analytics.popularItems.length === 0) && (
                  <p className="text-sm text-gray-400 text-center py-4">No data yet</p>
                )}
              </div>
            </div>

            {/* Order Status Distribution */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Status</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={(analytics?.ordersByStatus || []).map(s => ({
                        name: (s._id || s.status)?.charAt(0).toUpperCase() + (s._id || s.status)?.slice(1).replace('_', ' '),
                        value: s.count
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(analytics?.ordersByStatus || []).map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Feedback Summary */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Feedback Overview</h3>
              <div className="space-y-4">
                <FeedbackBar label="Food Quality" value={feedbackStats?.avgFoodRating || 0} />
                <FeedbackBar label="Service" value={feedbackStats?.avgServiceRating || 0} />
                <FeedbackBar label="Overall" value={feedbackStats?.avgOverallRating || 0} />
                
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Would Recommend</span>
                    <span className="text-sm font-bold text-green-600">{feedbackStats?.recommendationRate || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${feedbackStats?.recommendationRate || 0}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-gray-400 text-center">
                    Based on {feedbackStats?.totalFeedback || 0} reviews
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Service Efficiency */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Service Efficiency (Today)</h3>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
              <MetricItem label="Avg Prep Time" value={`${serviceMetrics?.avgPrepTime || 0} min`} />
              <MetricItem label="Avg Total Time" value={`${serviceMetrics?.avgTotalTime || 0} min`} />
              <MetricItem label="Fastest Prep" value={`${serviceMetrics?.minPrepTime || 0} min`} />
              <MetricItem label="Slowest Prep" value={`${serviceMetrics?.maxPrepTime || 0} min`} />
              <MetricItem label="Total Orders" value={serviceMetrics?.totalOrders || 0} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KPICard({ title, value, icon: Icon, color, trend, positive }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon size={20} className="text-white" />
        </div>
        {trend && (
          <span className={`text-xs font-bold flex items-center gap-0.5 ${positive ? 'text-green-600' : 'text-red-500'}`}>
            {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{title}</p>
    </motion.div>
  );
}

function FeedbackBar({ label, value }) {
  const numValue = parseFloat(value) || 0;
  const percentage = (numValue / 5) * 100;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <div className="flex items-center gap-1">
          <Star size={12} fill="#f97316" className="text-orange-500" />
          <span className="text-sm font-bold text-gray-900">{numValue}</span>
        </div>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-orange-500 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function MetricItem({ label, value }) {
  return (
    <div className="text-center p-4 bg-gray-50 rounded-xl">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

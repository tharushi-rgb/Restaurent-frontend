import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, Heart, CheckCircle2, ChevronDown,
  ShoppingBag, Star, Edit3, Save, X, LogOut, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store';
import api from '../../api';
import { PageHeaderDual } from '../../components/CustomerLayout';

const allergyList = ['Peanuts', 'Dairy', 'Gluten', 'Shellfish', 'Soy', 'Eggs', 'Tree Nuts', 'Sesame', 'Fish'];
const goalList = ['Weight Loss', 'Muscle Gain', 'Low Sodium', 'Keto', 'Vegan', 'High Protein'];
const dietaryOptions = ['', 'Vegetarian', 'Vegan', 'Paleo', 'Keto'];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateHealthProfile } = useAuthStore();

  const [editingProfile, setEditingProfile] = useState(false);
  const [editingHealth, setEditingHealth] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // health profile state
  const [allergies, setAllergies] = useState(user?.healthProfile?.allergies || []);
  const [dietaryPlan, setDietaryPlan] = useState(user?.healthProfile?.dietaryPlan || '');
  const [healthGoals, setHealthGoals] = useState(user?.healthProfile?.healthGoals || []);
  const [savingHealth, setSavingHealth] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadOrders();
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      const { data } = await api.get('/orders/my-orders');
      setOrders(data.orders || data || []);
    } catch {
      // not critical
    } finally {
      setOrdersLoading(false);
    }
  };

  const toggle = (list, setList, item) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const handleSaveHealth = async () => {
    setSavingHealth(true);
    try {
      const result = await updateHealthProfile({ allergies, dietaryPlan, healthGoals });
      if (result.success) {
        toast.success('Health profile updated!');
        setEditingHealth(false);
      } else {
        toast.error(result.error || 'Failed to update');
      }
    } catch {
      toast.error('Failed to update health profile');
    } finally {
      setSavingHealth(false);
    }
  };

  const handleCancelHealth = () => {
    setAllergies(user?.healthProfile?.allergies || []);
    setDietaryPlan(user?.healthProfile?.dietaryPlan || '');
    setHealthGoals(user?.healthProfile?.healthGoals || []);
    setEditingHealth(false);
  };

  const handleLogout = () => {
    logout();
    toast.success('Signed out');
    navigate('/');
  };

  // Analytics derived from orders
  const totalOrders = orders.length;
  const totalSpend = orders.reduce((sum, o) => sum + (o.total || o.totalAmount || 0), 0);
  const completedOrders = orders.filter(o => o.status === 'delivered').length;
  const avgRating = orders.filter(o => o.feedback?.overallRating).length > 0
    ? (orders.reduce((s, o) => s + (o.feedback?.overallRating || 0), 0) / orders.filter(o => o.feedback?.overallRating).length).toFixed(1)
    : null;

  if (!isAuthenticated) return null;

  return (
    <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
      <PageHeaderDual
        title="My Profile"
        onBack={() => navigate(-1)}
        gradient="from-slate-700 via-slate-600 to-slate-500"
      />

      <div className="flex-1 overflow-y-auto pb-6">

        {/* Avatar + Name */}
        <div className="bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500 px-6 pt-5 pb-8 -mt-px">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-extrabold text-2xl">
                {user?.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">{user?.name}</h2>
              <p className="text-white/60 text-xs capitalize">{user?.role || 'Customer'}</p>
            </div>
          </div>
        </div>

        <div className="px-5 -mt-4 space-y-4">

          {/* Account Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User size={14} className="text-blue-600" />
                </div>
                <h3 className="text-sm font-bold text-gray-800">Account Details</h3>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <User size={15} className="text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Name</p>
                  <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Mail size={15} className="text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Email</p>
                  <p className="text-sm font-medium text-gray-800">{user?.email}</p>
                </div>
              </div>
              {user?.phone && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Phone size={15} className="text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Phone</p>
                    <p className="text-sm font-medium text-gray-800">{user?.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Order Analytics Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={14} className="text-orange-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-800">My Dining Stats</h3>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-orange-50 rounded-xl p-3 text-center">
                <p className="text-xl font-extrabold text-orange-600">{totalOrders}</p>
                <p className="text-[10px] text-gray-500 font-medium mt-0.5">Total Orders</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-xl font-extrabold text-green-600">{completedOrders}</p>
                <p className="text-[10px] text-gray-500 font-medium mt-0.5">Completed</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-xl font-extrabold text-blue-600">${totalSpend.toFixed(0)}</p>
                <p className="text-[10px] text-gray-500 font-medium mt-0.5">Total Spent</p>
              </div>
            </div>

            {avgRating && (
              <div className="mt-3 flex items-center gap-2 p-3 bg-amber-50 rounded-xl">
                <Star size={14} className="text-amber-500 fill-amber-500 flex-shrink-0" />
                <p className="text-sm font-medium text-gray-700">Average rating given: <span className="font-bold text-amber-600">{avgRating} / 5</span></p>
              </div>
            )}

            {/* Recent Orders */}
            {!ordersLoading && orders.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recent Orders</p>
                <div className="space-y-2">
                  {orders.slice(0, 3).map(order => (
                    <div key={order.id || order._id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <ShoppingBag size={13} className="text-gray-400" />
                        <span className="text-xs font-semibold text-gray-700">#{order.orderNumber || (order.id || '').slice(-6)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">${(order.total || order.totalAmount || 0).toFixed(2)}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'ready' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'preparing' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Health Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Heart size={14} className="text-emerald-600" />
                </div>
                <h3 className="text-sm font-bold text-gray-800">Health Profile</h3>
              </div>
              {!editingHealth ? (
                <button
                  onClick={() => setEditingHealth(true)}
                  className="flex items-center gap-1 text-xs text-emerald-600 font-semibold px-2.5 py-1.5 bg-emerald-50 rounded-xl"
                >
                  <Edit3 size={12} />
                  Edit
                </button>
              ) : (
                <div className="flex gap-1.5">
                  <button
                    onClick={handleCancelHealth}
                    className="flex items-center gap-1 text-xs text-gray-500 font-semibold px-2.5 py-1.5 bg-gray-100 rounded-xl"
                  >
                    <X size={12} />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveHealth}
                    disabled={savingHealth}
                    className="flex items-center gap-1 text-xs text-white font-semibold px-2.5 py-1.5 bg-emerald-500 rounded-xl disabled:opacity-50"
                  >
                    {savingHealth ? (
                      <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save size={12} />
                    )}
                    Save
                  </button>
                </div>
              )}
            </div>

            {!editingHealth ? (
              /* Read-only view */
              <div className="space-y-3">
                {allergies.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Allergies</p>
                    <div className="flex flex-wrap gap-1.5">
                      {allergies.map(a => (
                        <span key={a} className="text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-medium">{a}</span>
                      ))}
                    </div>
                  </div>
                )}
                {dietaryPlan && (
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Dietary Plan</p>
                    <span className="text-xs bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full font-medium">{dietaryPlan}</span>
                  </div>
                )}
                {healthGoals.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Health Goals</p>
                    <div className="flex flex-wrap gap-1.5">
                      {healthGoals.map(g => (
                        <span key={g} className="text-xs bg-emerald-100 text-emerald-600 px-2.5 py-1 rounded-full font-medium">{g}</span>
                      ))}
                    </div>
                  </div>
                )}
                {allergies.length === 0 && !dietaryPlan && healthGoals.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-400">No health profile set yet.</p>
                    <button
                      onClick={() => setEditingHealth(true)}
                      className="mt-2 text-xs text-emerald-600 font-semibold"
                    >
                      Set up now →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Edit view */
              <div className="space-y-4">
                {/* Allergies */}
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Allergies</p>
                  <div className="flex flex-wrap gap-1.5">
                    {allergyList.map(a => (
                      <button
                        key={a}
                        onClick={() => toggle(allergies, setAllergies, a)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          allergies.includes(a)
                            ? 'bg-red-100 text-red-600 border border-red-200'
                            : 'bg-gray-50 text-gray-600 border border-gray-100'
                        }`}
                      >
                        {allergies.includes(a) && <CheckCircle2 size={10} className="inline mr-1" />}
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dietary Plan */}
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Dietary Plan</p>
                  <div className="relative">
                    <select
                      value={dietaryPlan}
                      onChange={e => setDietaryPlan(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none pr-9"
                    >
                      {dietaryOptions.map(o => <option key={o} value={o}>{o || 'None selected'}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Health Goals */}
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Health Goals</p>
                  <div className="grid grid-cols-2 gap-2">
                    {goalList.map(g => (
                      <button
                        key={g}
                        onClick={() => toggle(healthGoals, setHealthGoals, g)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-medium text-left flex items-center justify-between transition-all ${
                          healthGoals.includes(g)
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-gray-50 text-gray-600 border border-gray-100'
                        }`}
                      >
                        {g}
                        {healthGoals.includes(g) && <CheckCircle2 size={12} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Sign Out Button */}
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-white border-2 border-red-100 rounded-2xl text-red-500 font-semibold text-sm active:scale-[0.98] transition-transform"
          >
            <LogOut size={16} />
            Sign Out
          </motion.button>

        </div>
      </div>
    </div>
  );
}

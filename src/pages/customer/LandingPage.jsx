import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UtensilsCrossed,
  Heart,
  Sparkles,
  Menu as MenuIcon,
  User,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore, useAuthStore } from '../../store';
import api from '../../api';
import { Sidebar } from '../../components/CustomerLayout';

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setTable } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const [tableNumber, setTableNumber] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const tableParam = searchParams.get('table');
    if (tableParam) verifyTable(tableParam);
  }, [searchParams]);

  const verifyTable = async (num) => {
    setVerifying(true);
    try {
      const { data } = await api.get(`/tables/scan/${num}`);
      if (data.table) {
        setTable(parseInt(num));
        toast.success(`Welcome to Table ${num}`);
      }
    } catch {
      toast.error('Invalid table number');
    } finally {
      setVerifying(false);
    }
  };

  const handleManualEntry = (e) => {
    e.preventDefault();
    if (tableNumber.trim()) verifyTable(tableNumber.trim());
  };

  const handleHealthProfile = () => {
    if (isAuthenticated) {
      navigate('/health-profile');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="h-full bg-orange-50/40 relative overflow-hidden flex flex-col">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Top Bar */}
      <div className="flex-shrink-0 px-5 pt-10 pb-0">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
          >
            <MenuIcon size={18} className="text-gray-700" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
              <Sparkles size={14} className="text-orange-600" />
            </div>
            <span className="text-gray-900 font-bold text-sm tracking-wide">VibeDine</span>
          </div>

          {isAuthenticated ? (
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-gray-700 text-xs font-medium"
            >
              <User size={13} />
              {user?.name?.split(' ')[0]}
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 rounded-full text-gray-700 text-xs font-medium"
              >
                <User size={12} />
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-orange-600 rounded-full text-white text-xs font-medium"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex-1 px-6 flex flex-col justify-center items-center text-center py-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <UtensilsCrossed size={32} className="text-orange-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight">
            VibeDine
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
            Delicious food tailored to your well-being.
          </p>
        </motion.div>

        {/* Table Entry */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="w-full max-w-sm mb-5"
        >
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5 text-center">
            Enter your table number to begin
          </p>
          <form onSubmit={handleManualEntry} className="flex gap-2">
            <input
              type="number"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Table number"
              className="flex-1 h-11 px-4 bg-white border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent shadow-sm"
            />
            <button
              type="submit"
              disabled={verifying || !tableNumber.trim()}
              className="h-11 px-6 bg-orange-600 text-white rounded-2xl font-semibold text-sm shadow-sm disabled:opacity-50 active:scale-95 transition-transform"
            >
              {verifying ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                'Go'
              )}
            </button>
          </form>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="w-full max-w-sm space-y-2.5"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/menu')}
            className="w-full bg-orange-600 text-white py-3.5 rounded-2xl font-semibold text-sm shadow-lg shadow-orange-200 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <UtensilsCrossed size={18} />
            Browse Menu
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleHealthProfile}
            className="w-full bg-white text-orange-600 border-2 border-orange-100 py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Heart size={18} />
            {isAuthenticated ? 'My Health Profile' : 'Create Health Profile'}
          </motion.button>
        </motion.div>

        {/* Compact feature highlights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-sm mt-5 flex items-center justify-center gap-4 text-[11px] text-gray-400"
        >
          <span className="flex items-center gap-1">
            <Sparkles size={11} className="text-orange-400" />
            AI Picks
          </span>
          <span className="w-1 h-1 bg-gray-300 rounded-full" />
          <span className="flex items-center gap-1">
            <Heart size={11} className="text-green-400" />
            Allergy Safe
          </span>
          <span className="w-1 h-1 bg-gray-300 rounded-full" />
          <span className="flex items-center gap-1">
            <UtensilsCrossed size={11} className="text-blue-400" />
            Nutrition Info
          </span>
        </motion.div>
      </div>

      {/* Staff link at bottom */}
      <div className="flex-shrink-0 pb-6 text-center">
        <button
          onClick={() => navigate('/admin/login')}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Staff Portal
          <ChevronRight size={12} className="inline ml-1" />
        </button>
      </div>
    </div>
  );
}


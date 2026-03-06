import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, UtensilsCrossed, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store';
import { PageHeaderDual } from '../../components/CustomerLayout';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const getUser = () => useAuthStore.getState().user;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success('Welcome back!');
        // Check if staff account — redirect to admin
        const loggedInUser = getUser();
        if (loggedInUser && ['admin', 'manager', 'kitchen_staff'].includes(loggedInUser.role)) {
          navigate('/admin', { replace: true });
        } else {
          const from = location.state?.from?.pathname || '/menu';
          navigate(from);
        }
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <PageHeaderDual
        title="Sign In"
        onBack={() => navigate(-1)}
      />

      {/* Main content */}
      <div className="flex-1 bg-white px-6 pt-6 pb-4 flex flex-col overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col"
        >
          {/* Welcome section */}
          <div className="mb-5">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
              <UtensilsCrossed size={24} className="text-orange-600" />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 mb-1">Welcome back</h1>
            <p className="text-gray-400 text-sm">Sign in to continue to VibeDine</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5 flex-1">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3.5 rounded-2xl font-bold text-base shadow-lg shadow-primary-200/40 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform mt-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Bottom links */}
          <div className="mt-auto pt-3 space-y-3">
            <p className="text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <button 
                onClick={() => navigate('/register')}
                className="text-primary-600 font-semibold"
              >
                Sign Up
              </button>
            </p>

            <button 
              onClick={() => navigate('/admin/login')}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors py-2"
            >
              Staff Portal
              <ChevronRight size={12} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

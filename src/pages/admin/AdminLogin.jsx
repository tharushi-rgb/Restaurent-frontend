import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { adminLogin } = useAuthStore();
  
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
      const result = await adminLogin(email, password);
      if (result.success) {
        toast.success('Welcome back!');
        navigate('/admin');
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
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="min-h-screen grid lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-center px-16 py-12 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
          <div className="max-w-md">
            <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mb-6">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-extrabold mb-4">VibeDine Staff Portal</h1>
            <p className="text-gray-400 text-lg mb-8">Secure access for managers and kitchen staff to manage orders, menus, and analytics.</p>

            <div className="space-y-4">
              <div className="p-4 bg-gray-900/70 border border-gray-800 rounded-2xl">
                <p className="text-sm text-gray-300">Real-time kitchen updates and order tracking.</p>
              </div>
              <div className="p-4 bg-gray-900/70 border border-gray-800 rounded-2xl">
                <p className="text-sm text-gray-300">Analytics dashboards for daily performance.</p>
              </div>
              <div className="p-4 bg-gray-900/70 border border-gray-800 rounded-2xl">
                <p className="text-sm text-gray-300">Instant service request alerts.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center px-6 py-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full mx-auto"
          >
            <div className="mb-8">
              <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
                <ChevronLeft size={16} />
                Back to customer site
              </button>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-extrabold mb-2">Staff Login</h2>
              <p className="text-gray-400">Sign in to access the dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@vibedine.com"
                    className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 bg-gray-900 border border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
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

            <div className="mt-6 p-4 bg-gray-900 border border-gray-800 rounded-2xl">
              <p className="text-gray-400 text-xs text-center">
                <strong className="text-orange-500">Demo Credentials:</strong><br />
                Admin: admin@vibedine.com / admin123<br />
                Manager: manager@vibedine.com / manager123<br />
                Kitchen: kitchen@vibedine.com / kitchen123
              </p>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-sm text-gray-500 hover:text-white"
              >
                ← Customer Login
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

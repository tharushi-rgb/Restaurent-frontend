import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Mail, Lock, Eye, EyeOff, Shield, Sparkles, Activity } from 'lucide-react';
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
        // Kitchen staff goes directly to kitchen display
        const loggedUser = useAuthStore.getState().user;
        if (loggedUser?.role === 'kitchen_staff') {
          navigate('/kitchen');
        } else {
          navigate('/admin');
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
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="min-h-screen grid lg:grid-cols-2">
        {/* Left Panel - Info */}
        <div className="hidden lg:flex flex-col justify-center px-16 py-12 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-20 right-20 w-64 h-64 bg-orange-600/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-48 h-48 bg-orange-600/5 rounded-full blur-3xl" />
          
          <div className="max-w-md relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/20">
                <Sparkles size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold">VibeDine</h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Staff Portal</p>
              </div>
            </div>
            
            <h1 className="text-4xl font-extrabold mb-4 leading-tight">
              Manage your<br />restaurant with<br />
              <span className="text-orange-500">confidence</span>
            </h1>
            <p className="text-gray-400 text-base mb-10 leading-relaxed">Powerful tools for managers and kitchen staff to handle orders, menus, and analytics in real-time.</p>

            <div className="space-y-3">
              {[
                { icon: Activity, text: 'Real-time kitchen updates and order tracking' },
                { icon: Shield, text: 'Role-based access for staff security' },
                { icon: Mail, text: 'Instant service request notifications' },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-3 p-3.5 bg-gray-900/70 border border-gray-800/50 rounded-xl"
                >
                  <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon size={14} className="text-orange-500" />
                  </div>
                  <p className="text-sm text-gray-300">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex flex-col justify-center px-6 py-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full mx-auto"
          >
            <div className="mb-6">
              <button onClick={() => navigate('/')} className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors">
                <ChevronLeft size={14} />
                Back to customer site
              </button>
            </div>

            {/* Mobile logo (visible on small screens) */}
            <div className="lg:hidden flex items-center gap-2.5 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold">VibeDine</h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Staff Portal</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-extrabold mb-1.5">Staff Login</h2>
              <p className="text-gray-500 text-sm">Sign in to access the dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@vibedine.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-900 border border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-12 py-3.5 bg-gray-900 border border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3.5 rounded-2xl font-bold text-base shadow-lg shadow-orange-600/20 disabled:opacity-50 flex items-center justify-center gap-2 hover:from-orange-600 hover:to-orange-700 transition-all"
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

            <div className="mt-6 p-4 bg-gray-900/80 border border-gray-800/50 rounded-2xl">
              <p className="text-gray-500 text-[10px] text-center leading-relaxed">
                <strong className="text-orange-500 text-xs">Demo Credentials</strong><br /><br />
                <span className="text-gray-400">Admin:</span> admin@vibedine.com / admin123<br />
                <span className="text-gray-400">Manager:</span> manager@vibedine.com / manager123<br />
                <span className="text-gray-400">Kitchen:</span> kitchen@vibedine.com / kitchen123
              </p>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-xs text-gray-600 hover:text-white transition-colors"
              >
                Customer Login
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

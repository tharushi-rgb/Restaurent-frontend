/**
 * CustomerLayout — shared header, sidebar, and page scaffold for all customer pages.
 * Every customer page imports PageHeader and optionally Sidebar from this file.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu as MenuIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  UtensilsCrossed,
  Heart,
  Clock,
  ShoppingCart,
  Star,
  User,
  LogOut,
} from 'lucide-react';
import { useAuthStore, useCartStore } from '../store';
import toast from 'react-hot-toast';

/* ─── Sidebar ──────────────────────────────────────────────────────────────── */

const navItems = [
  {
    icon: UtensilsCrossed,
    label: 'Browse Menu',
    desc: 'Explore all dishes',
    path: '/menu',
    color: 'from-orange-400 to-orange-600',
  },
  {
    icon: Sparkles,
    label: 'AI Picks',
    desc: 'Smart recommendations',
    path: '/recommendations',
    color: 'from-pink-400 to-pink-600',
    authRequired: true,
  },
  {
    icon: Heart,
    label: 'Health Profile',
    desc: 'Your goals & allergies',
    path: '/health-profile',
    color: 'from-emerald-400 to-emerald-600',
  },
  {
    icon: Clock,
    label: 'Track Order',
    desc: 'Real-time order status',
    path: '/order-status',
    color: 'from-blue-400 to-blue-600',
  },
  {
    icon: ShoppingCart,
    label: 'Cart',
    desc: 'View your cart',
    path: '/cart',
    color: 'from-amber-400 to-amber-600',
  },
  {
    icon: Star,
    label: 'Feedback',
    desc: 'Rate your experience',
    path: '/feedback',
    color: 'from-purple-400 to-purple-600',
  },
  {
    icon: User,
    label: 'My Profile',
    desc: 'Account & health info',
    path: '/profile',
    color: 'from-slate-400 to-slate-600',
    authRequired: true,
  },
];

export function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
    toast.success('Signed out');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 z-40"
          />

          {/* panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute top-0 left-0 h-full w-72 bg-slate-900 z-50 flex flex-col shadow-2xl"
          >
            {/* header */}
            <div className="bg-gradient-to-br from-orange-600 to-orange-700 px-5 pt-10 pb-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <span className="text-white font-bold text-lg">VibeDine</span>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>

              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user?.name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{user?.name}</p>
                    <p className="text-white/60 text-xs capitalize">
                      {user?.role || 'Customer'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleNav('/login')}
                    className="flex-1 py-2 bg-white/20 rounded-xl text-white text-xs font-semibold"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleNav('/register')}
                    className="flex-1 py-2 bg-white rounded-xl text-orange-600 text-xs font-bold"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>

            {/* nav items */}
            <div className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
              {navItems.filter(item => !item.authRequired || isAuthenticated).map(({ icon: Icon, label, desc, path, color }) => (
                <button
                  key={path}
                  onClick={() => handleNav(path)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors text-left group"
                >
                  <div
                    className={`w-9 h-9 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    <Icon size={17} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold">{label}</p>
                    <p className="text-white/50 text-xs">{desc}</p>
                  </div>
                  <ChevronRight size={14} className="text-white/30 group-hover:text-white/60 flex-shrink-0" />
                </button>
              ))}
            </div>

            {/* footer */}
            <div className="px-3 pb-8 border-t border-white/10 pt-3 space-y-0.5">
              <button
                onClick={() => handleNav('/admin/login')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-left"
              >
                <div className="w-9 h-9 bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-slate-400" />
                </div>
                <p className="text-slate-400 text-sm">Staff Portal</p>
              </button>

              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition-colors text-left"
                >
                  <div className="w-9 h-9 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <LogOut size={16} className="text-red-400" />
                  </div>
                  <p className="text-red-400 text-sm">Sign Out</p>
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── PageHeader ───────────────────────────────────────────────────────────── */

/**
 * Uniform top bar for every customer page.
 *
 * Props:
 *   title        — page title shown in the centre
 *   onBack       — if provided, shows a back chevron on the left instead of hamburger
 *   showCart     — show cart icon on the right (default false)
 *   rightSlot    — arbitrary ReactNode rendered on the right side
 *   gradient     — tailwind gradient classes (default orange)
 */
export function PageHeader({
  title,
  onBack,
  showCart = false,
  rightSlot,
  gradient = 'from-orange-600 via-orange-500 to-amber-500',
}) {
  const navigate = useNavigate();
  const { items } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="relative z-10 flex-shrink-0">
        <div className={`bg-gradient-to-br ${gradient} px-5 pt-8 pb-5`}>
          <div className="flex items-center justify-between">
            {/* Left: hamburger OR back */}
            {onBack ? (
              <button
                onClick={onBack}
                className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center active:scale-90 transition-transform"
              >
                <ChevronLeft size={20} className="text-white" />
              </button>
            ) : (
              <button
                onClick={() => setSidebarOpen(true)}
                className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center active:scale-90 transition-transform"
              >
                <MenuIcon size={18} className="text-white" />
              </button>
            )}

            {/* Centre: title */}
            <h1 className="text-base font-bold text-white">{title}</h1>

            {/* Right: profile + cart and/or custom slot */}
            <div className="flex items-center gap-1.5">
              {isAuthenticated && (
                <button
                  onClick={() => navigate('/profile')}
                  className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                >
                  <User size={18} className="text-white" />
                </button>
              )}
              {rightSlot && rightSlot}
              {showCart ? (
                <button
                  onClick={() => navigate('/cart')}
                  className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center relative active:scale-90 transition-transform"
                >
                  <ShoppingCart size={18} className="text-white" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-white text-orange-600 text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full">
                      {cartCount}
                    </span>
                  )}
                </button>
              ) : !rightSlot ? (
                <div className="w-9 h-9" />
              ) : null}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

/* ─── PageHeaderWithHamburger ─────────────────────────────────────────────── */
/**
 * Variant that always shows the hamburger AND optionally a back button together.
 * Used on pages where you want both sidebar access and back navigation.
 */
export function PageHeaderDual({
  title,
  onBack,
  showCart = false,
  gradient = 'from-orange-600 via-orange-500 to-amber-500',
}) {
  const navigate = useNavigate();
  const { items } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="relative z-10 flex-shrink-0">
        <div className={`bg-gradient-to-br ${gradient} px-5 pt-8 pb-5`}>
          <div className="flex items-center gap-2">
            {/* hamburger always present */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
            >
              <MenuIcon size={18} className="text-white" />
            </button>

            {/* back if provided */}
            {onBack && (
              <button
                onClick={onBack}
                className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
              >
                <ChevronLeft size={20} className="text-white" />
              </button>
            )}

            <h1 className="flex-1 text-base font-bold text-white">{title}</h1>

            {/* Right side: profile + cart */}
            <div className="flex items-center gap-1.5">
              {isAuthenticated && (
                <button
                  onClick={() => navigate('/profile')}
                  className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
                >
                  <User size={18} className="text-white" />
                </button>
              )}

              {showCart && (
                <button
                  onClick={() => navigate('/cart')}
                  className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center relative active:scale-90 transition-transform flex-shrink-0"
                >
                  <ShoppingCart size={18} className="text-white" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-white text-orange-600 text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, UtensilsCrossed, ShoppingCart, Users,
  BarChart3, MessageSquare, ChefHat, LogOut, Menu, X,
  Bell, ChevronRight, Sparkles, TableProperties
} from 'lucide-react';
import { useAuthStore } from '../../store';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'manager'] },
  { path: '/admin/orders', icon: ShoppingCart, label: 'Orders', roles: ['admin', 'manager', 'kitchen_staff'] },
  { path: '/admin/menu', icon: UtensilsCrossed, label: 'Menu', roles: ['admin', 'manager'] },
  { path: '/kitchen', icon: ChefHat, label: 'Kitchen Display', roles: ['admin', 'manager', 'kitchen_staff'], fullscreen: true },
  { path: '/admin/staff', icon: Users, label: 'Staff', roles: ['admin', 'manager'] },
  { path: '/admin/tables', icon: TableProperties, label: 'Tables', roles: ['admin', 'manager'] },
  { path: '/admin/analytics', icon: BarChart3, label: 'Analytics', roles: ['admin', 'manager'] },
  { path: '/admin/feedback', icon: MessageSquare, label: 'Feedback', roles: ['admin', 'manager'] },
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredNav = navItems.filter(item => item.roles.includes(user?.role));

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavClick = (item) => {
    if (item.fullscreen) {
      navigate(item.path);
    } else {
      navigate(item.path);
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="h-screen bg-dark-50 flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col bg-dark-900 text-white transition-all duration-300 h-screen flex-shrink-0 ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}>
        {/* Logo */}
        <div className="p-4 border-b border-dark-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-glow">
              <Sparkles size={20} className="text-white" />
            </div>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="overflow-hidden"
              >
                <h1 className="text-lg font-extrabold tracking-tight">VibeDine</h1>
                <p className="text-[10px] text-dark-400 uppercase tracking-widest">Staff Portal</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-primary-500/15 text-primary-400'
                    : 'text-dark-400 hover:text-white hover:bg-dark-800/60'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full"
                  />
                )}
                <item.icon size={20} className={isActive ? 'text-primary-400' : 'text-dark-400 group-hover:text-white'} />
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
                {!sidebarCollapsed && item.fullscreen && (
                  <ChevronRight size={14} className="ml-auto text-dark-600" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-dark-700/50">
          <div className={`flex items-center gap-3 px-3 py-2 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">{user?.name?.[0]?.toUpperCase() || 'S'}</span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-dark-400 uppercase">{user?.role?.replace('_', ' ')}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors mt-1 ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut size={18} />
            {!sidebarCollapsed && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-3 border-t border-dark-700/50 text-dark-500 hover:text-white transition-colors flex items-center justify-center"
        >
          <Menu size={18} />
        </button>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-dark-900 text-white px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 hover:bg-dark-800 rounded-lg">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold">VibeDine</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-1 bg-primary-500/20 text-primary-400 rounded-full font-medium uppercase">
            {user?.role?.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-dark-900 text-white z-50 flex flex-col"
            >
              <div className="p-4 flex items-center justify-between border-b border-dark-700/50">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                    <Sparkles size={18} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-extrabold">VibeDine</h1>
                    <p className="text-[10px] text-dark-400 uppercase tracking-widest">Staff Portal</p>
                  </div>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-dark-800 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {filteredNav.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavClick(item)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                        isActive ? 'bg-primary-500/15 text-primary-400' : 'text-dark-400 hover:text-white hover:bg-dark-800'
                      }`}
                    >
                      <item.icon size={20} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
              <div className="p-3 border-t border-dark-700/50">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{user?.name?.[0]?.toUpperCase() || 'S'}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{user?.name}</p>
                    <p className="text-[10px] text-dark-400 uppercase">{user?.role?.replace('_', ' ')}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={18} />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:pt-0 pt-14 h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}

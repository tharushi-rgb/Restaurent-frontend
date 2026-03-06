import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Clock, Flame, AlertTriangle, Sparkles, X, Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore, useAuthStore, useMenuStore } from '../../store';
import api from '../../api';
import { PageHeader } from '../../components/CustomerLayout';

export default function MenuPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { items: menuItems, categories, fetchMenu, fetchCategories } = useMenuStore();
  const { items: cartItems, addItem } = useCartStore();
  const { isAuthenticated, user, logout } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const userAllergies = user?.healthProfile?.allergies || [];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchMenu(), fetchCategories()]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const hasAllergenConflict = (item) => {
    if (!userAllergies.length) return false;
    return item.allergens?.some(a => userAllergies.includes(a));
  };

  const getConflictingAllergens = (item) => {
    if (!userAllergies.length) return [];
    return item.allergens?.filter(a => userAllergies.includes(a)) || [];
  };

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + (i.totalPrice || i.price * i.quantity), 0);

  const handleAddToCart = (item) => {
    if (hasAllergenConflict(item)) {
      const conflicts = getConflictingAllergens(item);
      toast.error(`Contains your allergens: ${conflicts.join(', ')}`);
      return;
    }
    addItem({ ...item, dishId: item._id || item.id, quantity: 1, totalPrice: item.price });
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div className="h-full bg-white flex flex-col relative">

      {/* Shared header with hamburger sidebar */}
      <PageHeader
        title="Our Menu"
        showCart
        rightSlot={
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"
          >
            {showSearch ? <X size={18} className="text-white" /> : <Search size={18} className="text-white" />}
          </button>
        }
      />

      {/* Search bar (expandable) */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-5 pt-2 pb-3 bg-white"
          >
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dishes..." autoFocus
                className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories */}
      <div className="px-5 pt-3 mb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {categories.map(cat => (
            <button
              key={cat} onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Allergen Notice */}
      {isAuthenticated && userAllergies.length > 0 && (
        <div className="mx-5 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-700">Monitoring: <strong>{userAllergies.join(', ')}</strong></p>
        </div>
      )}

      {/* AI Banner */}
      {isAuthenticated && (
        <motion.button
          onClick={() => navigate('/recommendations')}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="mx-5 mb-4 p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center gap-3 shadow-md active:scale-[0.98] transition-transform"
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-white text-sm font-bold">AI Recommendations</p>
            <p className="text-white/70 text-xs">Personalized picks based on your health profile</p>
          </div>
          <ChevronLeft size={16} className="text-white/60 rotate-180" />
        </motion.button>
      )}

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-gray-100 rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-400 font-medium">No dishes found</p>
            <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} className="mt-3 text-sm text-primary-500 font-medium">Clear filters</button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item, idx) => {
              const conflict = hasAllergenConflict(item);
              const conflictAllergens = getConflictingAllergens(item);

              return (
                <motion.div
                  key={item._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                  className={`bg-white rounded-2xl border overflow-hidden shadow-card active:scale-[0.99] transition-transform ${
                    conflict ? 'border-red-200' : 'border-gray-100'
                  } ${!item.isAvailable ? 'opacity-50' : ''}`}
                  onClick={() => navigate(`/menu/${item._id}`)}
                >
                  <div className="flex gap-3 p-3">
                    {/* Image */}
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      {item.isPopular && (
                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-primary-500 rounded-md flex items-center gap-0.5">
                          <Flame size={10} className="text-white" />
                          <span className="text-[9px] font-bold text-white">HOT</span>
                        </div>
                      )}
                      {!item.isAvailable && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold bg-red-500 px-2 py-0.5 rounded">SOLD OUT</span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm truncate">{item.name}</h3>
                        <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{item.description}</p>
                      </div>

                      {/* Allergen warning */}
                      {conflict && (
                        <div className="flex items-center gap-1 mt-1">
                          <AlertTriangle size={12} className="text-red-500" />
                          <span className="text-[10px] text-red-500 font-semibold">{conflictAllergens.join(', ')}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-extrabold text-primary-600">${item.price?.toFixed(2)}</span>
                          <div className="flex items-center gap-1 text-gray-400">
                            <Clock size={11} />
                            <span className="text-[10px]">{item.preparationTime}min</span>
                          </div>
                        </div>

                        {item.isAvailable && !conflict && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }}
                            className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center shadow-sm shadow-primary-200 active:scale-90 transition-transform"
                          >
                            <Plus size={16} className="text-white" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick nutrition */}
                  {item.nutritionPerServing && (
                    <div className="px-3 pb-2.5 flex gap-2">
                      <span className="text-[10px] px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full font-medium">{item.nutritionPerServing.calories} cal</span>
                      <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">{item.nutritionPerServing.protein}g protein</span>
                      {item.nutritionPerServing.fiber > 3 && (
                        <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-medium">{item.nutritionPerServing.fiber}g fiber</span>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart FAB */}
      {cartCount > 0 && (
        <motion.div
          initial={{ y: 100 }} animate={{ y: 0 }}
          className="flex-shrink-0 px-5 pb-5 pt-2 bg-white"
        >
          <button
            onClick={() => navigate('/cart')}
            className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-300/40 flex items-center justify-between px-5 active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart size={22} />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-primary-600 rounded-full text-[10px] font-black flex items-center justify-center">
                  {cartCount}
                </span>
              </div>
              <span>View Cart</span>
            </div>
            <span className="text-lg font-extrabold">${cartTotal.toFixed(2)}</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}

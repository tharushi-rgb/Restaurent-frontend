import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ShoppingCart, User, Heart, AlertCircle, Sparkles } from 'lucide-react';
import { useMenuStore, useCartStore, useAuthStore } from '../../store';
import api from '../../api';

// Header Component
const Header = ({ title, onBack, cartCount, onCart, onProfile }) => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between max-w-md mx-auto">
    <div className="flex items-center gap-2">
      {onBack && (
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
      )}
      <h1 className="text-xl font-bold tracking-tight text-gray-900">{title}</h1>
    </div>
    <div className="flex items-center gap-2">
      {onProfile && (
        <button onClick={onProfile} className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
          <User size={22} className="text-gray-600" />
        </button>
      )}
      {onCart && (
        <button onClick={onCart} className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
          <ShoppingCart size={22} className="text-gray-600" />
          {cartCount > 0 && (
            <span className="absolute top-1 right-1 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
              {cartCount}
            </span>
          )}
        </button>
      )}
    </div>
  </header>
);

// Menu Card Component
const MenuCard = ({ dish, onClick, userAllergens = [] }) => {
  const conflictingAllergens = dish.allergens?.filter(a => userAllergens.includes(a)) || [];
  const hasConflict = conflictingAllergens.length > 0;
  
  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm mb-4 relative"
    >
      <div className="aspect-[4/3] relative">
        <img 
          src={dish.image} 
          alt={dish.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold shadow-sm">
          ${dish.price?.toFixed(2)}
        </div>
        {hasConflict && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-lg animate-pulse">
            <AlertCircle size={12} />
            CONTAINS {conflictingAllergens[0]?.toUpperCase()}
          </div>
        )}
        {!dish.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 leading-tight">{dish.name}</h3>
          <div className="flex items-center gap-1 text-gray-400 text-xs font-medium bg-gray-50 px-2 py-1 rounded-md">
            <User size={12} />
            x{dish.serves}
          </div>
        </div>
        <p className="text-gray-500 text-sm line-clamp-2 mb-4">{dish.description}</p>
        
        <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
          <span className="flex items-center gap-1">
            <span className="text-orange-600">{dish.nutritionPerServing?.calories}</span> cal
          </span>
          <span className="flex items-center gap-1">
            <span className="text-blue-600">{dish.nutritionPerServing?.protein}g</span> protein
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
          <span className="text-gray-400 truncate">{dish.allergens?.join(', ')}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default function MenuPage() {
  const navigate = useNavigate();
  const { items, categories, selectedCategory, setSelectedCategory, isLoading, setItems, setCategories, setLoading } = useMenuStore();
  const { getItemCount } = useCartStore();
  const { user } = useAuthStore();
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    setLocalLoading(true);
    try {
      const [menuRes, catRes] = await Promise.all([
        api.get('/menu'),
        api.get('/menu/categories')
      ]);
      setItems(menuRes.data.items);
      setCategories(catRes.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
      // Use default data if API fails
      setItems([]);
    } finally {
      setLocalLoading(false);
    }
  };

  const filteredItems = selectedCategory === 'All' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  const userAllergens = user?.healthProfile?.allergies || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="VibeDine Menu"
        onBack={() => navigate('/')}
        onCart={() => navigate('/cart')}
        cartCount={getItemCount()}
        onProfile={() => navigate('/health-profile')}
      />

      <div className="pt-20 px-4 pb-24">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-6 py-2.5 rounded-full text-sm font-bold border transition-all ${
                selectedCategory === cat
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-orange-600 hover:text-white hover:border-orange-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Health Profile Notice */}
        {user?.healthProfile?.isCreated && (
          <div className="mb-4 p-4 bg-green-50 border border-green-100 rounded-3xl flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
              <Heart size={20} />
            </div>
            <div>
              <p className="text-green-800 font-bold text-sm">Personalized for you</p>
              <p className="text-green-600 text-xs">Menu is filtered for your health profile.</p>
            </div>
          </div>
        )}

        {/* AI Recommendations Banner */}
        {user && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate('/recommendations')}
            className="w-full mb-6 p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl flex items-center gap-3 text-white text-left shadow-lg shadow-orange-200"
          >
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">AI Picks For You</p>
              <p className="text-orange-100 text-xs">Personalized dishes based on your profile & taste</p>
            </div>
            <ChevronLeft size={18} className="rotate-180 text-white/60" />
          </motion.button>
        )}

        {/* Menu Items */}
        {localLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400">No items found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredItems.map(dish => (
              <MenuCard 
                key={dish._id || dish.id}
                dish={dish}
                userAllergens={userAllergens}
                onClick={() => navigate(`/menu/${dish._id || dish.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

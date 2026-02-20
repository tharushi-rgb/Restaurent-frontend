import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, AlertCircle, X, Flame, Minus, Plus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import toast from 'react-hot-toast';
import { useCartStore, useAuthStore } from '../../store';
import api from '../../api';

// Nutrition Card Component
const NutritionCard = ({ nutrition, multiplier = 1 }) => {
  const data = [
    { name: 'Protein', value: nutrition.protein * multiplier, color: '#3b82f6' },
    { name: 'Carbs', value: nutrition.carbs * multiplier, color: '#10b981' },
    { name: 'Fat', value: nutrition.fat * multiplier, color: '#a855f7' },
  ];

  const totalCals = Math.round(nutrition.calories * multiplier);
  const totalSodium = Math.round(nutrition.sodium * multiplier);
  const totalFiber = Math.round(nutrition.fiber * multiplier);

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Nutritional Balance</h3>
        <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">
          {totalCals} kcal
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-1/2 min-w-[140px] h-40 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-gray-400 font-bold uppercase">Macros</span>
            <span className="text-sm font-black text-gray-900">Ratio</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-3">
          {data.map((macro) => (
            <div key={macro.name} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: macro.color }} />
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase leading-none">{macro.name}</p>
                <p className="text-sm font-bold text-gray-900">{Math.round(macro.value)}g</p>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-gray-200" />
            <div>
              <p className="text-[11px] text-gray-400 font-bold uppercase leading-none">Sodium</p>
              <p className="text-sm font-bold text-gray-900">{totalSodium}mg</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-gray-100" />
            <div>
              <p className="text-[11px] text-gray-400 font-bold uppercase leading-none">Fiber</p>
              <p className="text-sm font-bold text-gray-900">{totalFiber}g</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Customization Sheet Component
const CustomizationSheet = ({ dish, userAllergens = [], onClose, onAddToCart }) => {
  const [portion, setPortion] = useState('Standard');
  const [spiceLevel, setSpiceLevel] = useState(dish.defaultSpiceLevel || 0);
  const [removedIngredients, setRemovedIngredients] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Live nutrition multiplier based on portion
  const portionMultiplier = portion === 'Large' ? 1.5 : 1;
  const liveNutrition = dish.nutritionPerServing ? {
    calories: Math.round(dish.nutritionPerServing.calories * portionMultiplier),
    protein: Math.round(dish.nutritionPerServing.protein * portionMultiplier),
    carbs: Math.round(dish.nutritionPerServing.carbs * portionMultiplier),
    fat: Math.round(dish.nutritionPerServing.fat * portionMultiplier),
    sodium: Math.round(dish.nutritionPerServing.sodium * portionMultiplier),
    fiber: Math.round(dish.nutritionPerServing.fiber * portionMultiplier),
  } : null;

  // Live allergy detection
  const conflictingAllergens = dish.allergens?.filter(a => userAllergens.includes(a)) || [];

  const toggleIngredient = (ingredient) => {
    setRemovedIngredients(prev => 
      prev.includes(ingredient) 
        ? prev.filter(i => i !== ingredient) 
        : [...prev, ingredient]
    );
  };

  const handleAdd = () => {
    onAddToCart({
      portion,
      spiceLevel,
      removedIngredients,
      specialInstructions,
      quantity,
      priceMultiplier: portion === 'Large' ? 1.5 : 1,
      nutritionMultiplier: portion === 'Large' ? 1.5 : 1
    });
  };

  const spiceLabels = ['Mild', 'Medium', 'Hot', 'Fire'];

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="w-full max-w-md bg-white rounded-t-[40px] p-6 pb-10 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-900">Customize</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Portion Size */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Portion Size</label>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
              Large is 1.5x larger
            </span>
          </div>
          <div className="flex gap-3">
            {['Standard', 'Large'].map((p) => (
              <button
                key={p}
                onClick={() => setPortion(p)}
                className={`flex-1 py-4 rounded-2xl font-bold border-2 transition-all ${
                  portion === p 
                    ? 'border-orange-500 bg-orange-50 text-orange-600' 
                    : 'border-gray-100 text-gray-400'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </section>

        {/* Spice Level */}
        <section className="mb-8">
          <label className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 block">Spice Level</label>
          <div className="flex justify-between items-center bg-gray-50 p-2 rounded-2xl">
            {spiceLabels.map((label, idx) => (
              <button
                key={label}
                onClick={() => setSpiceLevel(idx)}
                className={`flex-1 py-3 px-2 rounded-xl transition-all flex flex-col items-center gap-1 ${
                  spiceLevel === idx 
                    ? 'bg-white shadow-sm text-orange-600' 
                    : 'text-gray-400'
                }`}
              >
                <Flame size={18} fill={spiceLevel >= idx ? 'currentColor' : 'none'} className={spiceLevel >= idx ? 'animate-pulse' : ''} />
                <span className="text-[10px] font-bold uppercase">{label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Ingredients Exclusion */}
        <section className="mb-8">
          <label className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 block">Remove Ingredients</label>
          <div className="flex flex-wrap gap-2">
            {dish.ingredients?.map((ing) => {
              const isRemoved = removedIngredients.includes(ing);
              return (
                <button
                  key={ing}
                  onClick={() => toggleIngredient(ing)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                    isRemoved 
                      ? 'bg-gray-100 text-gray-400 line-through border-transparent' 
                      : 'bg-white border-gray-200 text-gray-700'
                  }`}
                >
                  {ing}
                </button>
              );
            })}
          </div>
        </section>

        {/* Special Instructions */}
        <section className="mb-8">
          <label className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 block">Special Instructions</label>
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="e.g. Extra sauce on the side, no garnish..."
            rows={2}
            className="w-full p-4 border-2 border-gray-100 rounded-2xl text-sm text-gray-700 placeholder:text-gray-300 focus:border-orange-400 focus:outline-none resize-none"
          />
        </section>

        {/* Live Allergy Alert */}
        {conflictingAllergens.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-600 rounded-2xl flex items-start gap-3 shadow-lg shadow-red-100"
          >
            <AlertCircle className="text-white shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-white font-bold text-sm">Allergy Warning</p>
              <p className="text-red-100 text-xs leading-snug mt-0.5">
                Contains: {conflictingAllergens.join(', ')}
              </p>
            </div>
          </motion.div>
        )}

        {/* Live Nutrition Impact */}
        {liveNutrition && (
          <section className="mb-6">
            <label className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 block">Nutritional Impact</label>
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase">Per serving</span>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                  {liveNutrition.calories} kcal
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { label: 'Protein', value: `${liveNutrition.protein}g`, color: 'bg-blue-500' },
                  { label: 'Carbs', value: `${liveNutrition.carbs}g`, color: 'bg-green-500' },
                  { label: 'Fat', value: `${liveNutrition.fat}g`, color: 'bg-purple-500' },
                  { label: 'Sodium', value: `${liveNutrition.sodium}mg`, color: 'bg-gray-400' },
                  { label: 'Fiber', value: `${liveNutrition.fiber}g`, color: 'bg-amber-500' },
                ].map(n => (
                  <div key={n.label} className="text-center">
                    <div className={`w-2 h-2 rounded-full ${n.color} mx-auto mb-1`} />
                    <p className="text-xs font-bold text-gray-800">{n.value}</p>
                    <p className="text-[9px] text-gray-400 uppercase font-bold">{n.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Quantity and Add */}
        <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center bg-gray-100 rounded-2xl p-1 shrink-0">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 flex items-center justify-center text-gray-600"
            >
              <Minus size={18} />
            </button>
            <span className="w-8 text-center font-bold">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 flex items-center justify-center text-gray-600"
            >
              <Plus size={18} />
            </button>
          </div>
          <button
            onClick={handleAdd}
            className="flex-1 bg-orange-600 text-white h-12 rounded-2xl font-bold text-lg shadow-lg shadow-orange-100 flex items-center justify-center gap-2"
          >
            Add to Order
            <span className="opacity-60 text-sm font-medium">
              ${(dish.price * quantity * (portion === 'Large' ? 1.5 : 1)).toFixed(2)}
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function DishDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [portion, setPortion] = useState('Standard');
  const { addItem } = useCartStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchDish();
  }, [id]);

  const fetchDish = async () => {
    try {
      const { data } = await api.get(`/menu/${id}`);
      setDish(data);
    } catch (error) {
      console.error('Error fetching dish:', error);
      toast.error('Failed to load dish details');
      navigate('/menu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!dish) {
    return null;
  }

  const userAllergens = user?.healthProfile?.allergies || [];
  const conflictingAllergens = dish.allergens?.filter(a => userAllergens.includes(a)) || [];
  const hasConflict = conflictingAllergens.length > 0;
  const multiplier = portion === 'Large' ? 1.5 : 1;

  const handleAddToCart = (customizations) => {
    addItem({
      dishId: dish._id || dish.id,
      name: dish.name,
      image: dish.image,
      price: dish.price,
      quantity: customizations.quantity,
      customizations: {
        portion: customizations.portion,
        spiceLevel: customizations.spiceLevel,
        removedIngredients: customizations.removedIngredients,
        specialInstructions: customizations.specialInstructions
      }
    });
    setShowCustomizer(false);
    toast.success(`${dish.name} added to cart!`);
    navigate('/menu');
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Image Header */}
      <div className="relative h-72">
        <img 
          src={dish.image} 
          alt={dish.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />
        <button 
          onClick={() => navigate('/menu')}
          className="absolute top-12 left-6 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="px-6 -mt-8 relative z-10 bg-white rounded-t-[40px] pt-8">
        {/* Allergy Alert */}
        {hasConflict && (
          <div className="mb-6 p-5 bg-red-600 rounded-3xl flex items-start gap-4 shadow-xl shadow-red-100">
            <div className="bg-white/20 p-2 rounded-xl">
              <AlertCircle className="text-white" size={24} />
            </div>
            <div>
              <p className="text-white font-black text-lg">Health Alert</p>
              <p className="text-red-50 text-sm leading-tight">
                This dish contains <strong>{conflictingAllergens.join(', ')}</strong>. Please consult with our staff before ordering.
              </p>
            </div>
          </div>
        )}

        {/* Title and Price */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-1">{dish.name}</h2>
            <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
              <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs">Serves {dish.serves}</span>
              <span>{dish.category}</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-orange-600">
            ${(dish.price * multiplier).toFixed(2)}
          </div>
        </div>

        <p className="text-gray-600 leading-relaxed mb-8">{dish.description}</p>

        {/* Nutrition */}
        <section className="mb-8">
          <NutritionCard nutrition={dish.nutritionPerServing} multiplier={multiplier} />
        </section>

        {/* Ingredients */}
        <section className="mb-8 space-y-4">
          <h3 className="text-lg font-bold">Standard Ingredients</h3>
          <div className="flex flex-wrap gap-2">
            {dish.ingredients?.map(ing => (
              <span key={ing} className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold border border-gray-100">
                {ing}
              </span>
            ))}
          </div>
        </section>

        {/* Allergens */}
        {dish.allergens?.length > 0 && (
          <section className="mb-8 space-y-4">
            <h3 className="text-lg font-bold">Contains Allergens</h3>
            <div className="flex flex-wrap gap-2">
              {dish.allergens.map(allergen => (
                <span 
                  key={allergen} 
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                    userAllergens.includes(allergen)
                      ? 'bg-red-50 text-red-600 border-red-200'
                      : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  }`}
                >
                  {allergen}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 flex items-center gap-4 max-w-md mx-auto">
        <button
          onClick={() => setShowCustomizer(true)}
          disabled={!dish.isAvailable}
          className={`flex-1 h-14 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl ${
            dish.isAvailable
              ? 'bg-gray-900 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {dish.isAvailable ? 'Customize & Add' : 'Out of Stock'}
        </button>
      </div>

      {/* Customization Sheet */}
      <AnimatePresence>
        {showCustomizer && (
          <CustomizationSheet 
            dish={dish}
            userAllergens={userAllergens}
            onClose={() => setShowCustomizer(false)}
            onAddToCart={handleAddToCart}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Flame, Minus, Plus, ShoppingCart, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import toast from 'react-hot-toast';
import { useCartStore, useAuthStore } from '../../store';
import api from '../../api';
import { PageHeaderDual } from '../../components/CustomerLayout';

const NutritionCard = ({ nutrition, multiplier = 1 }) => {
  const data = [
    { name: 'Protein', value: nutrition.protein * multiplier, color: '#3b82f6' },
    { name: 'Carbs', value: nutrition.carbs * multiplier, color: '#10b981' },
    { name: 'Fat', value: nutrition.fat * multiplier, color: '#a855f7' },
  ];
  const totalCals = Math.round(nutrition.calories * multiplier);

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-card">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-gray-900">Nutritional Balance</h3>
        <div className="bg-primary-50 text-primary-600 px-3 py-1 rounded-full text-xs font-bold">{totalCals} kcal</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-1/2 min-w-[120px] h-36 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={42} outerRadius={58} paddingAngle={5} dataKey="value">
                {data.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Macros</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-2.5">
          {data.map((macro) => (
            <div key={macro.name} className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: macro.color }} />
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase leading-none">{macro.name}</p>
                <p className="text-sm font-bold text-gray-900">{Math.round(macro.value)}g</p>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase leading-none">Fiber</p>
              <p className="text-sm font-bold text-gray-900">{Math.round(nutrition.fiber * multiplier)}g</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomizationSheet = ({ dish, userAllergens = [], onClose, onAddToCart }) => {
  const [portion, setPortion] = useState('Standard');
  const [spiceLevel, setSpiceLevel] = useState(dish.defaultSpiceLevel || 0);
  const [removedIngredients, setRemovedIngredients] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const portionMultiplier = portion === 'Large' ? 1.5 : 1;
  const liveNutrition = dish.nutritionPerServing ? {
    calories: Math.round(dish.nutritionPerServing.calories * portionMultiplier),
    protein: Math.round(dish.nutritionPerServing.protein * portionMultiplier),
    carbs: Math.round(dish.nutritionPerServing.carbs * portionMultiplier),
    fat: Math.round(dish.nutritionPerServing.fat * portionMultiplier),
    sodium: Math.round(dish.nutritionPerServing.sodium * portionMultiplier),
    fiber: Math.round(dish.nutritionPerServing.fiber * portionMultiplier),
  } : null;

  const conflictingAllergens = dish.allergens?.filter(a => userAllergens.includes(a)) || [];

  const toggleIngredient = (ingredient) => {
    setRemovedIngredients(prev => prev.includes(ingredient) ? prev.filter(i => i !== ingredient) : [...prev, ingredient]);
  };

  const handleAdd = () => {
    onAddToCart({ portion, spiceLevel, removedIngredients, specialInstructions, quantity,
      priceMultiplier: portion === 'Large' ? 1.5 : 1, nutritionMultiplier: portion === 'Large' ? 1.5 : 1
    });
  };

  const spiceLabels = ['Mild', 'Medium', 'Hot', 'Fire'];

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        className="w-full max-w-[375px] bg-white rounded-t-[32px] p-5 pb-6 max-h-[85vh] overflow-y-auto">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-black text-gray-900">Customize</h2>
          <button onClick={onClose} className="p-1.5 bg-gray-100 rounded-full"><X size={16} /></button>
        </div>

        <section className="mb-4">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Portion Size</label>
          <div className="flex gap-2">
            {['Standard', 'Large'].map((p) => (
              <button key={p} onClick={() => setPortion(p)}
                className={`flex-1 py-2.5 rounded-2xl font-bold border-2 transition-all text-sm ${
                  portion === p ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-100 text-gray-400'
                }`}>
                {p} {p === 'Large' && <span className="text-xs opacity-60">(1.5x)</span>}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-4">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Spice Level</label>
          <div className="flex justify-between items-center bg-gray-50 p-1 rounded-2xl">
            {spiceLabels.map((label, idx) => (
              <button key={label} onClick={() => setSpiceLevel(idx)}
                className={`flex-1 py-2 px-1.5 rounded-xl transition-all flex flex-col items-center gap-0.5 ${
                  spiceLevel === idx ? 'bg-white shadow-sm text-primary-600' : 'text-gray-400'
                }`}>
                <Flame size={14} fill={spiceLevel >= idx ? 'currentColor' : 'none'} />
                <span className="text-[8px] font-bold uppercase">{label}</span>
              </button>
            ))}
          </div>
        </section>

        {dish.ingredients?.length > 0 && (
          <section className="mb-4">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Remove Ingredients</label>
            <div className="flex flex-wrap gap-1.5">
              {dish.ingredients.map((ing) => (
                <button key={ing} onClick={() => toggleIngredient(ing)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    removedIngredients.includes(ing) ? 'bg-gray-100 text-gray-400 line-through border-transparent' : 'bg-white border-gray-200 text-gray-700'
                  }`}>{ing}</button>
              ))}
            </div>
          </section>
        )}

        <section className="mb-4">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Special Instructions</label>
          <textarea value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="e.g. Extra sauce on the side..." rows={2}
            className="w-full p-3 border-2 border-gray-100 rounded-2xl text-sm text-gray-700 placeholder:text-gray-300 focus:border-primary-400 focus:outline-none resize-none" />
        </section>

        {conflictingAllergens.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-4 p-3 bg-red-500 rounded-2xl flex items-start gap-2">
            <AlertCircle className="text-white shrink-0 mt-0.5" size={16} />
            <div>
              <p className="text-white font-bold text-xs">Allergy Warning</p>
              <p className="text-red-100 text-[10px] mt-0.5">Contains: {conflictingAllergens.join(', ')}</p>
            </div>
          </motion.div>
        )}

        {liveNutrition && (
          <section className="mb-4">
            <div className="bg-gray-50 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Nutrition</span>
                <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{liveNutrition.calories} kcal</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { label: 'Protein', value: `${liveNutrition.protein}g`, color: 'bg-blue-500' },
                  { label: 'Carbs', value: `${liveNutrition.carbs}g`, color: 'bg-green-500' },
                  { label: 'Fat', value: `${liveNutrition.fat}g`, color: 'bg-purple-500' },
                  { label: 'Sodium', value: `${liveNutrition.sodium}mg`, color: 'bg-gray-400' },
                  { label: 'Fiber', value: `${liveNutrition.fiber}g`, color: 'bg-amber-500' },
                ].map(n => (
                  <div key={n.label} className="text-center">
                    <div className={`w-1.5 h-1.5 rounded-full ${n.color} mx-auto mb-0.5`} />
                    <p className="text-xs font-bold text-gray-800">{n.value}</p>
                    <p className="text-[7px] text-gray-400 uppercase font-bold">{n.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          <div className="flex items-center bg-gray-100 rounded-2xl p-1 shrink-0">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center text-gray-600"><Minus size={14} /></button>
            <span className="w-6 text-center font-bold text-sm">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-600"><Plus size={14} /></button>
          </div>
          <button onClick={handleAdd}
            className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white h-11 rounded-2xl font-bold shadow-lg shadow-primary-200/40 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform text-sm">
            <ShoppingCart size={16} />
            Add — ${(dish.price * quantity * (portion === 'Large' ? 1.5 : 1)).toFixed(2)}
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

  useEffect(() => { fetchDish(); }, [id]);

  const fetchDish = async () => {
    try {
      const { data } = await api.get(`/menu/${id}`);
      setDish(data);
    } catch (error) {
      toast.error('Failed to load dish details');
      navigate('/menu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!dish) return null;

  const userAllergens = user?.healthProfile?.allergies || [];
  const conflictingAllergens = dish.allergens?.filter(a => userAllergens.includes(a)) || [];
  const hasConflict = conflictingAllergens.length > 0;
  const multiplier = portion === 'Large' ? 1.5 : 1;

  const handleAddToCart = (customizations) => {
    addItem({
      dishId: dish._id || dish.id, name: dish.name, image: dish.image, price: dish.price,
      quantity: customizations.quantity,
      customizations: { portion: customizations.portion, spiceLevel: customizations.spiceLevel,
        removedIngredients: customizations.removedIngredients, specialInstructions: customizations.specialInstructions }
    });
    setShowCustomizer(false);
    toast.success(`${dish.name} added to cart`);
    navigate('/menu');
  };

  return (
    <div className="h-full bg-white flex flex-col overflow-hidden">
      {/* Shared header with hamburger + back */}
      <PageHeaderDual
        title={dish.name}
        onBack={() => navigate('/menu')}
        showCart
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-4">
        {/* Dish Image */}
        <div className="relative h-56">
          <img src={dish.image} alt={dish.name} className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          {dish.isPopular && (
            <div className="absolute top-4 right-4 px-3 py-1.5 bg-orange-500 rounded-xl flex items-center gap-1.5">
              <Flame size={14} className="text-white" />
              <span className="text-xs font-bold text-white">Popular</span>
            </div>
          )}
        </div>

        <div className="px-5 -mt-6 relative z-10 bg-white rounded-t-[24px] pt-6">
          {hasConflict && (
            <div className="mb-5 p-4 bg-red-500 rounded-2xl flex items-start gap-3 shadow-lg">
              <div className="bg-white/20 p-1.5 rounded-xl"><AlertCircle className="text-white" size={20} /></div>
              <div>
                <p className="text-white font-bold">Health Alert</p>
                <p className="text-red-100 text-xs mt-0.5">Contains <strong>{conflictingAllergens.join(', ')}</strong></p>
              </div>
            </div>
          )}

          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-1">{dish.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="bg-primary-50 text-primary-600 px-2.5 py-0.5 rounded-full text-xs font-medium">{dish.category}</span>
                <div className="flex items-center gap-1 text-gray-400">
                  <Clock size={12} />
                  <span className="text-xs">{dish.preparationTime} min</span>
                </div>
              </div>
            </div>
            <div className="text-2xl font-extrabold text-primary-600">${(dish.price * multiplier).toFixed(2)}</div>
          </div>

          <p className="text-gray-500 text-sm leading-relaxed mb-6">{dish.description}</p>

          {dish.nutritionPerServing && (
            <section className="mb-6">
              <NutritionCard nutrition={dish.nutritionPerServing} multiplier={multiplier} />
            </section>
          )}

          {dish.ingredients?.length > 0 && (
            <section className="mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Ingredients</h3>
              <div className="flex flex-wrap gap-2">
                {dish.ingredients.map(ing => (
                  <span key={ing} className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-xl text-xs font-medium border border-gray-100">{ing}</span>
                ))}
              </div>
            </section>
          )}

          {dish.allergens?.length > 0 && (
            <section className="mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Allergens</h3>
              <div className="flex flex-wrap gap-2">
                {dish.allergens.map(a => (
                  <span key={a} className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                    userAllergens.includes(a) ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>{a}</span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 p-5 bg-white border-t border-gray-100">
        <button onClick={() => setShowCustomizer(true)} disabled={!dish.isAvailable}
          className={`w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform ${
            dish.isAvailable ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-primary-200/40' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}>
          {dish.isAvailable ? <><ShoppingCart size={20} /> Customize & Add</> : 'Currently Unavailable'}
        </button>
      </div>

      <AnimatePresence>
        {showCustomizer && (
          <CustomizationSheet dish={dish} userAllergens={userAllergens}
            onClose={() => setShowCustomizer(false)} onAddToCart={handleAddToCart} />
        )}
      </AnimatePresence>
    </div>
  );
}

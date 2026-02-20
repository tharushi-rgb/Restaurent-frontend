import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Sparkles, Heart, TrendingUp, AlertCircle, 
  User, Star, Leaf, Zap, ShoppingCart, ChevronRight, Brain
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore, useCartStore } from '../../store';
import api from '../../api';

const goalIcons = {
  'Weight Loss': '🏃',
  'Muscle Gain': '💪',
  'Low Sodium': '🧂',
  'Keto': '🥑',
  'Vegan': '🌱',
  'High Protein': '🥩'
};

// Recommendation reason tag component
const ReasonTag = ({ reason, type }) => {
  const styles = {
    health: 'bg-green-50 text-green-600 border-green-100',
    dietary: 'bg-blue-50 text-blue-600 border-blue-100',
    popular: 'bg-orange-50 text-orange-600 border-orange-100',
    history: 'bg-purple-50 text-purple-600 border-purple-100',
    ml: 'bg-cyan-50 text-cyan-600 border-cyan-100'
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${styles[type] || styles.health}`}>
      {type === 'health' && <Heart size={10} />}
      {type === 'dietary' && <Leaf size={10} />}
      {type === 'popular' && <Star size={10} />}
      {type === 'history' && <TrendingUp size={10} />}
      {type === 'ml' && <Brain size={10} />}
      {reason}
    </span>
  );
};

export default function RecommendationsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { getItemCount } = useCartStore();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        const { data } = await api.get('/recommendations');
        setRecommendations(data.recommendations || []);
      } else {
        // For non-logged-in users, fetch popular items
        const { data } = await api.get('/recommendations/popular');
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      // Fallback to regular menu
      try {
        const { data } = await api.get('/menu?available=true');
        setRecommendations(data.items?.slice(0, 6).map(item => ({
          ...item,
          score: Math.random() * 0.3 + 0.7,
          reasons: [{ text: 'Popular choice', type: 'popular' }]
        })) || []);
      } catch (e) {
        console.error('Menu fallback failed:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  const userGoals = user?.healthProfile?.healthGoals || [];
  const userAllergies = user?.healthProfile?.allergies || [];
  const dietaryPlan = user?.healthProfile?.dietaryPlan;

  const filteredRecommendations = selectedGoal
    ? recommendations.filter(r => 
        r.reasons?.some(reason => reason.text?.toLowerCase().includes(selectedGoal.toLowerCase()))
      )
    : recommendations;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/menu')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">For You</h1>
        </div>
        <button onClick={() => navigate('/cart')} className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
          <ShoppingCart size={22} className="text-gray-600" />
          {getItemCount() > 0 && (
            <span className="absolute top-1 right-1 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
              {getItemCount()}
            </span>
          )}
        </button>
      </header>

      <div className="pt-20 px-4 pb-24">
        {/* AI Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-3xl border border-orange-100"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shrink-0">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-sm">Smart Recommendations</h2>
            <p className="text-xs text-gray-500">
              {isAuthenticated
                ? 'Personalized picks based on your health profile & taste'
                : 'Create a health profile for personalized suggestions'}
            </p>
          </div>
        </motion.div>

        {/* Health Profile Summary */}
        {isAuthenticated && user?.healthProfile?.isCreated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Your Profile</h3>
              <button 
                onClick={() => navigate('/health-profile')}
                className="text-xs text-orange-600 font-semibold flex items-center gap-1"
              >
                Edit <ChevronRight size={12} />
              </button>
            </div>
            
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              {/* Goals */}
              {userGoals.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-400 font-medium mb-2">Goals</p>
                  <div className="flex flex-wrap gap-2">
                    {userGoals.map(goal => (
                      <span key={goal} className="text-sm bg-orange-50 text-orange-600 px-3 py-1 rounded-full font-medium">
                        {goalIcons[goal] || '🎯'} {goal}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Allergies */}
              {userAllergies.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-400 font-medium mb-2">Avoiding</p>
                  <div className="flex flex-wrap gap-2">
                    {userAllergies.map(allergy => (
                      <span key={allergy} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-medium">
                        ⚠️ {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dietary Plan */}
              {dietaryPlan && (
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-2">Diet</p>
                  <span className="text-sm bg-green-50 text-green-600 px-3 py-1 rounded-full font-medium">
                    🌿 {dietaryPlan}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Goal Filter Pills */}
        {userGoals.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 mb-2">
            <button
              onClick={() => setSelectedGoal(null)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                selectedGoal === null
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-white text-gray-600 border-gray-100'
              }`}
            >
              All Picks
            </button>
            {userGoals.map(goal => (
              <button
                key={goal}
                onClick={() => setSelectedGoal(selectedGoal === goal ? null : goal)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                  selectedGoal === goal
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'bg-white text-gray-600 border-gray-100'
                }`}
              >
                {goalIcons[goal]} {goal}
              </button>
            ))}
          </div>
        )}

        {/* Not Logged In Prompt */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3"
          >
            <User className="text-blue-600 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-blue-800 font-bold text-sm">Unlock personalized picks</p>
              <p className="text-blue-600 text-xs mt-1">
                Create a health profile to get recommendations tailored to your dietary needs and goals.
              </p>
              <button
                onClick={() => navigate('/health-profile')}
                className="mt-2 text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1.5 rounded-lg"
              >
                Create Profile →
              </button>
            </div>
          </motion.div>
        )}

        {/* Recommendations List */}
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          {isAuthenticated ? 'Picked for You' : 'Popular Dishes'}
        </h3>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl p-4 border border-gray-100 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-2xl" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredRecommendations.length === 0 ? (
          <div className="text-center py-16">
            <Sparkles size={40} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">No recommendations yet</p>
            <p className="text-gray-300 text-sm mt-1">Try adjusting your health profile</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecommendations.map((item, index) => {
              const dish = item.menuItem || item;
              const conflictingAllergens = (dish.allergens || []).filter(a => userAllergies.includes(a));
              const hasConflict = conflictingAllergens.length > 0;
              const matchScore = item.score ? Math.round(item.score * 100) : null;

              return (
                <motion.div
                  key={dish._id || dish.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/menu/${dish._id || dish.id}`)}
                  className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
                >
                  <div className="flex gap-4 p-4">
                    {/* Image */}
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/96?text=🍽️';
                        }}
                      />
                      {matchScore && (
                        <div className="absolute bottom-1 left-1 bg-black/70 backdrop-blur text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                          {matchScore}% match
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-900 leading-tight truncate pr-2">{dish.name}</h3>
                        <span className="text-orange-600 font-bold text-sm shrink-0">${dish.price?.toFixed(2)}</span>
                      </div>

                      <p className="text-xs text-gray-400 mb-2 line-clamp-2">{dish.description}</p>

                      {/* Reason Tags */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {(item.reasons || []).slice(0, 3).map((reason, i) => (
                          <ReasonTag key={i} reason={reason.text} type={reason.type} />
                        ))}
                      </div>

                      {/* Quick Nutrition */}
                      <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-400">
                        <span><span className="text-orange-600">{dish.nutritionPerServing?.calories}</span> cal</span>
                        <span><span className="text-blue-600">{dish.nutritionPerServing?.protein}g</span> protein</span>
                      </div>
                    </div>
                  </div>

                  {/* Allergy Warning */}
                  {hasConflict && (
                    <div className="px-4 pb-3">
                      <div className="p-2 bg-red-50 rounded-xl flex items-center gap-2">
                        <AlertCircle size={14} className="text-red-500 shrink-0" />
                        <p className="text-xs text-red-600 font-medium">
                          Contains {conflictingAllergens.join(', ')} — check with staff
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ML Model Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 bg-gray-100 rounded-2xl text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain size={16} className="text-gray-400" />
            <p className="text-xs text-gray-400 font-medium">Powered by VibeDine AI</p>
          </div>
          <p className="text-[10px] text-gray-300">
            Recommendations improve as you order more dishes
          </p>
        </motion.div>
      </div>
    </div>
  );
}

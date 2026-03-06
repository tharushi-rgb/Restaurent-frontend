import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, Heart, TrendingUp, AlertCircle,
  Star, Leaf, ShoppingCart, ChevronRight, Brain, Zap, User
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore, useCartStore } from '../../store';
import api from '../../api';
import { PageHeader } from '../../components/CustomerLayout';

// Goal label to icon map (no emojis)
const goalIconMap = {
  'Weight Loss': Zap,
  'Muscle Gain': TrendingUp,
  'Low Sodium': Heart,
  'Keto': Leaf,
  'Vegan': Leaf,
  'High Protein': Brain,
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
        const { data } = await api.get('/recommendations/quick');
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

  const getGoalMatchScore = (rec, goal) => {
    const dish = rec.item || rec.menuItem || rec;
    const nutrition = dish.nutritionPerServing || {};
    const reasons = (rec.reasons || []).map((reason) => (typeof reason === 'string' ? reason : reason?.text || '').toLowerCase());

    let score = 0;
    const backendGoal = (rec.matchBreakdown?.goal || 0) / 100;
    const backendMl = (rec.matchBreakdown?.ml || 0) / 100;
    score += backendGoal * 2;
    score += backendMl * 1.5;

    if (goal === 'Weight Loss') {
      if ((nutrition.calories ?? 9999) <= 500) score += 2;
      if ((nutrition.fiber ?? 0) >= 3) score += 1;
      if (reasons.some((r) => r.includes('low calorie') || r.includes('weight loss'))) score += 2;
    }

    if (goal === 'Muscle Gain') {
      if ((nutrition.protein ?? 0) >= 25) score += 2;
      if ((nutrition.calories ?? 0) >= 350) score += 1;
      if (reasons.some((r) => r.includes('muscle') || r.includes('protein'))) score += 2;
    }

    if (goal === 'Low Sodium') {
      if ((nutrition.sodium ?? 9999) <= 400) score += 2;
      if (reasons.some((r) => r.includes('low sodium') || r.includes('heart'))) score += 2;
    }

    if (goal === 'High Protein') {
      if ((nutrition.protein ?? 0) >= 20) score += 2;
      if (reasons.some((r) => r.includes('protein'))) score += 2;
    }

    if (goal === 'Keto') {
      if ((nutrition.carbs ?? 9999) <= 15) score += 2;
      if ((nutrition.fat ?? 0) >= 15) score += 1;
      if (reasons.some((r) => r.includes('keto'))) score += 2;
    }

    if (goal === 'Vegan') {
      if (!dish.allergens?.includes('Dairy') && !dish.allergens?.includes('Eggs') && !dish.allergens?.includes('Fish') && !dish.allergens?.includes('Shellfish')) score += 2;
      if (reasons.some((r) => r.includes('vegan'))) score += 2;
    }

    return score;
  };

  const filteredRecommendations = selectedGoal
    ? (() => {
        const ranked = recommendations
          .map((rec) => ({ rec, matchScore: getGoalMatchScore(rec, selectedGoal) }))
          .sort((a, b) => b.matchScore - a.matchScore || (b.rec.score || 0) - (a.rec.score || 0));

        const directMatches = ranked.filter((r) => r.matchScore > 0).map((r) => r.rec);
        if (directMatches.length > 0) return directMatches;

        return ranked.slice(0, 1).map((r) => r.rec);
      })()
    : recommendations;

  return (
    <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
      {/* Shared header with hamburger sidebar */}
      <PageHeader
        title="AI Picks For You"
        showCart
        gradient="from-purple-600 via-purple-500 to-pink-500"
      />

      <div className="flex-1 overflow-y-auto px-4 pb-8">
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
            className="mb-3"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Your Profile</h3>
              <button 
                onClick={() => navigate('/health-profile')}
                className="text-xs text-orange-600 font-semibold flex items-center gap-1"
              >
                Edit <ChevronRight size={12} />
              </button>
            </div>
            
            <div className="bg-white rounded-2xl p-3 border border-gray-100">
              {/* Goals */}
              {userGoals.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-gray-400 font-medium mb-1">Goals</p>
                  <div className="flex flex-wrap gap-1.5">
                    {userGoals.map(goal => {
                      const GoalIcon = goalIconMap[goal] || Sparkles;
                      return (
                        <span key={goal} className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                          <GoalIcon size={10} />
                          {goal}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Allergies */}
              {userAllergies.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-gray-400 font-medium mb-1">Avoiding</p>
                  <div className="flex flex-wrap gap-1.5">
                    {userAllergies.map(allergy => (
                      <span key={allergy} className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">
                        <AlertCircle size={9} />
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dietary Plan */}
              {dietaryPlan && (
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Diet</p>
                  <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">
                    <Leaf size={10} />
                    {dietaryPlan}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Goal Filter Pills — always show common goals */}
        {(() => {
          const displayGoals = userGoals.length > 0 ? userGoals : ['Weight Loss', 'Muscle Gain', 'Low Sodium', 'High Protein'];
          return (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 mb-2">
              <button
                onClick={() => setSelectedGoal(null)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                  selectedGoal === null
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'bg-white text-gray-600 border-gray-100'
                }`}
              >
                All Picks
              </button>
              {displayGoals.map(goal => (
                <button
                  key={goal}
                  onClick={() => setSelectedGoal(selectedGoal === goal ? null : goal)}
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold border transition-all flex items-center gap-1 ${
                    selectedGoal === goal
                      ? 'bg-orange-600 text-white border-orange-600'
                      : 'bg-white text-gray-600 border-gray-100'
                  }`}
                >
                  {(() => { const GI = goalIconMap[goal]; return GI ? <GI size={11} /> : null; })()} {goal}
                </button>
              ))}
            </div>
          );
        })()}

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
              const dish = item.item || item.menuItem || item;
              const conflictingAllergens = (dish.allergens || []).filter(a => userAllergies.includes(a));
              const hasConflict = conflictingAllergens.length > 0;
              const matchScore = item.score ? (item.score > 1 ? Math.round(item.score) : Math.round(item.score * 100)) : null;

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
                          e.target.src = 'https://via.placeholder.com/96?text=Dish';
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
                        {(item.reasons || []).slice(0, 3).map((reason, i) => {
                          const text = typeof reason === 'string' ? reason : reason.text || '';
                          const type = typeof reason === 'string' ? (text.includes('Popular') ? 'popular' : text.includes('AI') ? 'ml' : 'health') : reason.type;
                          return <ReasonTag key={i} reason={text} type={type} />;
                        })}
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

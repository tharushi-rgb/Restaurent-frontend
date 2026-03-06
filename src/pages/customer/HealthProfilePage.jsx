import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Heart, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store';
import { PageHeaderDual } from '../../components/CustomerLayout';

const allergyList = ['Peanuts', 'Dairy', 'Gluten', 'Shellfish', 'Soy', 'Eggs', 'Tree Nuts', 'Sesame', 'Fish'];
const goalList = ['Weight Loss', 'Muscle Gain', 'Low Sodium', 'Keto', 'Vegan', 'High Protein'];
const dietaryOptions = ['', 'Vegetarian', 'Vegan', 'Paleo', 'Keto'];

export default function HealthProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateHealthProfile } = useAuthStore();
  
  const [allergies, setAllergies] = useState(user?.healthProfile?.allergies || []);
  const [dietaryPlan, setDietaryPlan] = useState(user?.healthProfile?.dietaryPlan || '');
  const [healthGoals, setHealthGoals] = useState(user?.healthProfile?.healthGoals || []);
  const [loading, setLoading] = useState(false);

  const toggle = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast('Please create an account to save your health profile');
      navigate('/register', { state: { healthProfile: { allergies, dietaryPlan, healthGoals } } });
      return;
    }

    setLoading(true);
    try {
      const result = await updateHealthProfile({ allergies, dietaryPlan, healthGoals });
      if (result.success) {
        toast.success('Health profile updated!');
        navigate('/menu');
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const selectedCount = allergies.length + healthGoals.length + (dietaryPlan ? 1 : 0);

  return (
    <div className="h-full bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <PageHeaderDual
        title="Health Profile"
        onBack={() => navigate(-1)}
        gradient="from-emerald-600 via-emerald-500 to-teal-500"
      />

      {/* Content card */}
      <div className="flex-1 bg-white px-6 pt-6 pb-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {!isAuthenticated && (
            <div className="mb-5 p-3.5 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-blue-700 text-xs font-medium">
                Create an account to save your profile and get personalized recommendations.
              </p>
            </div>
          )}

          {/* Allergies Section */}
          <section className="mb-6">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
              Common Allergies
            </label>
            <div className="flex flex-wrap gap-2">
              {allergyList.map(allergy => (
                <button
                  key={allergy}
                  onClick={() => toggle(allergies, setAllergies, allergy)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    allergies.includes(allergy) 
                      ? 'bg-red-100 text-red-600 border border-red-200' 
                      : 'bg-gray-50 text-gray-600 border border-gray-100'
                  }`}
                >
                  {allergies.includes(allergy) && <CheckCircle2 size={12} className="inline mr-1" />}
                  {allergy}
                </button>
              ))}
            </div>
          </section>

          {/* Dietary Preferences Section */}
          <section className="mb-6">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
              Dietary Preferences
            </label>
            <div className="relative">
              <select 
                value={dietaryPlan}
                onChange={(e) => setDietaryPlan(e.target.value)}
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none text-sm pr-10"
              >
                {dietaryOptions.map(option => (
                  <option key={option} value={option}>
                    {option || 'None selected'}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </section>

          {/* Health Goals Section */}
          <section className="mb-6">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
              Health Goals
            </label>
            <div className="grid grid-cols-2 gap-2">
              {goalList.map(goal => (
                <button
                  key={goal}
                  onClick={() => toggle(healthGoals, setHealthGoals, goal)}
                  className={`px-3.5 py-3 rounded-xl text-xs font-medium transition-all text-left flex items-center justify-between ${
                    healthGoals.includes(goal) 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                      : 'bg-gray-50 text-gray-600 border border-gray-100'
                  }`}
                >
                  {goal}
                  {healthGoals.includes(goal) && <CheckCircle2 size={14} />}
                </button>
              ))}
            </div>
          </section>

          {/* Summary */}
          {selectedCount > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <Heart size={14} className="text-emerald-600" />
                <p className="text-xs font-semibold text-emerald-700">Profile Summary</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allergies.map(a => <span key={a} className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{a}</span>)}
                {dietaryPlan && <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{dietaryPlan}</span>}
                {healthGoals.map(g => <span key={g} className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">{g}</span>)}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Save Button - pinned at bottom */}
      <div className="flex-shrink-0 p-5 bg-gradient-to-t from-white via-white to-transparent">
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3.5 rounded-2xl font-bold text-base shadow-lg shadow-emerald-200/40 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            'Save Profile'
          )}
        </button>
      </div>
    </div>
  );
}

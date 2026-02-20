import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store';

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
      // Redirect to login/register with profile data
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center max-w-md mx-auto">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-gray-900 ml-2">My Profile</h1>
      </header>

      <div className="pt-20 px-6 pb-32 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold mb-6">Your Health Profile</h2>
          
          {/* Allergies Section */}
          <section className="mb-8">
            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
              Common Allergies
            </label>
            <div className="flex flex-wrap gap-2">
              {allergyList.map(allergy => (
                <button
                  key={allergy}
                  onClick={() => toggle(allergies, setAllergies, allergy)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    allergies.includes(allergy) 
                      ? 'bg-red-100 text-red-600 border border-red-200' 
                      : 'bg-gray-50 text-gray-600 border border-gray-100'
                  }`}
                >
                  {allergy}
                </button>
              ))}
            </div>
          </section>

          {/* Dietary Preferences Section */}
          <section className="mb-8">
            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
              Dietary Preferences
            </label>
            <select 
              value={dietaryPlan}
              onChange={(e) => setDietaryPlan(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
            >
              {dietaryOptions.map(option => (
                <option key={option} value={option}>
                  {option || 'None'}
                </option>
              ))}
            </select>
          </section>

          {/* Health Goals Section */}
          <section className="mb-12">
            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
              Health Goals
            </label>
            <div className="grid grid-cols-2 gap-2">
              {goalList.map(goal => (
                <button
                  key={goal}
                  onClick={() => toggle(healthGoals, setHealthGoals, goal)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all text-left flex items-center justify-between ${
                    healthGoals.includes(goal) 
                      ? 'bg-orange-50 text-orange-600 border border-orange-200' 
                      : 'bg-gray-50 text-gray-600 border border-gray-100'
                  }`}
                >
                  {goal}
                  {healthGoals.includes(goal) && <CheckCircle2 size={16} />}
                </button>
              ))}
            </div>
          </section>

          {!isAuthenticated && (
            <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-blue-700 text-sm">
                <strong>Note:</strong> Create an account to save your health profile permanently and access personalized recommendations.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Fixed Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent max-w-md mx-auto">
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
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

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Star, ThumbsUp, ThumbsDown, MessageSquare, Send, CheckCircle2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';

const quickTags = [
  'Delicious food', 'Fast service', 'Great ambiance', 'Fresh ingredients',
  'Generous portions', 'Friendly staff', 'Could be better', 'Too slow'
];

const StarRating = ({ value, onChange, label }) => (
  <div className="mb-6">
    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
      {label}
    </label>
    <div className="flex gap-3 justify-center">
      {[1, 2, 3, 4, 5].map(star => (
        <motion.button
          key={star}
          whileTap={{ scale: 1.3 }}
          onClick={() => onChange(star)}
          className="relative"
        >
          <Star
            size={36}
            fill={star <= value ? '#f97316' : 'none'}
            className={`transition-colors duration-200 ${
              star <= value ? 'text-orange-500' : 'text-gray-200'
            }`}
          />
          {star <= value && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute inset-0 rounded-full bg-orange-100 -z-10 scale-150 opacity-50"
            />
          )}
        </motion.button>
      ))}
    </div>
    <p className="text-center text-sm text-gray-400 mt-2">
      {value === 1 && 'Poor'}
      {value === 2 && 'Fair'}
      {value === 3 && 'Good'}
      {value === 4 && 'Very Good'}
      {value === 5 && 'Excellent'}
    </p>
  </div>
);

export default function FeedbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;
  const orderNumber = location.state?.orderNumber;

  const [step, setStep] = useState(1);
  const [foodRating, setFoodRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [overallRating, setOverallRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [wouldRecommend, setWouldRecommend] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!orderId) {
      toast.error('No order found to review');
      return;
    }

    if (foodRating === 0 || serviceRating === 0 || overallRating === 0) {
      toast.error('Please rate all categories');
      return;
    }

    setLoading(true);
    try {
      const fullComment = [
        ...selectedTags.map(t => `[${t}]`),
        comment
      ].filter(Boolean).join(' ');

      await api.post('/feedback', {
        orderId,
        foodRating,
        serviceRating,
        overallRating,
        comment: fullComment,
        wouldRecommend: wouldRecommend ?? true
      });
      
      setSubmitted(true);
      toast.success('Thank you for your feedback!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-500 mb-8">Your feedback helps us serve you better.</p>
          
          <div className="flex items-center justify-center gap-1 mb-8">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} size={20} fill={s <= overallRating ? '#f97316' : 'none'} className={s <= overallRating ? 'text-orange-500' : 'text-gray-200'} />
            ))}
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-200"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center max-w-md mx-auto">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-gray-900 ml-2">Rate Your Experience</h1>
      </header>

      <div className="pt-20 px-6 pb-32">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
              s <= step ? 'bg-orange-500' : 'bg-gray-100'
            }`} />
          ))}
        </div>

        {orderNumber && (
          <div className="text-center mb-6">
            <span className="text-sm text-gray-400">Order</span>
            <p className="text-lg font-bold text-gray-900">{orderNumber}</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Ratings */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">How was everything?</h2>
                <p className="text-gray-500">Rate your dining experience</p>
              </div>

              <div className="bg-gray-50 rounded-3xl p-6 space-y-2">
                <StarRating value={foodRating} onChange={setFoodRating} label="Food Quality" />
                <StarRating value={serviceRating} onChange={setServiceRating} label="Service" />
                <StarRating value={overallRating} onChange={setOverallRating} label="Overall Experience" />
              </div>
            </motion.div>
          )}

          {/* Step 2: Tags & Comment */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us more</h2>
                <p className="text-gray-500">What stood out to you?</p>
              </div>

              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
                  Quick Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {quickTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        selectedTags.includes(tag)
                          ? 'bg-orange-100 text-orange-600 border border-orange-200'
                          : 'bg-gray-50 text-gray-600 border border-gray-100'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
                  <MessageSquare size={14} className="inline mr-1" />
                  Additional Comments
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts with us... (optional)"
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-gray-400 text-right mt-1">{comment.length}/500</p>
              </div>
            </motion.div>
          )}

          {/* Step 3: Would Recommend */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div className="mb-10">
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles size={36} className="text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">One last thing!</h2>
                <p className="text-gray-500">Would you recommend VibeDine to a friend?</p>
              </div>

              <div className="flex gap-4 justify-center mb-10">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setWouldRecommend(true)}
                  className={`flex-1 max-w-[150px] py-6 rounded-3xl font-bold flex flex-col items-center gap-3 border-2 transition-all ${
                    wouldRecommend === true
                      ? 'border-green-500 bg-green-50 text-green-600'
                      : 'border-gray-100 text-gray-400'
                  }`}
                >
                  <ThumbsUp size={32} />
                  <span>Yes!</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setWouldRecommend(false)}
                  className={`flex-1 max-w-[150px] py-6 rounded-3xl font-bold flex flex-col items-center gap-3 border-2 transition-all ${
                    wouldRecommend === false
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-gray-100 text-gray-400'
                  }`}
                >
                  <ThumbsDown size={32} />
                  <span>Not yet</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent max-w-md mx-auto">
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-4 border-2 border-gray-100 rounded-2xl font-bold text-gray-600"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => {
                if (step === 1 && (foodRating === 0 || serviceRating === 0 || overallRating === 0)) {
                  toast.error('Please rate all categories');
                  return;
                }
                setStep(step + 1);
              }}
              className="flex-1 bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-200"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || wouldRecommend === null}
              className="flex-1 bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Feedback
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

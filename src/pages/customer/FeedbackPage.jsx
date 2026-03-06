import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Send, CheckCircle2, Sparkles, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';
import { useOrderStore } from '../../store';
import { PageHeaderDual } from '../../components/CustomerLayout';

const quickTags = [
  'Delicious food', 'Fast service', 'Great ambiance', 'Fresh ingredients',
  'Generous portions', 'Friendly staff', 'Could be better', 'Too slow',
  'Wrong order received'
];

const StarRating = ({ value, onChange, label }) => (
  <div className="flex items-center justify-between py-3">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map(star => (
        <motion.button
          key={star}
          whileTap={{ scale: 1.3 }}
          onClick={() => onChange(star)}
          className="relative"
        >
          <Star
            size={28}
            fill={star <= value ? '#f97316' : 'none'}
            className={`transition-colors duration-200 ${
              star <= value ? 'text-orange-500' : 'text-gray-200'
            }`}
          />
        </motion.button>
      ))}
    </div>
  </div>
);

export default function FeedbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentOrder } = useOrderStore();
  
  // Try to get orderId from navigation state first, then from current order
  const orderId = location.state?.orderId || currentOrder?.id || currentOrder?._id;
  const orderNumber = location.state?.orderNumber || currentOrder?.orderNumber;

  const [step, setStep] = useState(1);
  const [foodRating, setFoodRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [overallRating, setOverallRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [wouldRecommend, setWouldRecommend] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [recentOrderId, setRecentOrderId] = useState(orderId);

  // If no orderId from state or store, try fetching most recent order
  useEffect(() => {
    if (!recentOrderId) {
      api.get('/orders/my-orders').then(({ data }) => {
        const orders = data.orders || data;
        if (orders && orders.length > 0) {
          const latest = orders[0];
          setRecentOrderId(latest.id || latest._id);
        }
      }).catch(() => {});
    }
  }, [recentOrderId]);

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    const finalOrderId = recentOrderId;
    if (!finalOrderId) {
      toast.error('No order found to review. Please place an order first.');
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
        orderId: finalOrderId,
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
      <div className="h-full bg-white flex flex-col items-center justify-center px-6 overflow-hidden">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-500 text-sm mb-6">Your feedback helps us serve you better.</p>
          
          <div className="flex items-center justify-center gap-1 mb-8">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} size={20} fill={s <= overallRating ? '#f97316' : 'none'} className={s <= overallRating ? 'text-orange-500' : 'text-gray-200'} />
            ))}
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3.5 rounded-2xl font-bold text-base shadow-lg shadow-primary-200/40 active:scale-[0.98] transition-transform"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  const ratingLabel = (val) => {
    if (val === 0) return '';
    return ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][val];
  };

  return (
    <div className="h-full bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <PageHeaderDual
        title="Rate Your Experience"
        onBack={() => navigate(-1)}
      />
      {/* Progress dots */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 px-5 pb-4">
        <div className="flex items-center justify-center gap-3">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                s < step ? 'bg-white text-orange-600' :
                s === step ? 'bg-white text-orange-600 ring-4 ring-white/30' :
                'bg-white/25 text-white/70'
              }`}>
                {s < step ? <CheckCircle2 size={16} /> : s}
              </div>
              {s < 3 && (
                <div className={`w-8 h-0.5 rounded-full ${s < step ? 'bg-white' : 'bg-white/25'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 -mt-4 bg-white rounded-t-[28px] relative z-10 px-6 pt-6 pb-4 overflow-y-auto">
        {orderNumber && (
          <div className="flex items-center justify-center gap-2 mb-5">
            <span className="text-xs text-gray-400 font-medium">Order</span>
            <span className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">{orderNumber}</span>
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
              <div className="mb-5">
                <h2 className="text-xl font-bold text-gray-900 mb-1">How was everything?</h2>
                <p className="text-gray-400 text-sm">Rate your dining experience</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 divide-y divide-gray-100">
                <StarRating value={foodRating} onChange={setFoodRating} label="Food Quality" />
                <StarRating value={serviceRating} onChange={setServiceRating} label="Service" />
                <StarRating value={overallRating} onChange={setOverallRating} label="Overall" />
              </div>

              {(foodRating > 0 || serviceRating > 0 || overallRating > 0) && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center justify-center gap-3"
                >
                  {foodRating > 0 && <span className="text-xs text-gray-400">Food: <strong className="text-gray-600">{ratingLabel(foodRating)}</strong></span>}
                  {serviceRating > 0 && <span className="text-xs text-gray-400">Service: <strong className="text-gray-600">{ratingLabel(serviceRating)}</strong></span>}
                  {overallRating > 0 && <span className="text-xs text-gray-400">Overall: <strong className="text-gray-600">{ratingLabel(overallRating)}</strong></span>}
                </motion.div>
              )}
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
              <div className="mb-5">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Tell us more</h2>
                <p className="text-gray-400 text-sm">What stood out to you?</p>
              </div>

              <div className="mb-5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5 block">
                  Quick Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {quickTags.map(tag => {
                    const isNegative = tag === 'Wrong order received' || tag === 'Could be better' || tag === 'Too slow';
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                          isSelected
                            ? isNegative
                              ? 'bg-red-100 text-red-600 border border-red-200'
                              : 'bg-orange-100 text-orange-600 border border-orange-200'
                            : 'bg-gray-50 text-gray-600 border border-gray-100'
                        }`}
                      >
                        {tag === 'Wrong order received' ? '⚠️ ' : ''}{tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1 block">
                  <MessageSquare size={12} />
                  Additional Comments
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts with us... (optional)"
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-gray-300 text-right mt-1">{comment.length}/500</p>
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
              className="flex flex-col items-center pt-6"
            >
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-5">
                <Sparkles size={30} className="text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">One last thing!</h2>
              <p className="text-gray-400 text-sm text-center mb-8">Would you recommend VibeDine to a friend?</p>

              <div className="flex gap-4 w-full mb-6">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setWouldRecommend(true)}
                  className={`flex-1 py-5 rounded-2xl font-bold flex flex-col items-center gap-2.5 border-2 transition-all ${
                    wouldRecommend === true
                      ? 'border-green-500 bg-green-50 text-green-600'
                      : 'border-gray-100 text-gray-400 hover:border-gray-200'
                  }`}
                >
                  <ThumbsUp size={28} />
                  <span className="text-sm">Yes!</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setWouldRecommend(false)}
                  className={`flex-1 py-5 rounded-2xl font-bold flex flex-col items-center gap-2.5 border-2 transition-all ${
                    wouldRecommend === false
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-gray-100 text-gray-400 hover:border-gray-200'
                  }`}
                >
                  <ThumbsDown size={28} />
                  <span className="text-sm">Not yet</span>
                </motion.button>
              </div>

              {/* Summary */}
              <div className="w-full bg-gray-50 rounded-2xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Your Rating Summary</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Food Quality</span>
                    <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s<=foodRating?'#f97316':'none'} className={s<=foodRating?'text-orange-500':'text-gray-200'} />)}</div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Service</span>
                    <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s<=serviceRating?'#f97316':'none'} className={s<=serviceRating?'text-orange-500':'text-gray-200'} />)}</div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Overall</span>
                    <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s<=overallRating?'#f97316':'none'} className={s<=overallRating?'text-orange-500':'text-gray-200'} />)}</div>
                  </div>
                  {selectedTags.length > 0 && (
                    <div className="pt-2 mt-2 border-t border-gray-100">
                      <div className="flex flex-wrap gap-1">
                        {selectedTags.map(t => <span key={t} className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{t}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="flex-shrink-0 p-5 bg-white border-t border-gray-100">
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-shrink-0 w-14 py-3.5 border-2 border-gray-100 rounded-2xl font-bold text-gray-500 text-sm"
            >
              <ChevronLeft size={18} className="mx-auto" />
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
              className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3.5 rounded-2xl font-bold text-base shadow-lg shadow-primary-200/40 active:scale-[0.98] transition-transform"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || wouldRecommend === null}
              className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3.5 rounded-2xl font-bold text-base shadow-lg shadow-primary-200/40 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={16} />
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

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Star, MessageSquare, ThumbsUp, ThumbsDown,
  TrendingUp, Filter, RefreshCw
} from 'lucide-react';
import api from '../../api';

export default function AdminFeedback() {
  const navigate = useNavigate();
  const [feedbackList, setFeedbackList] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [feedbackRes, statsRes] = await Promise.all([
        api.get('/feedback?limit=50'),
        api.get('/feedback/stats')
      ]);
      setFeedbackList(feedbackRes.data.feedback);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedback = filter === 'all' 
    ? feedbackList
    : filter === 'positive' 
      ? feedbackList.filter(f => f.overallRating >= 4)
      : feedbackList.filter(f => f.overallRating <= 2);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')} className="p-2 hover:bg-gray-800 rounded-lg">
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold">Customer Feedback</h1>
              <p className="text-sm text-gray-400">{stats?.totalFeedback || 0} total reviews</p>
            </div>
          </div>
          <button onClick={fetchData} className="p-2 hover:bg-gray-800 rounded-lg">
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="max-w-6xl mx-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatBox label="Food Rating" value={stats?.avgFoodRating || '0'} icon="🍽️" />
            <StatBox label="Service Rating" value={stats?.avgServiceRating || '0'} icon="🤝" />
            <StatBox label="Overall Rating" value={stats?.avgOverallRating || '0'} icon="⭐" />
            <StatBox label="Would Recommend" value={`${stats?.recommendationRate || 0}%`} icon="👍" />
            <StatBox label="Total Reviews" value={stats?.totalFeedback || 0} icon="📝" />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { key: 'all', label: 'All Reviews' },
              { key: 'positive', label: '★ 4-5 Stars' },
              { key: 'negative', label: '★ 1-2 Stars' }
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  filter === f.key ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Feedback List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredFeedback.map((feedback) => (
              <motion.div
                key={feedback._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      {feedback.customer?.name || 'Guest'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {feedback.order?.orderNumber || 'Order'} • Table {feedback.tableNumber}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star
                        key={s}
                        size={14}
                        fill={s <= feedback.overallRating ? '#f97316' : 'none'}
                        className={s <= feedback.overallRating ? 'text-orange-500' : 'text-gray-200'}
                      />
                    ))}
                  </div>
                </div>

                {/* Ratings Breakdown */}
                <div className="flex gap-4 mb-3 text-xs">
                  <span className="text-gray-500">
                    Food: <strong className="text-gray-900">{feedback.foodRating}/5</strong>
                  </span>
                  <span className="text-gray-500">
                    Service: <strong className="text-gray-900">{feedback.serviceRating}/5</strong>
                  </span>
                </div>

                {/* Comment */}
                {feedback.comment && (
                  <div className="p-3 bg-gray-50 rounded-xl mb-3">
                    <div className="flex items-start gap-2">
                      <MessageSquare size={14} className="text-gray-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-600">{feedback.comment}</p>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                  <span className={`flex items-center gap-1 font-medium ${
                    feedback.wouldRecommend ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {feedback.wouldRecommend ? <ThumbsUp size={12} /> : <ThumbsDown size={12} />}
                    {feedback.wouldRecommend ? 'Would recommend' : 'Would not recommend'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredFeedback.length === 0 && (
            <div className="text-center py-16">
              <MessageSquare size={40} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400">No feedback found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, icon }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
      <span className="text-2xl mb-2 block">{icon}</span>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

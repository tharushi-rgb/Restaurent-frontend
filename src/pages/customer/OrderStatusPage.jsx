import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Clock, FileText, CheckCircle2, PhoneCall, Info, Star, Sparkles, Headphones } from 'lucide-react';
import toast from 'react-hot-toast';
import { useOrderStore, useCartStore } from '../../store';
import { getSocket, joinTableRoom } from '../../socket';
import api from '../../api';

const statusSteps = [
  { key: 'received', label: 'Order Received', icon: FileText },
  { key: 'preparing', label: 'Preparing Food', icon: Clock },
  { key: 'quality_check', label: 'Quality Check', icon: Info },
  { key: 'ready', label: 'Ready', icon: CheckCircle2 },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

export default function OrderStatusPage() {
  const navigate = useNavigate();
  const { currentOrder } = useOrderStore();
  const [order, setOrder] = useState(currentOrder);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState({
    foodRating: 5,
    serviceRating: 5,
    overallRating: 5,
    comment: '',
    wouldRecommend: true
  });

  useEffect(() => {
    if (!order) {
      navigate('/menu');
    }
  }, [order, navigate]);

  useEffect(() => {
    // Poll for order updates (fallback, less frequent)
    const orderId = order?._id || order?.id;
    if (orderId) {
      // Initial fetch
      api.get(`/orders/${orderId}`).then(({ data }) => {
        setOrder(data);
        if (data.status === 'delivered') setShowFeedback(true);
      }).catch(() => {});

      const interval = setInterval(async () => {
        try {
          const { data } = await api.get(`/orders/${orderId}`);
          setOrder(data);
          if (data.status === 'delivered') {
            setShowFeedback(true);
          }
        } catch (error) {
          console.error('Failed to fetch order status:', error);
        }
      }, 15000); // Reduced frequency since Socket.IO handles real-time

      return () => clearInterval(interval);
    }
  }, [order?._id, order?.id]);

  // Socket.IO real-time updates
  useEffect(() => {
    const tableNumber = order?.tableNumber || order?.table_number;
    if (!tableNumber) return;

    const socket = getSocket();
    joinTableRoom(tableNumber);

    const handleStatusUpdate = (data) => {
      const orderId = order?._id || order?.id;
      if (data.orderId === orderId) {
        setOrder(prev => ({ ...prev, status: data.status }));
        toast.success(`Order ${data.status === 'delivered' ? 'delivered! 🎉' : `is now: ${data.status.replace('_', ' ')}`}`);
        if (data.status === 'delivered') {
          setShowFeedback(true);
        }
      }
    };

    socket.on('order-status-update', handleStatusUpdate);

    return () => {
      socket.off('order-status-update', handleStatusUpdate);
    };
  }, [order?._id, order?.id, order?.tableNumber, order?.table_number]);

  const handleRequestWaiter = async () => {
    try {
      await api.post(`/orders/${order._id || order.id}/request-waiter`);
      toast.success('Waiter has been notified');
    } catch (error) {
      toast.error('Failed to request waiter');
    }
  };

  const handleRequestBill = async () => {
    try {
      await api.post(`/orders/${order._id || order.id}/request-bill`);
      toast.success('Bill request sent');
    } catch (error) {
      toast.error('Failed to request bill');
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      await api.post('/feedback', {
        orderId: order._id || order.id,
        ...feedback
      });
      toast.success('Thank you for your feedback!');
      setShowFeedback(false);
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    }
  };

  if (!order) {
    return null;
  }

  const currentStepIndex = statusSteps.findIndex(s => s.key === order.status);

  const getStepStatus = (index) => {
    if (index < currentStepIndex) return 'completed';
    if (index === currentStepIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center max-w-md mx-auto">
        <button onClick={() => navigate('/menu')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-gray-900 ml-2">Order Status</h1>
      </header>

      <div className="pt-20 px-6 pb-24">
        {/* Order Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="text-orange-600 animate-pulse" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Tracking {order.orderNumber}</h2>
          <p className="text-gray-500">Table {order.tableNumber}</p>
          {order.estimatedPrepTime && (
            <p className="text-sm text-orange-600 mt-2">
              Estimated time: {order.estimatedPrepTime} mins
            </p>
          )}
        </motion.div>

        {/* Status Steps */}
        <div className="space-y-8 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
          {statusSteps.map((step, i) => {
            const status = getStepStatus(i);
            const StepIcon = step.icon;
            
            return (
              <motion.div 
                key={step.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 relative z-10"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${
                  status === 'completed' ? 'bg-orange-600 text-white' :
                  status === 'current' ? 'bg-orange-100 text-orange-600 border-2 border-orange-500' :
                  'bg-gray-50 text-gray-300'
                }`}>
                  <StepIcon size={20} />
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex justify-between">
                    <h4 className={`font-bold ${status === 'pending' ? 'text-gray-300' : 'text-gray-900'}`}>
                      {step.label}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {status === 'completed' ? 'Completed' :
                     status === 'current' ? 'In progress...' :
                     'Waiting'}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-12 space-y-3">
          <button 
            onClick={() => navigate('/service-request')}
            className="w-full flex items-center justify-center gap-2 p-4 bg-orange-600 text-white rounded-2xl font-semibold hover:bg-orange-700 transition-colors"
          >
            <Headphones size={18} />
            Service Requests
          </button>
          <button 
            onClick={handleRequestWaiter}
            className="w-full flex items-center justify-center gap-2 p-4 border border-gray-100 rounded-2xl text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
          >
            <PhoneCall size={18} />
            Call Waiter
          </button>
          <button 
            onClick={handleRequestBill}
            className="w-full flex items-center justify-center gap-2 p-4 border border-gray-100 rounded-2xl text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
          >
            <FileText size={18} />
            Request Bill
          </button>
          {order.status === 'delivered' && (
            <button 
              onClick={() => navigate('/feedback')}
              className="w-full flex items-center justify-center gap-2 p-4 border border-orange-200 bg-orange-50 rounded-2xl text-orange-600 font-semibold hover:bg-orange-100 transition-colors"
            >
              <Star size={18} />
              Leave Detailed Feedback
            </button>
          )}
        </div>

        {/* Order Summary */}
        <div className="mt-8 p-4 bg-gray-50 rounded-2xl">
          <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-2">
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.quantity}x {item.menuItem?.name || 'Item'}
                </span>
                <span className="text-gray-900 font-medium">
                  ${item.totalPrice?.toFixed(2)}
                </span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-orange-600">${order.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full"
          >
            <h3 className="text-xl font-bold text-center mb-6">How was your experience?</h3>
            
            {/* Rating Stars */}
            {['Food', 'Service', 'Overall'].map((label) => {
              const key = `${label.toLowerCase()}Rating`;
              return (
                <div key={label} className="mb-4">
                  <label className="text-sm font-medium text-gray-600 mb-2 block">{label} Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setFeedback({ ...feedback, [key]: star })}
                        className="text-2xl"
                      >
                        <Star 
                          size={28} 
                          fill={star <= feedback[key] ? '#f97316' : 'none'}
                          className={star <= feedback[key] ? 'text-orange-500' : 'text-gray-300'}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            <textarea
              placeholder="Any comments? (optional)"
              value={feedback.comment}
              onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl mb-4 resize-none"
              rows={3}
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowFeedback(false);
                  navigate('/');
                }}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold"
              >
                Skip
              </button>
              <button
                onClick={handleSubmitFeedback}
                className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-semibold"
              >
                Submit
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

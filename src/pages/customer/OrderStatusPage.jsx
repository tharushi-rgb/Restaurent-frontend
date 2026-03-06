import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, FileText, CheckCircle2, Info, Star, Headphones, UtensilsCrossed } from 'lucide-react';
import toast from 'react-hot-toast';
import { useOrderStore, useCartStore } from '../../store';
import { getSocket, joinTableRoom } from '../../socket';
import api from '../../api';
import { PageHeaderDual } from '../../components/CustomerLayout';

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
    // If no order in store, try fetching from API
    if (!order) {
      // Don't redirect, show empty state
    }
  }, [order]);

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
        toast.success(`Order ${data.status === 'delivered' ? 'delivered!' : `status: ${data.status.replace('_', ' ')}`}`);
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
    return (
      <div className="h-full bg-white flex flex-col overflow-hidden">
        <PageHeaderDual title="Order Status" onBack={() => navigate(-1)} />
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <UtensilsCrossed size={32} className="text-gray-300" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">No Active Order</h2>
          <p className="text-sm text-gray-400 text-center mb-6">
            You don't have any active orders right now. Browse our menu to place an order.
          </p>
          <button
            onClick={() => navigate('/menu')}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-200/40 active:scale-[0.98] transition-transform"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex(s => s.key === order.status);

  const getStepStatus = (index) => {
    if (index < currentStepIndex) return 'completed';
    if (index === currentStepIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="h-full bg-white flex flex-col overflow-hidden">
      {/* Shared header with hamburger sidebar */}
      <PageHeaderDual title="Order Status" onBack={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {/* Order Info — compact */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 pt-2"
        >
          <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="text-orange-600 animate-pulse" size={24} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Tracking {order.orderNumber}</h2>
          <p className="text-gray-500 text-sm">Table {order.tableNumber}</p>
          {order.estimatedPrepTime && (
            <p className="text-xs text-orange-600 mt-1">
              ~{order.estimatedPrepTime} mins
            </p>
          )}
        </motion.div>

        {/* Status Steps — compact */}
        <div className="space-y-5 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 mb-6">
          {statusSteps.map((step, i) => {
            const status = getStepStatus(i);
            const StepIcon = step.icon;
            
            return (
              <motion.div 
                key={step.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-3 relative z-10"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 ${
                  status === 'completed' ? 'bg-orange-600 text-white' :
                  status === 'current' ? 'bg-orange-100 text-orange-600 border-2 border-orange-500' :
                  'bg-gray-50 text-gray-300'
                }`}>
                  <StepIcon size={16} />
                </div>
                <div className="flex-1 pt-0.5">
                  <h4 className={`font-bold text-sm ${status === 'pending' ? 'text-gray-300' : 'text-gray-900'}`}>
                    {step.label}
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {status === 'completed' ? 'Completed' :
                     status === 'current' ? 'In progress...' :
                     'Waiting'}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Action Buttons — only Service Requests + feedback */}
        <div className="space-y-3 mb-6">
          <button 
            onClick={() => navigate('/service-request', { state: { orderId: order._id || order.id, tableNumber: order.tableNumber } })}
            className="w-full flex items-center justify-center gap-2 p-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-semibold active:scale-[0.98] transition-transform shadow-lg shadow-primary-200/40 text-sm"
          >
            <Headphones size={16} />
            Service Requests
          </button>
          {order.status === 'delivered' && (
            <button 
              onClick={() => navigate('/feedback', { state: { orderId: order._id || order.id } })}
              className="w-full flex items-center justify-center gap-2 p-3.5 border border-orange-200 bg-orange-50 rounded-2xl text-orange-600 font-semibold hover:bg-orange-100 transition-colors text-sm"
            >
              <Star size={16} />
              Leave Detailed Feedback
            </button>
          )}
        </div>

        {/* Order Summary */}
        <div className="p-4 bg-gray-50 rounded-2xl">
          <h3 className="font-bold text-gray-900 mb-3 text-sm">Order Summary</h3>
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
            className="bg-white rounded-3xl p-6 max-w-[375px] w-full"
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

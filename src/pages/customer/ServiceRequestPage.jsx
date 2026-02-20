import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, PhoneCall, FileText, Bell, MessageSquare, 
  CheckCircle2, Clock, AlertCircle, Utensils, HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useOrderStore } from '../../store';
import api from '../../api';

const serviceOptions = [
  { id: 'waiter', icon: PhoneCall, label: 'Call Waiter', description: 'Request waiter to your table', color: 'bg-blue-500' },
  { id: 'bill', icon: FileText, label: 'Request Bill', description: 'Get your bill delivered', color: 'bg-green-500' },
  { id: 'water', icon: Utensils, label: 'Refill/Extras', description: 'Water, napkins, cutlery', color: 'bg-cyan-500' },
  { id: 'help', icon: HelpCircle, label: 'Other Help', description: 'General assistance needed', color: 'bg-purple-500' },
];

export default function ServiceRequestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentOrder } = useOrderStore();
  const orderId = location.state?.orderId || currentOrder?._id;
  const tableNumber = location.state?.tableNumber || currentOrder?.tableNumber;

  const [activeRequests, setActiveRequests] = useState([]);
  const [customMessage, setCustomMessage] = useState('');
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [loading, setLoading] = useState({});

  const handleServiceRequest = async (type) => {
    if (!orderId) {
      toast.error('No active order found');
      return;
    }

    // Check if already requested
    if (activeRequests.find(r => r.type === type && r.status === 'pending')) {
      toast('This request is already being processed', { icon: '⏳' });
      return;
    }

    setLoading(prev => ({ ...prev, [type]: true }));
    try {
      if (type === 'waiter' || type === 'water' || type === 'help') {
        await api.post(`/orders/${orderId}/request-waiter`);
      } else if (type === 'bill') {
        await api.post(`/orders/${orderId}/request-bill`);
      }

      setActiveRequests(prev => [...prev, {
        id: Date.now(),
        type,
        status: 'pending',
        time: new Date(),
        message: type === 'help' ? customMessage : ''
      }]);

      toast.success(`${serviceOptions.find(s => s.id === type)?.label} request sent!`);

      if (type === 'help') {
        setShowMessageBox(false);
        setCustomMessage('');
      }
    } catch (error) {
      toast.error('Failed to send request');
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const getRequestStatus = (type) => {
    const request = activeRequests.find(r => r.type === type);
    return request?.status || null;
  };

  const getTimeSinceRequest = (time) => {
    const diff = Math.floor((Date.now() - new Date(time).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center max-w-md mx-auto">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-gray-900 ml-2">Service</h1>
      </header>

      <div className="pt-20 px-6 pb-32">
        {/* Table Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Bell size={28} className="text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Need Assistance?</h2>
          {tableNumber && (
            <p className="text-gray-500 mt-1">Table {tableNumber}</p>
          )}
        </motion.div>

        {/* Service Options */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {serviceOptions.map((option, index) => {
            const Icon = option.icon;
            const requestStatus = getRequestStatus(option.id);
            const isRequested = requestStatus === 'pending';

            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (option.id === 'help') {
                    setShowMessageBox(true);
                  } else {
                    handleServiceRequest(option.id);
                  }
                }}
                disabled={loading[option.id]}
                className={`relative p-5 rounded-3xl border-2 transition-all text-left ${
                  isRequested
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl ${option.color} flex items-center justify-center mb-3`}>
                  {loading[option.id] ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : isRequested ? (
                    <CheckCircle2 size={22} className="text-white" />
                  ) : (
                    <Icon size={22} className="text-white" />
                  )}
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{option.label}</h3>
                <p className="text-xs text-gray-400 leading-tight">{option.description}</p>
                
                {isRequested && (
                  <div className="absolute top-3 right-3">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                    </span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Active Requests */}
        {activeRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Active Requests
            </h3>
            <div className="space-y-3">
              {activeRequests.map((request) => {
                const option = serviceOptions.find(s => s.id === request.type);
                const Icon = option?.icon || Bell;

                return (
                  <div key={request.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className={`w-10 h-10 rounded-xl ${option?.color} flex items-center justify-center shrink-0`}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{option?.label}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-xs text-orange-600">
                          <Clock size={10} />
                          {getTimeSinceRequest(request.time)}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-green-600 font-medium">Processing</span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <div className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Quick Note */}
        <div className="mt-8 p-4 bg-blue-50 rounded-3xl border border-blue-100">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-800 font-semibold text-sm">Quick Tip</p>
              <p className="text-blue-600 text-xs mt-1">
                Our staff will be notified immediately when you make a request. Average response time is 2-3 minutes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Message Modal */}
      <AnimatePresence>
        {showMessageBox && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full max-w-md bg-white rounded-t-[40px] p-6 pb-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">How can we help?</h2>
                <button onClick={() => setShowMessageBox(false)} className="p-2 bg-gray-100 rounded-full">
                  <ChevronLeft size={20} className="rotate-90" />
                </button>
              </div>
              
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Describe what you need..."
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                rows={4}
              />

              <button
                onClick={() => handleServiceRequest('help')}
                disabled={loading.help}
                className="w-full mt-4 bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading.help ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageSquare size={18} />
                    Send Request
                  </>
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

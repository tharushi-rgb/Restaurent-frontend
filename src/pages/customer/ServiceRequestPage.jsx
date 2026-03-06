import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PhoneCall, FileText, Bell,
  CheckCircle2, Clock, AlertCircle, Utensils
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useOrderStore } from '../../store';
import api from '../../api';
import { PageHeaderDual } from '../../components/CustomerLayout';

const serviceOptions = [
  { id: 'waiter', icon: PhoneCall, label: 'Call Waiter', description: 'Request waiter to your table', color: 'bg-blue-500' },
  { id: 'bill', icon: FileText, label: 'Request Bill', description: 'Get your bill delivered', color: 'bg-green-500' },
  { id: 'water', icon: Utensils, label: 'Refill/Extras', description: 'Water, napkins, cutlery', color: 'bg-cyan-500' },
];

export default function ServiceRequestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentOrder } = useOrderStore();
  const orderId = location.state?.orderId || currentOrder?._id;
  const tableNumber = location.state?.tableNumber || currentOrder?.tableNumber;

  const [activeRequests, setActiveRequests] = useState([]);
  const [loading, setLoading] = useState({});

  const handleServiceRequest = async (type) => {
    if (!orderId) {
      toast.error('No active order found');
      return;
    }

    // Check if already requested
    if (activeRequests.find(r => r.type === type && r.status === 'pending')) {
      toast('This request is already being processed');
      return;
    }

    setLoading(prev => ({ ...prev, [type]: true }));
    try {
      if (type === 'waiter' || type === 'water') {
        await api.post(`/orders/${orderId}/request-waiter`);
      } else if (type === 'bill') {
        await api.post(`/orders/${orderId}/request-bill`);
      }

      setActiveRequests(prev => [...prev, {
        id: Date.now(),
        type,
        status: 'pending',
        time: new Date(),
      }]);

      toast.success(`${serviceOptions.find(s => s.id === type)?.label} request sent!`);
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
    <div className="h-full bg-white flex flex-col overflow-hidden">
      {/* Shared header with hamburger sidebar */}
      <PageHeaderDual title="Service Requests" onBack={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto px-6 pb-8">
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
        <div className="space-y-3 mb-8">
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
                  handleServiceRequest(option.id);
                }}
                disabled={loading[option.id]}
                className={`relative w-full p-5 rounded-3xl border-2 transition-all flex items-center gap-4 ${
                  isRequested
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl ${option.color} flex items-center justify-center flex-shrink-0`}>
                  {loading[option.id] ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : isRequested ? (
                    <CheckCircle2 size={22} className="text-white" />
                  ) : (
                    <Icon size={22} className="text-white" />
                  )}
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-bold text-gray-900 text-sm mb-0.5">{option.label}</h3>
                  <p className="text-xs text-gray-400 leading-tight">{option.description}</p>
                </div>
                
                {isRequested && (
                  <div className="flex-shrink-0">
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

    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Clock, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';

const statusColors = {
  received: 'bg-blue-100 text-blue-600',
  preparing: 'bg-yellow-100 text-yellow-600',
  quality_check: 'bg-purple-100 text-purple-600',
  ready: 'bg-green-100 text-green-600',
  delivered: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600'
};

const statusLabels = {
  received: 'Received',
  preparing: 'Preparing',
  quality_check: 'Quality Check',
  ready: 'Ready',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    fetchOrders();
    
    // Poll for updates
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchOrders = async () => {
    try {
      const endpoint = filter === 'active' ? '/orders/active' : '/orders';
      const { data } = await api.get(endpoint);
      setOrders(data.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order updated to ${statusLabels[newStatus]}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const getNextStatus = (currentStatus) => {
    const flow = ['received', 'preparing', 'quality_check', 'ready', 'delivered'];
    const currentIndex = flow.indexOf(currentStatus);
    return currentIndex < flow.length - 1 ? flow[currentIndex + 1] : null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')} className="p-2 hover:bg-gray-800 rounded-lg">
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl font-bold">Orders</h1>
          </div>
          <button onClick={fetchOrders} className="p-2 hover:bg-gray-800 rounded-lg">
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex gap-2">
          {['active', 'all'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                filter === f
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl p-4 border border-gray-100"
              >
                {/* Order Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{order.orderNumber}</h3>
                    <p className="text-sm text-gray-500">Table {order.tableNumber}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                </div>

                {/* Allergy Alert */}
                {order.allergyAlerts?.length > 0 && (
                  <div className="mb-3 p-3 bg-red-50 rounded-xl flex items-start gap-2">
                    <AlertTriangle className="text-red-600 shrink-0" size={18} />
                    <div>
                      <p className="text-xs font-bold text-red-600">ALLERGY ALERT</p>
                      <p className="text-xs text-red-500">{order.allergyAlerts.join(', ')}</p>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="space-y-2 mb-4">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.quantity}x {item.menuItem?.name || 'Item'}
                        {item.customizations?.portion === 'Large' && ' (L)'}
                      </span>
                      <span className="text-gray-500">${item.totalPrice?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Special Requests */}
                {order.specialRequests && (
                  <div className="mb-4 p-3 bg-yellow-50 rounded-xl">
                    <p className="text-xs font-bold text-yellow-700">Special Request:</p>
                    <p className="text-sm text-yellow-600">{order.specialRequests}</p>
                  </div>
                )}

                {/* Order Total & Actions */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-lg font-bold text-gray-900">${order.total?.toFixed(2)}</p>
                  </div>
                  
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <button
                      onClick={() => updateOrderStatus(order._id, getNextStatus(order.status))}
                      className="px-4 py-2 bg-orange-600 text-white rounded-xl font-semibold text-sm flex items-center gap-2"
                    >
                      {order.status === 'ready' ? (
                        <>
                          <CheckCircle size={16} />
                          Mark Delivered
                        </>
                      ) : (
                        <>
                          <Clock size={16} />
                          Next Step
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Time Info */}
                <div className="mt-3 flex gap-4 text-xs text-gray-400">
                  <span>Ordered: {new Date(order.createdAt).toLocaleTimeString()}</span>
                  {order.estimatedPrepTime && (
                    <span>Est: {order.estimatedPrepTime} min</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

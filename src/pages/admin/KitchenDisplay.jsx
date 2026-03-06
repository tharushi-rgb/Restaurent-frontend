import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertTriangle, Bell, RefreshCw, Zap, ArrowUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSocket, joinKitchenRoom } from '../../socket';
import api from '../../api';

const statusColors = {
  received: 'border-blue-500 bg-blue-50',
  preparing: 'border-yellow-500 bg-yellow-50',
  quality_check: 'border-purple-500 bg-purple-50',
  ready: 'border-green-500 bg-green-50'
};

export default function KitchenDisplay() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchOrders();
    
    // Poll as fallback (less frequent since socket handles real-time)
    const interval = setInterval(fetchOrders, 15000);

    // Socket.IO real-time updates
    const socket = getSocket();
    joinKitchenRoom();

    socket.on('new-order', (data) => {
      toast.success(`🆕 New order: ${data.orderNumber} — Table ${data.tableNumber}`);
      fetchOrders();
    });

    socket.on('order-updated', () => {
      fetchOrders();
    });

    socket.on('order-priority-update', () => {
      fetchOrders();
    });

    socket.on('waiter-request', (data) => {
      toast(`Waiter requested — Table ${data.tableNumber}`, { duration: 8000 });
      setNotifications(prev => [...prev, {
        id: Date.now(),
        message: `Waiter requested at Table ${data.tableNumber}`,
        type: 'waiter'
      }]);
    });

    socket.on('bill-request', (data) => {
      toast(`Bill requested — Table ${data.tableNumber}`, { duration: 8000 });
      setNotifications(prev => [...prev, {
        id: Date.now(),
        message: `Bill requested at Table ${data.tableNumber}`,
        type: 'bill'
      }]);
    });

    socket.on('service-request', (data) => {
      toast(`Service request: ${data.type} — Table ${data.tableNumber}`, { duration: 8000 });
    });

    return () => {
      clearInterval(interval);
      socket.off('new-order');
      socket.off('order-updated');
      socket.off('order-priority-update');
      socket.off('waiter-request');
      socket.off('bill-request');
      socket.off('service-request');
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/active');
      setOrders(data.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const setPriority = async (orderId, priority) => {
    try {
      await api.patch(`/orders/${orderId}/priority`, { priority });
      toast.success(`Priority set to ${priority === 3 ? 'Urgent' : priority === 2 ? 'High' : 'Normal'}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update priority');
    }
  };

  const getNextStatus = (currentStatus) => {
    const flow = {
      received: 'preparing',
      preparing: 'quality_check',
      quality_check: 'ready',
      ready: 'delivered'
    };
    return flow[currentStatus];
  };

  const sortByPriority = (list) => [...list].sort((a, b) => (b.priority || 1) - (a.priority || 1));
  const groupedOrders = {
    received: sortByPriority(orders.filter(o => o.status === 'received')),
    preparing: sortByPriority(orders.filter(o => o.status === 'preparing')),
    quality_check: sortByPriority(orders.filter(o => o.status === 'quality_check')),
    ready: sortByPriority(orders.filter(o => o.status === 'ready'))
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header — matches other admin pages */}
      <div className="px-6 py-5 border-b border-gray-100 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Kitchen Display</h1>
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} active order{orders.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="px-6 py-2 bg-orange-50 border-b border-orange-200">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-orange-600" />
            <span className="text-sm font-medium text-orange-700">
              {notifications[notifications.length - 1].message}
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 p-4 grid grid-cols-4 gap-4 overflow-auto">
          {/* New Orders */}
          <div className="flex flex-col min-h-0">
            <h2 className="text-base font-bold mb-3 text-blue-600 flex items-center gap-2">
              <Clock size={18} />
              New ({groupedOrders.received.length})
            </h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {groupedOrders.received.map(order => (
                <OrderCard
                  key={order._id || order.id}
                  order={order}
                  onAction={() => updateStatus(order._id || order.id, 'preparing')}
                  onPriority={(p) => setPriority(order._id || order.id, p)}
                  actionLabel="Start"
                  statusColor={statusColors.received}
                />
              ))}
              {groupedOrders.received.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">No new orders</div>
              )}
            </div>
          </div>

          {/* Preparing */}
          <div className="flex flex-col min-h-0">
            <h2 className="text-base font-bold mb-3 text-yellow-600 flex items-center gap-2">
              <Clock size={18} />
              Preparing ({groupedOrders.preparing.length})
            </h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {groupedOrders.preparing.map(order => (
                <OrderCard
                  key={order._id || order.id}
                  order={order}
                  onAction={() => updateStatus(order._id || order.id, 'quality_check')}
                  onPriority={(p) => setPriority(order._id || order.id, p)}
                  actionLabel="Ready for QC"
                  statusColor={statusColors.preparing}
                />
              ))}
              {groupedOrders.preparing.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">Nothing preparing</div>
              )}
            </div>
          </div>

          {/* Quality Check */}
          <div className="flex flex-col min-h-0">
            <h2 className="text-base font-bold mb-3 text-purple-600 flex items-center gap-2">
              <CheckCircle size={18} />
              Quality Check ({groupedOrders.quality_check.length})
            </h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {groupedOrders.quality_check.map(order => (
                <OrderCard
                  key={order._id || order.id}
                  order={order}
                  onAction={() => updateStatus(order._id || order.id, 'ready')}
                  onPriority={(p) => setPriority(order._id || order.id, p)}
                  actionLabel="Approve"
                  statusColor={statusColors.quality_check}
                />
              ))}
              {groupedOrders.quality_check.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">No QC items</div>
              )}
            </div>
          </div>

          {/* Ready */}
          <div className="flex flex-col min-h-0">
            <h2 className="text-base font-bold mb-3 text-green-600 flex items-center gap-2">
              <CheckCircle size={18} />
              Ready ({groupedOrders.ready.length})
            </h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {groupedOrders.ready.map(order => (
                <OrderCard
                  key={order._id || order.id}
                  order={order}
                  onAction={() => updateStatus(order._id || order.id, 'delivered')}
                  onPriority={(p) => setPriority(order._id || order.id, p)}
                  actionLabel="Delivered"
                  statusColor={statusColors.ready}
                />
              ))}
              {groupedOrders.ready.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">None ready yet</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, onAction, onPriority, actionLabel, statusColor }) {
  const elapsedMinutes = Math.floor((Date.now() - new Date(order.createdAt || order.created_at).getTime()) / 60000);
  const isOverdue = elapsedMinutes > (order.estimatedPrepTime || 20);
  const priority = order.priority || 1;

  const priorityConfig = {
    1: { label: 'Normal', color: 'bg-gray-200 text-gray-600', border: '' },
    2: { label: 'High', color: 'bg-orange-500 text-white', border: 'ring-2 ring-orange-400' },
    3: { label: 'Urgent', color: 'bg-red-600 text-white', border: 'ring-2 ring-red-500 shadow-lg shadow-red-200' }
  };
  const pCfg = priorityConfig[priority] || priorityConfig[1];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-xl p-4 border-l-4 ${statusColor} ${pCfg.border} ${isOverdue ? 'animate-pulse' : ''}`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-lg">{order.orderNumber}</h3>
            {priority > 1 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${pCfg.color}`}>
                {priority === 3 ? <Zap size={10} /> : <ArrowUp size={10} />}
                {pCfg.label}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">Table {order.tableNumber}</p>
        </div>
        <div className={`text-sm font-bold ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
          {elapsedMinutes} min
        </div>
      </div>

      {/* Priority Controls */}
      <div className="flex gap-1 mb-3">
        {[1, 2, 3].map(p => (
          <button
            key={p}
            onClick={() => onPriority(p)}
            className={`flex-1 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
              priority === p
                ? p === 3 ? 'bg-red-600 text-white' : p === 2 ? 'bg-orange-500 text-white' : 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            {p === 1 ? 'Normal' : p === 2 ? 'High' : 'Urgent'}
          </button>
        ))}
      </div>

      {/* Allergy Alert */}
      {order.allergyAlerts?.length > 0 && (
        <div className="mb-2 p-2 bg-red-100 rounded-lg flex items-center gap-2">
          <AlertTriangle className="text-red-600" size={16} />
          <span className="text-xs font-bold text-red-600">
            {order.allergyAlerts.join(', ')}
          </span>
        </div>
      )}

      {/* Items */}
      <div className="space-y-1 mb-3">
        {order.items?.map((item, idx) => (
          <div key={idx} className="text-sm text-gray-800">
            <span className="font-bold">{item.quantity}x</span>{' '}
            {item.menuItem?.name}
            {item.customizations?.portion === 'Large' && (
              <span className="text-orange-600 font-bold"> (L)</span>
            )}
            {item.customizations?.removedIngredients?.length > 0 && (
              <span className="text-red-500 text-xs block pl-4">
                No: {item.customizations.removedIngredients.join(', ')}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Special Requests */}
      {order.specialRequests && (
        <div className="mb-3 p-2 bg-yellow-100 rounded-lg">
          <p className="text-xs text-yellow-700">{order.specialRequests}</p>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={onAction}
        className="w-full py-2 bg-gray-900 text-white rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors"
      >
        {actionLabel}
      </button>
    </motion.div>
  );
}

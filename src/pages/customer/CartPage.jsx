import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ShoppingCart, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore, useAuthStore, useOrderStore } from '../../store';
import api from '../../api';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, getTotal, clearCart, tableNumber } = useCartStore();
  const { user } = useAuthStore();
  const { setCurrentOrder } = useOrderStore();
  const [loading, setLoading] = useState(false);

  const total = getTotal();
  const tax = total * 0.1;
  const grandTotal = total + tax;

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map(item => ({
        menuItemId: item.dishId,
        quantity: item.quantity,
        customizations: {
          portion: item.customizations?.portion || 'Standard',
          spiceLevel: item.customizations?.spiceLevel || 0,
          removedIngredients: item.customizations?.removedIngredients || [],
          specialInstructions: item.customizations?.specialInstructions || ''
        }
      }));

      const { data } = await api.post('/orders', {
        tableNumber: tableNumber || 1,
        items: orderItems,
        guestName: user?.name || `Table ${tableNumber || 1}`
      });

      setCurrentOrder(data.order);
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/order-status');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center max-w-md mx-auto">
        <button onClick={() => navigate('/menu')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-gray-900 ml-2">Your Cart</h1>
      </header>

      <div className="pt-20 px-4 pb-48">
        <h2 className="text-2xl font-bold mb-6">Your Order</h2>
        
        {items.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <ShoppingCart size={32} />
            </div>
            <p className="text-gray-400">Your cart is empty</p>
            <button 
              onClick={() => navigate('/menu')}
              className="mt-4 text-orange-600 font-semibold"
            >
              Browse Menu
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {items.map(item => {
              const priceMultiplier = item.customizations?.portion === 'Large' ? 1.5 : 1;
              const itemTotal = item.price * priceMultiplier * item.quantity;
              
              return (
                <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex gap-4">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-20 h-20 rounded-xl object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-900">{item.name}</h4>
                      <button 
                        onClick={() => removeItem(item.id)} 
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      x{item.quantity} • ${itemTotal.toFixed(2)}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-md">
                        Portion: {item.customizations?.portion || 'Standard'}
                      </span>
                      <span className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-md">
                        Spice: {['Mild', 'Medium', 'Hot', 'Fire'][item.customizations?.spiceLevel || 0]}
                      </span>
                      {item.customizations?.removedIngredients?.map(ing => (
                        <span key={ing} className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-md">
                          No {ing}
                        </span>
                      ))}
                    </div>
                    {item.customizations?.specialInstructions && (
                      <p className="text-[11px] text-gray-500 italic mt-1.5 bg-yellow-50 px-2 py-1 rounded-lg">
                        📝 {item.customizations.specialInstructions}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Fixed Bottom */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 max-w-md mx-auto">
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-gray-500 font-medium">Total</span>
              <span className="text-2xl font-black text-gray-900">${grandTotal.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Placing Order...
              </>
            ) : (
              'Place Order'
            )}
          </button>
        </div>
      )}
    </div>
  );
}

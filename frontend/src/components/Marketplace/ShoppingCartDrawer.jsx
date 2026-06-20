import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, IndianRupee, Minus, Plus, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '../../services/supabase/client';
import { useAuth } from '../../context/AuthContext';

export default function ShoppingCartDrawer({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem,
  onClearCart
}) {
  const { user } = useAuth();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const subtotal = cartItems.reduce((acc, item) => acc + ((item.price || item.currentPrice) * item.quantity), 0);

  const handlePlaceOrder = async () => {
    if (!user) {
      alert("Please log in to place an order.");
      return;
    }

    setIsPlacingOrder(true);
    try {
      const ordersToInsert = cartItems.map(item => ({
        product_id: item.id,
        farmer_id: user.id,
        seller_id: item.seller_id,
        quantity: item.quantity,
        total_amount: (item.price || item.currentPrice) * item.quantity,
        status: 'Pending'
      }));

      const { error } = await supabase
        .from('seller_orders')
        .insert(ordersToInsert);

      if (error) throw error;

      setOrderSuccess(true);
      if (onClearCart) onClearCart();
      
      setTimeout(() => {
        setOrderSuccess(false);
        onClose();
      }, 3000);
      
    } catch (err) {
      console.error("Error placing order:", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[110] bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-md"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-[120] w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800"
          >
            {/* Header */}
            <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 text-green-400 rounded-xl border border-green-500/20 shadow-inner">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white leading-tight tracking-tight">Your Cart</h2>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{cartItems.length} items</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-slate-950/50">
              {orderSuccess ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
                    className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6"
                  >
                    <CheckCircle2 className="w-12 h-12" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Order Placed!</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">The seller has been notified and will contact you shortly.</p>
                </div>
              ) : cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <ShoppingCart className="w-20 h-20 mb-6 opacity-20" />
                  <p className="font-bold text-xl text-slate-600 dark:text-slate-400 mb-3 tracking-tight">Your cart is empty</p>
                  <p className="text-base text-center max-w-xs mb-8 leading-relaxed">Looks like you haven't added any agricultural products to your cart yet.</p>
                  <button 
                    onClick={onClose}
                    className="px-8 py-4 bg-white dark:bg-slate-800 text-green-600 dark:text-green-400 border border-slate-200 dark:border-slate-700 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-5 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                    <img 
                      src={item.image_urls?.[0] || item.image_url || item.imageUrl || 'https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?w=400'} 
                      alt={item.name} 
                      className="w-24 h-24 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                    <div className="flex-1 flex flex-col">
                      <h4 className="font-bold text-slate-900 dark:text-slate-200 line-clamp-2 mb-2 text-base leading-tight">{item.name}</h4>
                      <p className="text-base font-bold text-slate-900 dark:text-white flex items-center mb-4">
                        <IndianRupee className="w-4 h-4 mr-0.5 text-green-600 dark:text-green-400" />
                        {item.price || item.currentPrice}
                      </p>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-inner">
                          <button 
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center text-sm font-bold bg-white dark:bg-slate-900 py-1.5 text-slate-900 dark:text-white border-l border-r border-slate-200 dark:border-slate-700">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button 
                          onClick={() => onRemoveItem(item.id)}
                          className="p-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && !orderSuccess && (
              <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.3)]">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-sm">Total Amount</span>
                  <span className="text-3xl font-display font-bold text-slate-900 dark:text-white flex items-center tracking-tight">
                    <IndianRupee className="w-6 h-6 mr-1 text-green-600 dark:text-green-400" />
                    {subtotal.toLocaleString()}
                  </span>
                </div>
                <button 
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className="w-full py-5 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-3 group hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {isPlacingOrder ? (
                    <><Loader2 className="w-6 h-6 animate-spin" /> Processing...</>
                  ) : (
                    <>
                      Place Order
                      <CheckCircle2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </>
                  )}
                </button>
                <p className="text-xs text-center text-slate-500 mt-4">By placing this order, you agree to directly contact the seller for fulfillment.</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

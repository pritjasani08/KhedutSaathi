import { motion, AnimatePresence } from 'framer-motion';
import { X, IndianRupee, Star, ShoppingCart, Heart, ShieldCheck, Truck } from 'lucide-react';

export default function ProductDetailsModal({ product, onClose }) {
  if (!product) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Product Image */}
          <div className="md:w-1/2 bg-slate-100 relative min-h-[300px] flex items-center justify-center">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-8xl">🌱</span>
            )}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl text-sm font-bold text-primary shadow-sm">
              {product.category}
            </div>
          </div>

          {/* Product Details */}
          <div className="md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-slate-500">{product.brand || 'Premium Quality'}</span>
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded text-amber-600 text-xs font-bold">
                <Star className="w-3 h-3 fill-amber-500" />
                {product.rating}
              </div>
            </div>

            <h2 className="font-display text-3xl font-bold text-slate-800 mb-4">{product.name}</h2>
            
            <div className="flex items-end gap-2 mb-6">
              <div className="flex items-center font-display text-3xl font-bold text-primary">
                <IndianRupee className="w-6 h-6 mr-1" />
                {product.price}
              </div>
              {product.stock > 0 ? (
                <span className="text-sm font-medium text-green-600 mb-1 ml-2">In Stock ({product.stock})</span>
              ) : (
                <span className="text-sm font-medium text-red-500 mb-1 ml-2">Out of Stock</span>
              )}
            </div>

            <div className="prose prose-sm text-slate-600 mb-8">
              <h4 className="text-slate-800 font-semibold mb-2">Description</h4>
              <p>{product.description || 'No detailed description available for this product yet. It is sourced carefully to ensure the best results for your farm.'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-slate-700">Verified Quality</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Truck className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-slate-700">Fast Delivery</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto flex gap-4 pt-4 border-t border-slate-100">
              <button 
                disabled={product.stock <= 0}
                className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 text-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button className="p-3 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors">
                <Heart className="w-6 h-6" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

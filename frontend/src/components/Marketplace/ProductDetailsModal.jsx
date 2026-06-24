import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, IndianRupee, Star, ShoppingCart, Heart, ShieldCheck, PhoneCall, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function ProductDetailsModal({ product, onClose, onAddToCart }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavourited, setIsFavourited] = useState(false);

  const images = product?.image_urls?.length > 0 
    ? product.image_urls 
    : [product?.image_url || product?.imageUrl || 'https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?w=400'];

  const handlePrev = () => {
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (images.length <= 1) return;
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length]);

  if (!product) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] border border-slate-200 dark:border-slate-800"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 bg-white/90 dark:bg-slate-800/90 shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="md:w-1/2 bg-slate-50 dark:bg-slate-950 relative min-h-[300px] flex flex-col overflow-hidden p-6">
            <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner bg-slate-100 dark:bg-slate-900 mb-4 group">
              <AnimatePresence initial={false}>
                <motion.img 
                  key={activeImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={images[activeImageIndex]} 
                  alt={product.name}
                  className="w-full h-full object-cover opacity-90 absolute inset-0"
                />
              </AnimatePresence>
              <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 backdrop-blur px-3 py-1.5 rounded-xl text-sm font-bold text-green-600 dark:text-green-400 shadow-sm z-10">
                {product.category}
              </div>
              {product.discountPercentage > 0 && (
                <div className="absolute top-4 left-32 bg-red-500 text-white px-3 py-1.5 rounded-xl text-sm font-bold shadow-sm z-10">
                  {product.discountPercentage}% OFF
                </div>
              )}

              {images.length > 1 && (
                <>
                  <div className="absolute bottom-4 right-4 bg-slate-900/70 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm z-10 tracking-widest">
                    {activeImageIndex + 1} / {images.length}
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 border border-slate-200 dark:border-slate-700 hover:scale-110"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 border border-slate-200 dark:border-slate-700 hover:scale-110"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            
            {/* Image Carousel Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={cn(
                      "w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all",
                      activeImageIndex === idx ? "border-green-500 shadow-lg shadow-green-500/20" : "border-slate-300 dark:border-slate-800 opacity-50 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg">{product.seller?.full_name || product.brand || 'Verified Seller'}</span>
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg text-amber-500 dark:text-amber-400 text-xs font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                {product.rating || '4.5'} <span className="text-slate-500 font-medium">({product.reviewsCount || '12'} reviews)</span>
              </div>
            </div>

            <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">{product.name}</h2>
            
            <div className="flex flex-wrap items-end gap-4 mb-8 border-b border-slate-200 dark:border-slate-800 pb-8">
              <div className="flex items-center font-display text-4xl font-bold text-slate-900 dark:text-white">
                <IndianRupee className="w-8 h-8 mr-1 text-green-600 dark:text-green-400" />
                {product.price || product.currentPrice}
                {product.unit && <span className="text-lg text-slate-500 ml-2 font-normal">/ {product.unit}</span>}
              </div>
              {product.discountPercentage > 0 && (
                <span className="text-lg font-medium text-slate-500 line-through mb-1.5 flex items-center">
                  <IndianRupee className="w-4 h-4 mr-0.5" />
                  {product.originalPrice}
                </span>
              )}
              {product.stock > 0 ? (
                <span className="text-sm font-bold text-green-400 mb-2 ml-auto bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
                  In Stock: {product.stock}
                </span>
              ) : (
                <span className="text-sm font-bold text-red-400 mb-2 ml-auto bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">
                  Out of Stock
                </span>
              )}
            </div>

            <div className="prose prose-sm dark:prose-invert mb-10 max-w-none text-slate-600 dark:text-slate-300">
              <p className="text-base leading-relaxed">{product.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10 mt-auto">
              <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
                  <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium block uppercase tracking-wider mb-0.5">Sold by</span>
                  <span className="text-base font-bold text-slate-900 dark:text-slate-200">{product.seller?.full_name || 'Verified Seller'}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
                  <PhoneCall className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium block uppercase tracking-wider mb-0.5">Contact</span>
                  <span className="text-base font-bold text-slate-900 dark:text-slate-200">Direct Message</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button 
                disabled={product.stock <= 0}
                onClick={() => { onAddToCart(product); onClose(); }}
                className="flex-1 py-5 bg-green-600 hover:bg-green-500 text-white rounded-2xl flex items-center justify-center gap-3 text-lg font-bold shadow-lg shadow-green-600/20 transition-all hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 group"
              >
                <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                Add to Cart
              </button>
              <button 
                onClick={() => setIsFavourited(!isFavourited)}
                className={cn(
                  "px-6 py-5 border rounded-2xl transition-all shadow-sm flex items-center justify-center",
                  isFavourited 
                    ? "border-red-500/50 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" 
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:border-red-500/50 hover:bg-red-50 dark:hover:bg-red-500/10"
                )}
              >
                <Heart className={cn("w-6 h-6", isFavourited && "fill-current")} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

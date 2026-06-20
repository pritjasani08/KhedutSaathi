import { motion } from 'framer-motion';
import { IndianRupee, Star, ShoppingCart, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ProductCard({ product, onClick }) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="glass-card flex flex-col h-full overflow-hidden cursor-pointer group"
      onClick={() => onClick(product)}
    >
      {/* Product Image */}
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-200 text-slate-400">
            🌱
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-bold text-primary shadow-sm">
          {product.category}
        </div>
        
        {/* Wishlist Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); /* Add to wishlist logic */ }}
          className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white backdrop-blur rounded-full text-slate-400 hover:text-red-500 transition-colors shadow-sm"
        >
          <Heart className="w-4 h-4" />
        </button>

        {/* Stock Status */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-display font-bold text-lg text-body line-clamp-1">{product.name}</h3>
          <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded text-amber-600 text-xs font-bold">
            <Star className="w-3 h-3 fill-amber-500" />
            {product.rating}
          </div>
        </div>
        
        <p className="text-sm text-slate-500 mb-4">{product.brand || 'Local Brand'}</p>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center font-bold text-lg text-slate-800">
            <IndianRupee className="w-4 h-4 mr-0.5 text-slate-500" />
            {product.price}
          </div>
          
          <button 
            onClick={(e) => { e.stopPropagation(); /* Add to cart logic */ }}
            disabled={product.stock <= 0}
            className={`p-2 rounded-xl transition-all ${
              product.stock > 0 
                ? 'bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

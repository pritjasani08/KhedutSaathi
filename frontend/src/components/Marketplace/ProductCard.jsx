import { useState } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function ProductCard({ product, onClick, onAddToCart }) {
  const [isFavourited, setIsFavourited] = useState(false);

  return (
    <div
      className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group h-full relative"
    >
      {/* Quick View Button on Hover */}
      <div className="absolute inset-x-0 top-[110px] -translate-y-1/2 z-20 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
        <button 
          onClick={(e) => { e.stopPropagation(); onClick(product); }}
          className="bg-slate-900/90 backdrop-blur text-white font-bold px-6 py-2.5 rounded-xl shadow-lg border border-slate-700 hover:bg-green-600 hover:border-green-500 transition-colors flex items-center gap-2"
        >
          <Eye className="w-4 h-4" /> Quick View
        </button>
      </div>

      {/* Image Area */}
      <div className="relative h-56 bg-slate-900 overflow-hidden cursor-pointer flex-shrink-0" onClick={() => onClick(product)}>
        <img 
          src={product.image_urls?.[0] || product.image_url || product.imageUrl || 'https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?w=400'} 
          alt={product.name}
          className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.discountPercentage > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
              {product.discountPercentage}% OFF
            </span>
          )}
          <span className="bg-slate-900/80 backdrop-blur text-green-400 border border-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
            {product.category}
          </span>
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); setIsFavourited(!isFavourited); }}
          className={cn(
            "absolute top-3 right-3 p-2.5 bg-slate-900/80 border border-slate-700 backdrop-blur hover:bg-slate-800 rounded-full transition-all shadow-sm opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 duration-300 z-10",
            isFavourited ? 'text-red-400' : 'text-slate-400'
          )}
        >
          <Heart className={cn("w-4 h-4", isFavourited && "fill-current")} />
        </button>

        {/* Stock Overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-slate-900 text-slate-300 font-bold px-4 py-1.5 rounded-full text-sm shadow-lg border border-slate-700">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-1 bg-slate-800">
        <div className="flex justify-between items-start mb-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{product.seller?.full_name || product.brand || 'Verified Seller'}</p>
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-amber-400 text-xs font-bold">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {product.rating} <span className="text-slate-500">({product.reviewsCount})</span>
          </div>
        </div>

        <h3 
          className="font-display font-bold text-white text-lg leading-tight line-clamp-2 mb-3 group-hover:text-green-400 transition-colors cursor-pointer"
          onClick={() => onClick(product)}
        >
          {product.name}
        </h3>
        
        <p className="text-sm text-slate-400 line-clamp-2 mb-6 flex-1">
          {product.description || product.shortDescription}
        </p>

        {/* Pricing & Actions */}
        <div className="flex items-end justify-between mt-auto pt-4 border-t border-slate-700">
          <div>
            {product.discountPercentage > 0 && (
              <p className="text-xs font-medium text-slate-500 line-through flex items-center mb-0.5">
                <IndianRupee className="w-3 h-3" />
                {product.originalPrice}
              </p>
            )}
            <p className="text-xl font-bold text-white flex items-center">
              <IndianRupee className="w-5 h-5 mr-0.5 text-green-400" />
              {product.price || product.currentPrice}
              {product.unit && <span className="text-sm text-slate-500 font-normal ml-1">/ {product.unit}</span>}
            </p>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
              disabled={product.stock === 0}
              className={cn(
                "p-3 rounded-xl transition-all flex items-center justify-center group/btn",
                product.stock > 0 
                  ? "bg-green-600 text-white hover:bg-green-500 shadow-md" 
                  : "bg-slate-700 text-slate-500 cursor-not-allowed"
              )}
            >
              <ShoppingCart className="w-5 h-5 transition-transform group-hover/btn:scale-110" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { PackageX } from 'lucide-react';
import ProductCard from './ProductCard';

export default function ProductGrid({ 
  products, 
  loading, 
  onProductClick, 
  onAddToCart,
  onClearFilters
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="animate-pulse bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 h-96 overflow-hidden flex flex-col">
            <div className="h-56 bg-slate-200 dark:bg-slate-700" />
            <div className="p-5 flex-1 flex flex-col gap-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full mt-auto" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 shadow-sm">
        <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-200 dark:border-slate-700">
          <PackageX className="w-12 h-12 text-slate-500" />
        </div>
        <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-2">No products found</h3>
        <p className="text-slate-600 dark:text-slate-400 text-center max-w-sm mb-8">
          We couldn't find any products matching your current filters or search query.
        </p>
        <button 
          onClick={onClearFilters}
          className="px-8 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-xl font-bold transition-all shadow-sm"
        >
          Clear All Filters
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden" animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch"
    >
      {products.map((product) => (
        <motion.div
          key={product.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          className="flex"
        >
          <div className="w-full flex">
            <ProductCard 
              product={product} 
              onClick={onProductClick} 
              onAddToCart={onAddToCart}
            />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { PackageX } from 'lucide-react';
import ProductCard from './ProductCard';
import EmptyState from '../shared/EmptyState';

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
      <EmptyState 
        icon={PackageX}
        title="No products found"
        description="We couldn't find any products matching your current filters or search query."
        variant="page"
        action={
          <button 
            onClick={onClearFilters}
            className="btn-secondary"
          >
            Clear All Filters
          </button>
        }
      />
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

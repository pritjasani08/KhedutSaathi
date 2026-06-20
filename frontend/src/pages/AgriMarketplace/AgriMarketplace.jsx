import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Loader2, PackageX } from 'lucide-react';
import { getProducts } from '../../services/supabase/marketplaceService';
import ProductCard from '../../components/Marketplace/ProductCard';
import ProductDetailsModal from '../../components/Marketplace/ProductDetailsModal';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

const categories = [
  'All',
  'Seeds',
  'Fertilizers',
  'Pesticides',
  'Bio Fertilizers',
  'Farm Equipment',
  'Irrigation',
  'Organic Products',
  'Animal Feed'
];

export default function AgriMarketplace() {
  const { t } = useTranslation();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [minRating, setMinRating] = useState(0);
  
  // UI states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts({
        searchQuery,
        category: selectedCategory,
        priceRange,
        minRating
      });
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedCategory, priceRange, minRating]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header & Search */}
      <motion.div 
        initial="hidden" animate="visible" variants={fadeUp}
        className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-800">Agriculture Marketplace</h1>
          <p className="text-slate-500 mt-1">Find the best supplies for your farm</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <button 
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="md:hidden p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-600"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filter Sidebar */}
        <motion.aside 
          initial="hidden" animate="visible" variants={fadeUp} custom={1}
          className={`${showFiltersMobile ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0 space-y-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-fit`}
        >
          <div className="flex items-center gap-2 font-display font-bold text-lg text-slate-800 mb-4 pb-4 border-b border-slate-100">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
            Filters
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Categories</h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    selectedCategory === cat 
                      ? 'bg-primary/10 text-primary font-bold' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Max Price</h3>
            <input 
              type="range" 
              min="100" max="100000" step="100"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([0, Number(e.target.value)])}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
              <span>₹0</span>
              <span>₹{priceRange[1].toLocaleString()}</span>
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Min Rating</h3>
            <div className="flex gap-2">
              {[0, 3, 4, 4.5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setMinRating(rating)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    minRating === rating 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {rating === 0 ? 'All' : `${rating}+`}
                </button>
              ))}
            </div>
          </div>
        </motion.aside>

        {/* Main Product Grid */}
        <main className="flex-1">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p className="text-slate-500 font-medium">Loading products...</p>
            </div>
          ) : products.length > 0 ? (
            <motion.div 
              initial="hidden" animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onClick={setSelectedProduct} 
                />
              ))}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-dashed border-slate-200">
              <PackageX className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="font-display text-xl font-bold text-slate-700 mb-2">No products available</h3>
              <p className="text-slate-500 text-center max-w-sm">
                We couldn't find any products matching your current filters. Try adjusting your search or clearing filters.
              </p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setPriceRange([0, 100000]);
                  setMinRating(0);
                }}
                className="mt-6 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}

import { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { supabase } from '../../services/supabase/client';

// Section Imports
import MarketplaceHeroSection from '../../components/Marketplace/MarketplaceHeroSection';
import FilterSidebar from '../../components/Marketplace/FilterSidebar';
import ProductGrid from '../../components/Marketplace/ProductGrid';

// Overlays
import ProductDetailsModal from '../../components/Marketplace/ProductDetailsModal';
import ShoppingCartDrawer from '../../components/Marketplace/ShoppingCartDrawer';

const MARKETPLACE_CATEGORIES = [
  { id: 1, name: 'Seeds', icon: 'Sprout' },
  { id: 2, name: 'Fertilizers', icon: 'FlaskConical' },
  { id: 3, name: 'Pesticides', icon: 'Bug' },
  { id: 4, name: 'Equipment', icon: 'Tractor' },
  { id: 5, name: 'Irrigation', icon: 'Droplets' },
  { id: 6, name: 'Organic Product', icon: 'Leaf' }
];

export default function AgriMarketplace() {
  const [loading, setLoading] = useState(true);
  
  // Dynamic Data State
  const [products, setProducts] = useState([]);
  
  // Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState(5000);
  const [sortBy, setSortBy] = useState('newest');

  // UI State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  
  // Wishlist Context
  const { wishlistCount } = useWishlist();

  // Fetch from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('seller_products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
      } else if (data) {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (p.seller?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesPrice = (p.price || 0) <= maxPrice;
      
      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Apply Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        break;
      case 'popular':
        result.sort((a, b) => String(a.id || '').localeCompare(String(b.id || '')));
        break;
      case 'newest':
      default:
        result.sort((a, b) => {
          const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return timeB - timeA;
        });
        break;
    }

    return result;
  }, [products, searchQuery, selectedCategory, maxPrice, sortBy]);

  // Cart Handlers
  const handleAddToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
  };

  const handleRemoveItem = (id) => setCartItems(prev => prev.filter(item => item.id !== id));

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-300 font-sans selection:bg-green-500/30 selection:text-green-200">
      {/* Floating Cart Button */}
      <button 
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-[90] bg-green-600 hover:bg-green-500 text-white p-4 rounded-full shadow-lg shadow-green-900/50 transition-all hover:scale-110 hover:-translate-y-1 flex items-center justify-center group border border-green-500/50"
      >
        <ShoppingCart className="w-6 h-6" />
        {cartItemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-sm">
            {cartItemCount}
          </span>
        )}
      </button>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        
        {/* 1. Hero Section */}
        <MarketplaceHeroSection 
          onSearch={setSearchQuery} 
        />

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-16">
          {/* Left Filter Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <FilterSidebar 
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                categories={MARKETPLACE_CATEGORIES}
              />
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Browse Products</h2>
                <span className="text-sm font-bold text-green-400 bg-green-500/10 px-4 py-1.5 rounded-xl border border-green-500/20">
                  {filteredProducts.length} Results
                </span>
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto">
                {/* Wishlist Link */}
                <Link 
                  to="/wishlist" 
                  className="group flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shrink-0"
                >
                  <Heart className="w-[18px] h-[18px] text-rose-500 dark:text-rose-400 group-hover:scale-110 group-hover:fill-rose-500/20 transition-all" />
                  <span className="relative">
                    My Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-500/50 group-hover:w-full transition-all duration-300"></span>
                  </span>
                </Link>

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

                {/* Sort By Dropdown */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap hidden sm:block">Sort By:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full sm:w-auto bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/50 cursor-pointer font-medium appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-chevron-down'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '16px 16px',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>
            </div>

            <ProductGrid 
              products={filteredProducts} 
              loading={loading}
              onProductClick={setSelectedProduct}
              onAddToCart={handleAddToCart}
              onClearFilters={handleClearFilters}
            />
          </main>
        </div>

      </div>

      {/* Product Details Modal */}
      <ProductDetailsModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Shopping Cart Drawer */}
      <ShoppingCartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCartItems([])}
      />
    </div>
  );
}

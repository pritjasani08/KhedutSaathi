import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import ProductGrid from '../../components/Marketplace/ProductGrid';
import ProductDetailsModal from '../../components/Marketplace/ProductDetailsModal';
import ShoppingCartDrawer from '../../components/Marketplace/ShoppingCartDrawer';

export default function Wishlist() {
  const { wishlistItems } = useWishlist();
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Basic Cart State for the wishlist page to support Add to Cart functionality
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            to="/agri-marketplace"
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </Link>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
            My Wishlist
          </h1>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 shadow-sm mt-8">
            <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mb-6 shadow-inner border border-rose-100 dark:border-rose-900/50">
              <Heart className="w-12 h-12 text-rose-300 dark:text-rose-800" />
            </div>
            <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-2">No products in your wishlist yet</h3>
            <p className="text-slate-600 dark:text-slate-400 text-center max-w-sm mb-8">
              Explore the marketplace and save your favorite products to view them later.
            </p>
            <Link 
              to="/agri-marketplace"
              className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <ShoppingBag className="w-5 h-5" />
              Browse Products
            </Link>
          </div>
        ) : (
          <main className="mt-8">
            <ProductGrid 
              products={wishlistItems} 
              loading={false}
              onProductClick={setSelectedProduct}
              onAddToCart={handleAddToCart}
              onClearFilters={() => {}}
            />
          </main>
        )}
      </div>

      <ProductDetailsModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

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

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

const WishlistContext = createContext();

export function useWishlist() {
  return useContext(WishlistContext);
}

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem('khedutsaathi_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse wishlist from local storage', e);
      return [];
    }
  });

  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem('khedutsaathi_wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToast({ message, type, id });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 3000);
  };

  const toggleWishlist = (product) => {
    setWishlistItems((prev) => {
      const isExisting = prev.find((item) => item.id === product.id);
      if (isExisting) {
        showToast('Product removed from Wishlist', 'removed');
        return prev.filter((item) => item.id !== product.id);
      } else {
        showToast('Product added to Wishlist', 'success');
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isInWishlist, wishlistCount }}>
      {children}
      
      {/* Toast Notification UI */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md ${
              toast.type === 'success' 
                ? 'bg-green-50/90 dark:bg-green-900/80 border-green-200 dark:border-green-800 text-green-800 dark:text-green-100'
                : 'bg-rose-50/90 dark:bg-rose-900/80 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-100'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-500 dark:text-rose-400" />
            )}
            <span className="text-sm font-semibold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </WishlistContext.Provider>
  );
}

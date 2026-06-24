import { SlidersHorizontal } from 'lucide-react';

export default function FilterSidebar({ 
  selectedCategory, setSelectedCategory,
  maxPrice = 5000, setMaxPrice,
  categories = [],
  isMobileDrawer = false 
}) {
  return (
    <div className={`space-y-8 ${isMobileDrawer ? 'p-6' : ''}`}>
      {!isMobileDrawer && (
        <div className="flex items-center gap-3 font-display font-bold text-xl text-slate-900 dark:text-white mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <SlidersHorizontal className="w-5 h-5 text-green-400" />
          </div>
          Filters
        </div>
      )}

      {/* Categories Filter */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest">Categories</h3>
        <div className="space-y-1.5">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              selectedCategory === 'All' 
                ? 'bg-slate-100 dark:bg-slate-800 text-green-600 dark:text-green-400 font-bold border border-slate-200 dark:border-slate-700 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id || cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between group ${
                selectedCategory === cat.name 
                  ? 'bg-slate-100 dark:bg-slate-800 text-green-600 dark:text-green-400 font-bold border border-slate-200 dark:border-slate-700 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest">Price Range</h3>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Max Price</span>
            <span className="text-sm font-bold text-green-600 dark:text-green-400">₹{maxPrice}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="5000" 
            step="100"
            value={maxPrice}
            onChange={(e) => setMaxPrice && setMaxPrice(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-green-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            <span>₹0</span>
            <span>₹5,000</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { SlidersHorizontal } from 'lucide-react';

export default function FilterSidebar({ 
  selectedCategory, setSelectedCategory,
  categories = [],
  isMobileDrawer = false 
}) {
  return (
    <div className={`space-y-8 ${isMobileDrawer ? 'p-6' : ''}`}>
      {!isMobileDrawer && (
        <div className="flex items-center gap-3 font-display font-bold text-xl text-white mb-6 pb-6 border-b border-slate-800">
          <div className="p-2 bg-slate-800 rounded-lg">
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
                ? 'bg-slate-800 text-green-400 font-bold border border-slate-700 shadow-sm' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
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
                  ? 'bg-slate-800 text-green-400 font-bold border border-slate-700 shadow-sm' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

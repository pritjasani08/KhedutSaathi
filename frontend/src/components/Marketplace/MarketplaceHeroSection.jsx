import { Search, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MarketplaceHeroSection({ onSearch }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-900/50 border border-slate-800 text-white mb-12 flex flex-col justify-center py-16 px-6 lg:px-20 items-center text-center">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-5xl font-display font-bold leading-[1.1] mb-8 tracking-tight text-white"
      >
        Buy and Sell <span className="text-green-500">Agricultural</span> Products
      </motion.h1>
      
      {/* Search Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-3xl bg-slate-800 border border-slate-700 p-2 rounded-2xl flex flex-col sm:flex-row items-center shadow-lg gap-2"
      >
        <div className="flex-1 flex items-center px-4 w-full">
          <Search className="w-6 h-6 text-slate-400 mr-3" />
          <input 
            type="text"
            placeholder="Search for seeds, tractors, or fertilizers..."
            className="w-full bg-transparent border-none focus:outline-none text-white placeholder-slate-400 py-4 text-lg"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <button className="w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white px-10 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm group">
          Search
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>

      {/* Quick Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap items-center justify-center gap-3 mt-8 text-sm text-slate-400 font-medium"
      >
        <span className="mr-2">Quick Find:</span>
        {['Seeds', 'Fertilizers', 'Pesticides', 'Equipment', 'Irrigation', 'Organic Products'].map(tag => (
          <button key={tag} onClick={() => onSearch(tag)} className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 hover:text-white transition-all border border-slate-700 cursor-pointer">
            {tag}
          </button>
        ))}
      </motion.div>
    </section>
  );
}

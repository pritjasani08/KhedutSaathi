import { Search, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MarketplaceHeroSection({ onSearch }) {
  return (
    <section className="relative w-full flex flex-col justify-center pt-16 pb-16 px-4 items-center text-center">
      {/* Ambient Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] md:w-[600px] h-[300px] md:h-[400px] bg-green-500/15 dark:bg-green-500/10 blur-[100px] md:blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 text-sm font-semibold mb-12 relative z-10"
      >
        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
        Marketplace is Live
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl md:text-6xl lg:text-7xl font-display font-extrabold leading-[1.1] mb-8 tracking-tight text-slate-900 dark:text-white max-w-4xl relative z-10"
      >
        Buy and Sell <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-400">Agricultural</span> Products
      </motion.h1>
      
      {/* Search Bar - Glassmorphism */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="w-full max-w-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 p-2.5 rounded-3xl flex flex-col sm:flex-row items-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] gap-2 relative z-20 hover:shadow-[0_8px_30px_rgb(22,163,74,0.1)] transition-shadow duration-500"
      >
        <div className="flex-1 flex items-center px-5 w-full">
          <Search className="w-6 h-6 text-slate-400 mr-3 shrink-0" />
          <input 
            type="text"
            placeholder="Search for seeds, tractors, or fertilizers..."
            className="w-full bg-transparent border-none focus:outline-none text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 py-4 text-lg font-medium"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <button className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm group shrink-0">
          Search
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>

      {/* Quick Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex flex-wrap items-center justify-center gap-3 mt-10 text-sm font-medium relative z-10"
      >
        <span className="text-slate-500 dark:text-slate-400 mr-2">Popular:</span>
        {['Seeds', 'Fertilizers', 'Pesticides', 'Equipment', 'Irrigation', 'Organic Products'].map(tag => (
          <button 
            key={tag} 
            onClick={() => onSearch(tag)} 
            className="px-5 py-2.5 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            {tag}
          </button>
        ))}
      </motion.div>
    </section>
  );
}

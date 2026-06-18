import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
  }),
};

export default function NewsCard({ title, date, category, excerpt, image, index = 0 }) {
  return (
    <motion.div variants={fadeUp} custom={index} className="glass-card overflow-hidden card-hover group flex flex-col h-full">
      <div className="relative h-48 overflow-hidden">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
            <span className="text-slate-400 dark:text-slate-500 text-4xl">📰</span>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-surface/90 dark:bg-slate-800/90 backdrop-blur-sm text-primary text-xs font-bold rounded-full">
            {category}
          </span>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-3">
          <Calendar className="w-4 h-4" />
          <span>{date}</span>
        </div>
        
        <h3 className="font-display text-xl font-bold text-body mb-3 line-clamp-2">
          {title}
        </h3>
        
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-5 flex-1 line-clamp-3">
          {excerpt}
        </p>
        
        <button className="text-primary font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all duration-300 mt-auto">
          Read More
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </div>
    </motion.div>
  );
}

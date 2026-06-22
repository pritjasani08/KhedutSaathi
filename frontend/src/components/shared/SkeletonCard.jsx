import { motion } from 'framer-motion';

export default function SkeletonCard({ index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="glass-card overflow-hidden flex flex-col h-full bg-surface/50"
    >
      {/* Image Skeleton */}
      <div className="relative h-48 bg-slate-200 dark:bg-slate-800 animate-pulse">
        {/* Badge Skeleton */}
        <div className="absolute top-4 left-4 w-20 h-6 bg-slate-300 dark:bg-slate-700 rounded-full" />
      </div>
      
      <div className="p-6 flex flex-col flex-1 gap-4">
        {/* Date/Source Skeleton */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
          <div className="w-24 h-3 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
        </div>
        
        {/* Title Skeleton (2 lines) */}
        <div className="space-y-2 mt-1">
          <div className="w-full h-5 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
          <div className="w-4/5 h-5 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
        </div>
        
        {/* Excerpt Skeleton (3 lines) */}
        <div className="space-y-2 mt-2 flex-1">
          <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
          <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
          <div className="w-2/3 h-3 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
        </div>
        
        {/* Button Skeleton */}
        <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse mt-auto" />
      </div>
    </motion.div>
  );
}

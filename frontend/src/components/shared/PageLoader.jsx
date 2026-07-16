import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/**
 * PageLoader — Shared UI Primitive
 * 
 * Standardized loading state for full pages or main content areas.
 * 
 * Props:
 *   message    {string}  — Optional text to display below the spinner
 *   fullScreen {boolean} — If true, uses fixed positioning to cover the entire viewport
 *   className  {string}  — Optional CSS classes
 */
export default function PageLoader({ 
  message = 'Loading...', 
  fullScreen = false,
  className = '' 
}) {
  const containerClasses = fullScreen 
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'
    : `flex flex-col items-center justify-center py-20 w-full h-full min-h-[300px] ${className}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={containerClasses}
    >
      <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
      {message && (
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          {message}
        </p>
      )}
    </motion.div>
  );
}

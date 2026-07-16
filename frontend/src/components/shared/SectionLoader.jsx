import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/**
 * SectionLoader — Shared UI Primitive
 * 
 * Localized loading state for sections, widgets, tables, or charts 
 * where a full skeleton is unavailable or overkill.
 * 
 * Props:
 *   message   {string} — Optional text to display alongside/below the spinner
 *   minHeight {string} — Prevents layout shift while loading (e.g., 'min-h-[200px]')
 *   className {string} — Optional CSS classes
 */
export default function SectionLoader({ 
  message = 'Loading...', 
  minHeight = 'min-h-[200px]',
  className = '' 
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex flex-col items-center justify-center w-full ${minHeight} ${className}`}
    >
      <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
      {message && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {message}
        </p>
      )}
    </motion.div>
  );
}

import { motion } from 'framer-motion';

/**
 * EmptyState — Shared UI Primitive
 *
 * Replaces scattered "No data" blocks across the application.
 *
 * Props:
 *   icon        {ReactComponent} — Lucide icon to display
 *   title       {string}         — Main headline (e.g., "No products found")
 *   description {string}         — Secondary text explaining the state
 *   action      {ReactNode}      — Optional CTA (e.g., <button> or <Link>)
 *   variant     {'page'|'inline'}— 'page' is padded/centered, 'inline' fits inside cards
 *   className   {string}         — Extra Tailwind classes for layout overrides
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = 'page',
  className = ''
}) {
  const isInline = variant === 'inline';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex flex-col items-center justify-center text-center ${
        isInline ? 'py-8 px-4' : 'py-16 px-6 glass-card w-full'
      } ${className}`}
    >
      {Icon && (
        <div className={`mb-4 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 ${
          isInline ? 'w-12 h-12' : 'w-16 h-16'
        }`}>
          <Icon className={isInline ? 'w-6 h-6' : 'w-8 h-8'} />
        </div>
      )}
      
      <h3 className={`font-display font-bold text-heading mb-2 ${
        isInline ? 'text-lg' : 'text-xl md:text-2xl'
      }`}>
        {title}
      </h3>
      
      {description && (
        <p className={`text-slate-500 dark:text-slate-400 max-w-md ${
          isInline ? 'text-sm' : 'text-base'
        }`}>
          {description}
        </p>
      )}
      
      {action && (
        <div className={isInline ? 'mt-4' : 'mt-6'}>
          {action}
        </div>
      )}
    </motion.div>
  );
}

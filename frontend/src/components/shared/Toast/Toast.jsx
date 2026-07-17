import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, Loader2, X } from 'lucide-react';

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  loading: Loader2
};

const styles = {
  success: 'border-green-500/20 bg-green-50/95 text-green-800 dark:bg-green-900/40 dark:border-green-900/50 dark:text-green-300',
  error: 'border-red-500/20 bg-red-50/95 text-red-800 dark:bg-red-900/40 dark:border-red-900/50 dark:text-red-300',
  warning: 'border-amber-500/20 bg-amber-50/95 text-amber-800 dark:bg-amber-900/40 dark:border-amber-900/50 dark:text-amber-300',
  info: 'border-blue-500/20 bg-blue-50/95 text-blue-800 dark:bg-blue-900/40 dark:border-blue-900/50 dark:text-blue-300',
  loading: 'border-slate-200 bg-white/95 text-slate-800 dark:bg-slate-900/95 dark:border-slate-800 dark:text-slate-200'
};

const iconStyles = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
  loading: 'text-slate-500 animate-spin'
};

export default function Toast({ toast, onDismiss }) {
  const Icon = icons[toast.type] || Info;
  const style = styles[toast.type] || styles.info;
  const iconStyle = iconStyles[toast.type] || iconStyles.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg ${style}`}
      role="alert"
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconStyle}`} />
      <div className="flex-1 min-w-0">
        {toast.title && <p className="text-sm font-semibold mb-1">{toast.title}</p>}
        {toast.description && <p className="text-sm opacity-90 leading-relaxed">{toast.description}</p>}
      </div>
      <button 
        onClick={onDismiss}
        className="shrink-0 p-1 rounded-lg opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

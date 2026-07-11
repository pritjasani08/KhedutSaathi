import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { safeAppReload } from '../../utils/errorUtils';

/**
 * A shared UI primitive for displaying errors across the application.
 * Can be used by ErrorBoundary, API errors, network failures, etc.
 * 
 * @param {Object} props
 * @param {'page' | 'component'} props.variant - Determines layout scale and padding
 * @param {string} props.title - The primary error headline
 * @param {string} props.message - User-friendly explanation
 * @param {Function} [props.onRetry] - Callback for the retry action
 * @param {boolean} [props.showHome=false] - Whether to show the safe reload (Home) button
 * @param {React.ElementType} [props.icon] - Optional custom Lucide icon (defaults to AlertTriangle)
 */
export default function ErrorDisplay({
  variant = 'page',
  title = 'Something went wrong',
  message = "We're having trouble loading this content. Please try again.",
  onRetry,
  showHome = false,
  icon: Icon = AlertTriangle
}) {
  const isPageLevel = variant === 'page';

  return (
    <div className={`flex flex-col items-center justify-center text-center ${isPageLevel ? 'min-h-[60vh] px-4' : 'h-full w-full min-h-[200px] p-6 glass-card border-red-100 dark:border-red-900/30'}`}>
      <div className={`rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center mb-4 ${isPageLevel ? 'w-20 h-20' : 'w-12 h-12'}`}>
        <Icon className={isPageLevel ? 'w-10 h-10' : 'w-6 h-6'} />
      </div>
      
      <h2 className={`font-bold text-heading mb-2 ${isPageLevel ? 'text-2xl md:text-3xl' : 'text-lg'}`}>
        {title}
      </h2>
      
      <p className={`text-slate-500 mb-6 max-w-md ${isPageLevel ? 'text-base' : 'text-sm'}`}>
        {message}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button 
            onClick={onRetry}
            className={`btn-primary flex items-center gap-2 ${isPageLevel ? 'px-6 py-2.5' : 'px-4 py-2 text-sm'}`}
          >
            <RefreshCcw className={isPageLevel ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
            Try Again
          </button>
        )}
        
        {showHome && isPageLevel && (
          <button 
            onClick={safeAppReload}
            className={`btn-secondary flex items-center gap-2 ${isPageLevel ? 'px-6 py-2.5' : 'px-4 py-2 text-sm'}`}
          >
            <Home className={isPageLevel ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
            Return Home
          </button>
        )}
      </div>
    </div>
  );
}

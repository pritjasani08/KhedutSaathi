import React from 'react';

export function PageLayout({ children }) {
  return (
    <div className="min-h-screen gradient-bg pt-24 pb-24 text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/30">
      {children}
    </div>
  );
}

export function PageHeader({ title, subtitle, rightContent, children }) {
  return (
    <header className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[32px] sm:text-[36px] font-extrabold text-heading tracking-tight mb-3">
            {title}
          </h1>
          {subtitle && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-[15px] text-slate-500 font-medium">
              {subtitle}
            </div>
          )}
          {children}
        </div>
        {rightContent && (
          <div className="flex items-center gap-4">
            {rightContent}
          </div>
        )}
      </div>
    </header>
  );
}

export function PageContent({ children, className = '' }) {
  return (
    <main className={`max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8 ${className}`}>
      {children}
    </main>
  );
}

import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Card Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center h-full min-h-[150px] border-red-100 dark:border-red-900/30">
          <p className="text-sm font-semibold text-red-500 mb-2">Failed to load content</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="text-xs text-slate-500 hover:text-primary underline"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

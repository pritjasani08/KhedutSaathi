import React from 'react';
import ErrorDisplay from './shared/ErrorDisplay';
import { generateErrorId } from '../utils/errorUtils';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const errorId = generateErrorId();
    // In the future, this errorId will be sent to a tracking backend.
    console.error(`[${errorId}] ErrorBoundary caught an error:`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background pt-24 pb-16 flex items-center justify-center">
          <ErrorDisplay 
            variant="page"
            title="We hit a snag"
            message="The application encountered an unexpected problem. Please try again or return home."
            onRetry={this.handleRetry}
            showHome={true}
          />
        </div>
      );
    }
    
    return this.props.children;
  }
}

export default ErrorBoundary;

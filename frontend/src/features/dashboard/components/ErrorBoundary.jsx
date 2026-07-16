import React from 'react';
import ErrorDisplay from '../../../components/shared/ErrorDisplay';
import { generateErrorId } from '../../../utils/errorUtils';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const errorId = generateErrorId();
    console.error(`[${errorId}] Dashboard Component Error:`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorDisplay 
          variant="component"
          title="Widget unavailable"
          message="Failed to load this dashboard widget."
          onRetry={this.handleRetry}
          showHome={false}
        />
      );
    }

    return this.props.children;
  }
}

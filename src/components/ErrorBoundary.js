/*
 ErrorBoundary.js - React Error Boundary Component
 
 This class component catches JavaScript errors in the component tree:
 - Provides graceful error handling for React components
 - Displays user-friendly error messages
 - Shows detailed error information in development mode
 - Includes refresh functionality for error recovery
 - Logs errors for debugging purposes
 
 Ensures the application remains stable even when errors occur in child components.
 */

import React from 'react';
import './ErrorBoundary.css';

/*
 Error Boundary component to catch and handle React errors gracefully
 Provides user-friendly error messages and debugging info in development
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In a production app, you might want to send this to an error reporting service
    // Example: logErrorToService(error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Custom error UI
      return (
        <div className="error-container">
          <h2 className="error-title">
            Something went wrong
          </h2>
          <p className="error-message">
            We're sorry, but something unexpected happened. Please try refreshing the page.
          </p>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="error-details">
              <summary className="error-summary">
                Error Details (Development Mode)
              </summary>
              <pre className="error-pre">
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="error-refresh-button"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

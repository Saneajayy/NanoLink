import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-8 bg-white border border-neutral-200 my-8 max-w-2xl mx-auto rounded-xl">
          <div className="flex items-center gap-3 mb-4 border-b border-neutral-200 pb-4">
            <div className="w-10 h-10 bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Something went wrong</h2>
              <p className="text-xs font-light text-neutral-500">An error occurred while rendering this component.</p>
            </div>
          </div>

          <div className="p-4 bg-neutral-50 border border-neutral-200 mb-6 overflow-x-auto rounded-lg">
            <p className="font-mono text-xs font-semibold text-red-600 break-all">
              {this.state.error && this.state.error.toString()}
            </p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white font-semibold text-xs rounded-lg flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

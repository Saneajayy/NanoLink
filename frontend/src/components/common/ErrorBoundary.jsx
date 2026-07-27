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
        <div className="p-8 bg-white border-2 border-black my-8 max-w-2xl mx-auto shadow-xl">
          <div className="flex items-center gap-3 mb-4 border-b border-black pb-4">
            <div className="w-10 h-10 bg-[#FF6206] text-white flex items-center justify-center font-black shrink-0 border border-black">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#1A00FF]">Something went wrong</h2>
              <p className="text-xs font-semibold text-[#1A00FF]/70">An error occurred while rendering this component.</p>
            </div>
          </div>

          <div className="p-4 bg-[#FF6206]/10 border border-black mb-6 overflow-x-auto">
            <p className="font-mono text-xs font-extrabold text-[#1A00FF] break-all">
              {this.state.error && this.state.error.toString()}
            </p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 bg-[#1A00FF] hover:bg-[#1A00FF]/90 text-white font-extrabold text-xs border border-black flex items-center gap-2 transition-all hover:translate-x-[2px] hover:translate-y-[2px]"
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

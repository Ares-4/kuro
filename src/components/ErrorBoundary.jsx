import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl text-center">
            <div className="mx-auto w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-slate-400 mb-6">
              We encountered an unexpected error. Please try reloading the page or return to the homepage.
            </p>

            {/* Use import.meta.env.DEV instead of process.env.NODE_ENV */}
            {import.meta.env.DEV && (
              <div className="bg-slate-950 p-4 rounded border border-slate-800 mb-6 overflow-auto max-h-48 text-left">
                <p className="text-red-400 font-mono text-xs break-words mb-2">
                  {this.state.error && this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-slate-500 text-[10px] overflow-auto whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Button onClick={this.handleReload} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 justify-center">
                <RefreshCcw className="w-4 h-4" />
                Reload Page
              </Button>
              <Button onClick={this.handleGoHome} variant="outline" className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 justify-center">
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </div>
            
            <p className="mt-8 text-xs text-slate-600">
              If the problem persists, please contact support at support@kuro-ed.com
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
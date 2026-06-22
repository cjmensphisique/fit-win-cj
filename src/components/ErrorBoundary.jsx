import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#111] text-white p-6 font-sans">
          <div className="max-w-md w-full bg-[#161616] border border-[#222] p-8 rounded-3xl text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-3xl rounded-full" />
            
            <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto text-yellow-500">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight">Something Went Wrong</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                An unexpected page crash occurred. We have logged the details and are looking into it.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 rounded-xl text-left font-mono text-[10px] text-gray-500 max-h-32 overflow-y-auto whitespace-pre-wrap select-all">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-yellow-500 hover:bg-yellow-400 text-black transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Reload Page
              </button>
              <a
                href="/"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-[#222] hover:bg-[#333] border border-[#333] hover:border-[#444] text-white transition-all text-center"
              >
                <Home className="w-4 h-4" /> Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
